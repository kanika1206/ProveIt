"""
Groq AI client — singleton with retry logic, token logging, and fallback.

Two layers:
  1. QuestionGenerator — generates fresh MCQ questions per assessment
  2. StudyPlanGenerator — personalized study plan from wrong answers
  3. RubricGrader — grades System Design open answers
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx

from app.core.config import settings
from app.db.redis_client import redis_delete, redis_get, redis_set

logger = logging.getLogger(__name__)

TOPIC_DISTRIBUTION = {
    "dsa": {"arrays": 0.30, "trees": 0.25, "graphs": 0.20, "dp": 0.15, "strings": 0.10},
    "aptitude": {"quantitative": 0.40, "logical": 0.35, "verbal": 0.25},
    "system_design": {"scalability": 0.30, "databases": 0.25, "caching": 0.20, "networking": 0.25},
}

DIFFICULTY_DISTRIBUTION = {"easy": 0.20, "medium": 0.60, "hard": 0.20}

QUESTION_SYSTEM_PROMPT = """You are a DSA question generator for a placement assessment platform.
Generate exactly {count} MCQ questions.
Topic distribution: {topic_distribution}.
Difficulty distribution: {difficulty_distribution}.

Each question MUST have this exact JSON structure:
{{
  "id": "q001",
  "topic": "arrays",
  "difficulty": "medium",
  "question_text": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct_index": 2,
  "explanation": "...",
  "tags": ["two-pointer", "sliding-window"]
}}

