"""
Proctoring Sandbox — OS-level process isolation for code execution.
This is made exclusively for windows support, as Linux can use resource.setrlimit for robust limits.
On Linux: uses resource.setrlimit for CPU, memory, file size limits.
On Windows: uses subprocess timeout only (resource module unavailable).
"""
from __future__ import annotations

import os
import platform
import signal
import subprocess
import sys
import tempfile
import time
import logging
from dataclasses import dataclass, field
from pathlib import Path

logger = logging.getLogger(__name__)

IS_WINDOWS = platform.system() == "Windows"

CPU_TIME_LIMIT = 5
MEMORY_LIMIT = 256 * 1024 * 1024
FILE_SIZE_LIMIT = 0
WALL_CLOCK_TIMEOUT = 6

# Only import resource on Linux
if not IS_WINDOWS:
    import resource

    def _set_resource_limits() -> None:
        resource.setrlimit(resource.RLIMIT_CPU, (CPU_TIME_LIMIT, CPU_TIME_LIMIT))
        resource.setrlimit(resource.RLIMIT_AS, (MEMORY_LIMIT, MEMORY_LIMIT))
        resource.setrlimit(resource.RLIMIT_FSIZE, (FILE_SIZE_LIMIT, FILE_SIZE_LIMIT))
        try:
            resource.setrlimit(resource.RLIMIT_NPROC, (1, 1))
        except (AttributeError, ValueError):
            pass
else:
    def _set_resource_limits() -> None:
        pass  # No-op on Windows


@dataclass
class ExecutionResult:
    stdout: str
    stderr: str
    exit_code: int
    cpu_time_ms: int
    timed_out: bool
    memory_exceeded: bool
    suspicious_syscalls: list[str] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return self.exit_code == 0 and not self.timed_out and not self.memory_exceeded


@dataclass
class TestCase:
    input_data: str
    expected_output: str
    hidden: bool = False


@dataclass
class SubmissionResult:
    passed: bool
    score: float
    test_results: list[dict]
    total_tests: int
    passed_tests: int
    execution_time_ms: int
    integrity_flags: list[str]


class CodeSandbox:
    """
    Executes student code in a resource-constrained subprocess.
    On Linux: full OS-level limits via resource.setrlimit.
    On Windows: wall-clock timeout only.
    """

    def run_code(self, code: str, language: str, input_data: str = "") -> ExecutionResult:
        if language != "python":
            return ExecutionResult(
                stdout="",
                stderr=f"Language {language} not supported in sandbox",
                exit_code=1,
                cpu_time_ms=0,
                timed_out=False,
                memory_exceeded=False,
            )
        return self._run_python(code, input_data)

    def _run_python(self, code: str, input_data: str) -> ExecutionResult:
        # Use temp dir that works on both Windows and Linux
        tmp_dir = tempfile.gettempdir()

        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".py", delete=False, dir=tmp_dir
        ) as f:
            f.write(code)
            code_path = f.name

        try:
            t0 = time.monotonic()

            # preexec_fn only works on Unix
            preexec = None if IS_WINDOWS else _set_resource_limits

            proc = subprocess.Popen(
                [sys.executable, code_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=preexec,
                cwd=tmp_dir,
            )

            timed_out = False
            memory_exceeded = False
            suspicious = []

            try:
                stdout_bytes, stderr_bytes = proc.communicate(
                    input=input_data.encode(),
                    timeout=WALL_CLOCK_TIMEOUT,
                )
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait()
                timed_out = True
                stdout_bytes, stderr_bytes = b"", b"Process timed out"
                suspicious.append("TIMEOUT")
            except MemoryError:
                proc.kill()
                proc.wait()
                memory_exceeded = True
                stdout_bytes, stderr_bytes = b"", b"Memory limit exceeded"

            elapsed_ms = int((time.monotonic() - t0) * 1000)
            stderr_str = stderr_bytes.decode(errors="replace")

            if "MemoryError" in stderr_str or "Killed" in stderr_str:
                memory_exceeded = True

            # Check for suspicious patterns in code
            if any(m in code for m in ["import socket", "import urllib", "import requests"]):
                suspicious.append("NETWORK_IMPORT")
            if "import subprocess" in code or ("import os" in code and "system" in code):
                suspicious.append("SUBPROCESS_IMPORT")
            if "__import__" in code and any(m in code for m in ["socket", "urllib", "os"]):
                suspicious.append("DYNAMIC_IMPORT")

            return ExecutionResult(
                stdout=stdout_bytes.decode(errors="replace"),
                stderr=stderr_str,
                exit_code=proc.returncode or 0,
                cpu_time_ms=elapsed_ms,
                timed_out=timed_out,
                memory_exceeded=memory_exceeded,
                suspicious_syscalls=suspicious,
            )
        finally:
            try:
                os.unlink(code_path)
            except OSError:
                pass


class AssessmentScorer:
    def __init__(self) -> None:
        self.sandbox = CodeSandbox()

    def score_mcq(
        self,
        questions: list[dict],
        answers: dict[str, int],
    ) -> tuple[float, dict[str, float]]:
        tag_correct: dict[str, int] = {}
        tag_total: dict[str, int] = {}
        correct = 0

        for q in questions:
            qid = q.get("id", "")
            tags = q.get("tags", [q.get("topic", "unknown")])
            selected = answers.get(qid, -1)
            is_correct = selected == q.get("correct_index", -99)

            if is_correct:
                correct += 1

            for tag in tags:
                tag_total[tag] = tag_total.get(tag, 0) + 1
                if is_correct:
                    tag_correct[tag] = tag_correct.get(tag, 0) + 1

        overall = correct / len(questions) if questions else 0.0
        per_tag = {
            tag: tag_correct.get(tag, 0) / tag_total[tag]
            for tag in tag_total
        }
        return overall, per_tag

    async def score_coding(
        self,
        code: str,
        language: str,
        test_cases: list[TestCase],
    ) -> SubmissionResult:
        results = []
        passed = 0
        total_time = 0
        flags = []

        for tc in test_cases:
            result = self.sandbox.run_code(code, language, tc.input_data)
            actual = result.stdout.strip()
            expected = tc.expected_output.strip()
            ok = actual == expected and result.exit_code == 0 and not result.timed_out

            if ok:
                passed += 1
            total_time += result.cpu_time_ms
            flags.extend(result.suspicious_syscalls)

            if not tc.hidden:
                results.append({
                    "passed": ok,
                    "input": tc.input_data,
                    "expected": expected,
                    "actual": actual,
                    "timed_out": result.timed_out,
                    "time_ms": result.cpu_time_ms,
                })
            else:
                results.append({
                    "passed": ok,
                    "input": "hidden",
                    "expected": "hidden",
                    "actual": "hidden",
                    "timed_out": result.timed_out,
                    "time_ms": result.cpu_time_ms,
                })

        score = passed / len(test_cases) if test_cases else 0.0
        return SubmissionResult(
            passed=score >= 0.5,
            score=score,
            test_results=results,
            total_tests=len(test_cases),
            passed_tests=passed,
            execution_time_ms=total_time,
            integrity_flags=list(set(flags)),
        )