Return ONLY a valid JSON array. No preamble, no markdown, no backticks.
Ensure questions test genuine algorithmic thinking, not syntax memorisation.
Vary the question style:
- Some give code and ask for output/complexity
- Some describe a problem and ask to identify the correct algorithm
- Some give a scenario and ask which data structure is optimal
Every question must have exactly 4 options and exactly one correct answer."""

APTITUDE_SYSTEM_PROMPT = """You are an aptitude question generator for placement assessments.
Generate exactly {count} MCQ questions covering: {topic_distribution}.
Difficulty: {difficulty_distribution}.
Mix quantitative reasoning, logical puzzles, and verbal comprehension.
Return ONLY a valid JSON array with the same schema as DSA questions."""

SYSTEM_DESIGN_PROMPT = """You are a system design question generator for placement assessments.
Generate exactly {count} short-answer questions on: {topic_distribution}.
Each question should require a 3-5 sentence answer covering architecture decisions.
JSON schema: {{"id": "q001", "topic": "scalability", "difficulty": "medium",
"question_text": "...", "options": [], "correct_index": -1,
"explanation": "...", "rubric": ["point1", "point2", "point3"], "tags": []}}
Return ONLY a valid JSON array."""


# Groq HTTP Client 

class GroqClient:
    """Singleton HTTP client for Groq API with retry logic."""
    _instance: GroqClient | None = None

    def __new__(cls) -> GroqClient:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return
        self._initialized = True
        self._client = httpx.AsyncClient(
            base_url=settings.groq_base_url,
            timeout=httpx.Timeout(60.0),
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
        )
        self._token_log: list[dict] = []

    async def complete(
        self,
        model: str,
        messages: list[dict],
        max_tokens: int = 4096,
        temperature: float = 0.7,
        max_retries: int = 3,
    ) -> tuple[str, dict]:
        """
        Call Groq completion with exponential backoff retry.
        Returns (content, usage_dict).
        """
        if not settings.groq_configured:
            raise RuntimeError("Groq API key not configured")

        last_error: Exception | None = None
        for attempt in range(max_retries):
            try:
                t0 = time.monotonic()
                resp = await self._client.post(
                    "/chat/completions",
                    json={
                        "model": model,
                        "messages": messages,
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                    },
                )
                latency_ms = int((time.monotonic() - t0) * 1000)
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                usage = data.get("usage", {})
                usage["latency_ms"] = latency_ms
                self._token_log.append({"model": model, "usage": usage, "ts": time.time()})
                return content, usage
            except Exception as e:
                last_error = e
                wait = 2 ** attempt
                logger.warning("Groq attempt %d failed: %s — retrying in %ds", attempt + 1, e, wait)
                await asyncio.sleep(wait)

        raise RuntimeError(f"Groq API failed after {max_retries} attempts: {last_error}")

    def get_stats(self) -> dict:
        """Aggregate token usage stats for the AI Health panel."""
        if not self._token_log:
            return {"total_calls": 0, "total_prompt_tokens": 0,
                    "total_completion_tokens": 0, "avg_latency_ms": 0}
        return {
            "total_calls": len(self._token_log),
            "total_prompt_tokens": sum(e["usage"].get("prompt_tokens", 0) for e in self._token_log),
            "total_completion_tokens": sum(e["usage"].get("completion_tokens", 0) for e in self._token_log),
            "avg_latency_ms": int(sum(e["usage"].get("latency_ms", 0) for e in self._token_log) / len(self._token_log)),
        }


groq_client = GroqClient()


# Fallback Question Bank

def _load_fallback_bank() -> list[dict]:
    path = Path(settings.ai_fallback_question_bank_path)
    if path.exists():
        with open(path) as f:
            return json.load(f)
    # Inline seed bank — 10 representative questions
    return [
        {
            "id": f"seed_{i:03d}",
            "topic": topic,
            "difficulty": diff,
            "question_text": q,
            "options": ["A. O(n)", "B. O(n log n)", "C. O(n²)", "D. O(log n)"],
            "correct_index": 1,
            "explanation": "Binary search on a sorted array achieves O(log n).",
            "tags": [topic],
        }
        for i, (topic, diff, q) in enumerate([
            ("arrays", "easy", "What is the time complexity of accessing an element in an array by index?"),
            ("arrays", "medium", "Given an unsorted array, find the two numbers that sum to a target. Best time complexity?"),
            ("trees", "medium", "What traversal visits nodes in left-root-right order?"),
            ("trees", "hard", "A balanced BST has n nodes. What is the height?"),
            ("graphs", "medium", "BFS vs DFS: which uses a queue?"),
            ("graphs", "hard", "Dijkstra's algorithm assumes edges have what property?"),
            ("dp", "medium", "The Fibonacci sequence computed with memoisation has what time complexity?"),
            ("dp", "hard", "Longest Common Subsequence of two strings of length m and n has what complexity?"),
            ("strings", "easy", "KMP pattern matching avoids redundant comparisons using what?"),
            ("strings", "medium", "Rabin-Karp rolling hash runs in what average time?"),
        ])
    ]


_FALLBACK_BANK: list[dict] | None = None


def get_fallback_bank() -> list[dict]:
    global _FALLBACK_BANK
    if _FALLBACK_BANK is None:
        _FALLBACK_BANK = _load_fallback_bank()
    return _FALLBACK_BANK


# ─Question Cache 

class QuestionCache:
  

    def _make_key(self, assessment_type: str, count: int) -> str:
        topic = json.dumps(TOPIC_DISTRIBUTION.get(assessment_type, {}), sort_keys=True)
        diff = json.dumps(DIFFICULTY_DISTRIBUTION, sort_keys=True)
        topic_hash = hashlib.sha256(topic.encode()).hexdigest()[:16]
        diff_hash = hashlib.sha256(diff.encode()).hexdigest()[:16]
        return f"questions:{assessment_type}:{count}:{topic_hash}:{diff_hash}"

    async def get(self, assessment_type: str, count: int) -> list[dict] | None:
        key = self._make_key(assessment_type, count)
        data = await redis_get(key)
        if data and isinstance(data, list):
            logger.info("Question cache HIT for %s count=%d", assessment_type, count)
            return data
        logger.info("Question cache MISS for %s count=%d", assessment_type, count)
        return None

    async def set(self, assessment_type: str, count: int, questions: list[dict]) -> None:
        key = self._make_key(assessment_type, count)
        await redis_set(key, questions, ttl=settings.question_cache_ttl_seconds)

    async def invalidate(self, assessment_type: str, count: int) -> None:
        key = self._make_key(assessment_type, count)
        await redis_delete(key)


question_cache = QuestionCache()


# Question Generator 

@dataclass
class GenerationResult:
    questions: list[dict]
    generated_by: str      # "groq" | "fallback"
    latency_ms: int
    fallback_triggered: bool
    cache_hit: bool
    prompt_tokens: int = 0
    completion_tokens: int = 0


class QuestionGenerator:
    

    def __init__(self) -> None:
        self.cache = question_cache
        self.client = groq_client

    async def generate(
        self,
        assessment_type: str,
        count: int = 15,
        use_cache: bool = True,
    ) -> GenerationResult:
        # 1. Check cache
        if use_cache:
            cached = await self.cache.get(assessment_type, count)
            if cached:
                return GenerationResult(
                    questions=cached,
                    generated_by="groq",
                    latency_ms=0,
                    fallback_triggered=False,
                    cache_hit=True,
                )

        # 2. Try Groq (up to 2 attempts)
        if settings.groq_configured:
            for attempt in range(2):
                try:
                    result = await self._generate_via_groq(assessment_type, count, strict=(attempt == 1))
                    await self.cache.set(assessment_type, count, result.questions)
                    return result
                except Exception as e:
                    logger.warning("Groq question gen attempt %d failed: %s", attempt + 1, e)
                    if attempt == 0:
                        await asyncio.sleep(1)

        # 3. Fallback to seed bank
        logger.warning("Falling back to seed question bank for %s", assessment_type)
        import random
        bank = get_fallback_bank()
        selected = random.sample(bank, min(count, len(bank)))
        if len(selected) < count:
            selected = (selected * (count // len(selected) + 1))[:count]
        return GenerationResult(
            questions=selected,
            generated_by="fallback",
            latency_ms=0,
            fallback_triggered=True,
            cache_hit=False,
        )

    async def _generate_via_groq(
        self, assessment_type: str, count: int, strict: bool = False
    ) -> GenerationResult:
        topic_dist = json.dumps(TOPIC_DISTRIBUTION.get(assessment_type, TOPIC_DISTRIBUTION["dsa"]))
        diff_dist = json.dumps(DIFFICULTY_DISTRIBUTION)

        if assessment_type == "aptitude":
            sys_prompt = APTITUDE_SYSTEM_PROMPT.format(
                count=count,
                topic_distribution=topic_dist,
                difficulty_distribution=diff_dist,
            )
        elif assessment_type == "system_design":
            sys_prompt = SYSTEM_DESIGN_PROMPT.format(
                count=count,
                topic_distribution=topic_dist,
                difficulty_distribution=diff_dist,
            )
        else:
            sys_prompt = QUESTION_SYSTEM_PROMPT.format(
                count=count,
                topic_distribution=topic_dist,
                difficulty_distribution=diff_dist,
            )

        strictness = " Return ONLY raw JSON. Absolutely no other text." if strict else ""
        messages = [
            {"role": "system", "content": sys_prompt + strictness},
            {"role": "user", "content": f"Generate {count} questions now."},
        ]

        t0 = time.monotonic()
        content, usage = await self.client.complete(
            model=settings.groq_question_model,
            messages=messages,
            max_tokens=4096,
            temperature=0.8,
        )
        latency_ms = int((time.monotonic() - t0) * 1000)

        # Parse JSON — strip any accidental markdown
        content = content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()

        questions = json.loads(content)
        if not isinstance(questions, list):
            raise ValueError("Groq returned non-list")
        if len(questions) < count // 2:
            raise ValueError(f"Too few questions: got {len(questions)}, expected {count}")

        # Deduplicate by content hash
        seen_hashes: set[str] = set()
        unique = []
        for q in questions:
            h = hashlib.sha256(q.get("question_text", "").encode()).hexdigest()[:16]
            if h not in seen_hashes:
                seen_hashes.add(h)
                unique.append(q)

        return GenerationResult(
            questions=unique[:count],
            generated_by="groq",
            latency_ms=latency_ms,
            fallback_triggered=False,
            cache_hit=False,
            prompt_tokens=usage.get("prompt_tokens", 0),
            completion_tokens=usage.get("completion_tokens", 0),
        )

    async def generate_test_cases(
        self, problem_statement: str, count: int = 5
    ) -> list[dict]:
       
        if not settings.groq_configured:
            return [{"input": "1 2", "expected_output": "3", "hidden": True}]

        messages = [
            {
                "role": "system",
                "content": (
                    "You generate hidden test cases for coding problems. "
                    f"Generate exactly {count} test cases as a JSON array: "
                    '[{"input": "...", "expected_output": "...", "hidden": true}]. '
                    "Include edge cases. Return ONLY JSON."
                ),
            },
            {"role": "user", "content": f"Problem: {problem_statement}"},
        ]
        try:
            content, _ = await self.client.complete(
                model=settings.groq_question_model,
                messages=messages,
                max_tokens=1024,
                temperature=0.3,
            )
            content = content.strip().lstrip("```json").rstrip("```").strip()
            return json.loads(content)
        except Exception as e:
            logger.error("Test case generation failed: %s", e)
            return []


#  Study Plan Generator 

HARDCODED_RESOURCES = {
    "arrays": ["https://neetcode.io/problems/two-sum", "https://cp-algorithms.com/data_structures/segment_tree.html"],
    "trees": ["https://neetcode.io/roadmap", "https://visualgo.net/en/bst"],
    "graphs": ["https://cp-algorithms.com/graph/bfs.html", "https://neetcode.io/problems/number-of-islands"],
    "dp": ["https://atcoder.jp/contests/dp", "https://neetcode.io/problems/climbing-stairs"],
    "strings": ["https://cp-algorithms.com/string/prefix-function.html"],
    "quantitative": ["https://www.indiabix.com/aptitude/questions-and-answers/"],
    "logical": ["https://www.indiabix.com/logical-reasoning/questions-and-answers/"],
}


class StudyPlanGenerator:
    

    def __init__(self) -> None:
        self.client = groq_client

    async def generate(
        self,
        incorrect_tags: list[str],
        per_tag_scores: dict[str, float],
        assessment_type: str,
    ) -> dict:
        if settings.groq_configured:
            try:
                return await self._groq_plan(incorrect_tags, per_tag_scores, assessment_type)
            except Exception as e:
                logger.warning("Study plan via Groq failed: %s — using rule-based fallback", e)

        return self._rule_based_plan(incorrect_tags, per_tag_scores)

    async def _groq_plan(
        self,
        incorrect_tags: list[str],
        per_tag_scores: dict[str, float],
        assessment_type: str,
    ) -> dict:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a placement coach. Given a student's weak topics, "
                    "create a structured study plan. Return JSON: "
                    '{"summary": "...", "topics": [{"topic": "...", '
                    '"priority": 1, "estimated_hours": 3, "why": "...", '
                    '"resources": ["url1"]}], "total_weeks": 2}'
                    " Return ONLY JSON."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Assessment type: {assessment_type}\n"
                    f"Weak topics: {incorrect_tags}\n"
                    f"Scores by tag: {json.dumps(per_tag_scores)}"
                ),
            },
        ]
        content, _ = await self.client.complete(
            model=settings.groq_study_plan_model,
            messages=messages,
            max_tokens=2048,
            temperature=0.4,
        )
        content = content.strip().lstrip("```json").rstrip("```").strip()
        return json.loads(content)

    def _rule_based_plan(
        self, incorrect_tags: list[str], per_tag_scores: dict[str, float]
    ) -> dict:
        topics = []
        for i, tag in enumerate(sorted(incorrect_tags, key=lambda t: per_tag_scores.get(t, 0))):
            topics.append({
                "topic": tag,
                "priority": i + 1,
                "estimated_hours": max(2, int((1 - per_tag_scores.get(tag, 0)) * 10)),
                "why": f"You scored {per_tag_scores.get(tag, 0):.0%} on {tag} questions.",
                "resources": HARDCODED_RESOURCES.get(tag, ["https://neetcode.io/roadmap"]),
            })
        return {
            "summary": f"Focus on {len(incorrect_tags)} weak areas to boost your placement readiness.",
            "topics": topics,
            "total_weeks": max(1, len(incorrect_tags) // 2),
        }


#  Rubric Grader 

class RubricGrader:
    

    def __init__(self) -> None:
        self.client = groq_client

    async def grade(
        self, question_text: str, rubric: list[str], student_answer: str
    ) -> dict:
        if not settings.groq_configured or not student_answer.strip():
            return {"score": 0.5, "feedback": "Unable to grade — AI unavailable.", "points": []}

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a technical interviewer grading a system design answer. "
                    "Return JSON: {\"score\": 0.0-1.0, \"feedback\": \"...\", "
                    "\"points\": [{\"criterion\": \"...\", \"met\": true, \"comment\": \"...\"}]}"
                    " Return ONLY JSON."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Question: {question_text}\n"
                    f"Rubric points: {rubric}\n"
                    f"Student answer: {student_answer}"
                ),
            },
        ]
        try:
            content, _ = await self.client.complete(
                model=settings.groq_study_plan_model,
                messages=messages,
                max_tokens=1024,
                temperature=0.2,
            )
            content = content.strip().lstrip("```json").rstrip("```").strip()
            return json.loads(content)
        except Exception as e:
            logger.error("Rubric grading failed: %s", e)
            return {"score": 0.5, "feedback": "Grading unavailable.", "points": []}