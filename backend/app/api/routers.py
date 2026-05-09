
from __future__ import annotations

import hashlib
import json
import logging
import time
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.redis_client import get_redis, redis_get, redis_hgetall, redis_set
from app.db.session import get_db
from app.domains.ai.generator import (
    QuestionGenerator,
    RubricGrader,
    StudyPlanGenerator,
    groq_client,
)
from app.domains.assessment.sandbox import AssessmentScorer, TestCase
from app.domains.auth.utils import (
    CurrentUser,
    create_access_token,
    generate_pseudonym,
    hash_password,
    verify_password,
)
from app.domains.fl.federated import RoundOrchestrator
from app.domains.intelligence.gossip import GossipNode, LocalDifferentialPrivacy, PlacementSignal
from app.domains.ledger.chain import LedgerChain
from app.domains.proofs.commitment import CommitmentGenerator, generate_keypair
from app.domains.proofs.verifier import ProofVerifier, SkillProofData, generate_simplified_proof
from app.models.tables import (
    AICallType,
    AIGenerationLog,
    Assessment,
    AssessmentType,
    Commitment,
    College,
    CollegeTier,
    FLRound,
    GeneratedQuestion,
    LedgerEntry,
    PlacementSignal as PlacementSignalModel,
    SkillProof,
    User,
)

logger = logging.getLogger(__name__)

# Singletons
_fl_orchestrator = RoundOrchestrator(strategy="fedavg")
_gossip_node = GossipNode(
    node_id=settings.fl_node_id,
    bootstrap_peers=settings.fl_bootstrap_peers.split(","),
)
_question_generator = QuestionGenerator()
_study_plan_gen = StudyPlanGenerator()
_rubric_grader = RubricGrader()
_commitment_gen = CommitmentGenerator()
_proof_verifier = ProofVerifier()
_scorer = AssessmentScorer()


# Auth Router (signup, login, logout)

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = None
    college_id: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


@auth_router.post("/signup", response_model=AuthResponse)
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    private_pem, public_pem = generate_keypair()
    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        hashed_password=hash_password(body.password),
        public_key=public_pem,
        college_id=body.college_id,
        full_name=body.full_name,
        pseudonym=generate_pseudonym(),
    )
    db.add(user)
    await db.flush()

    token = create_access_token(user.id, user.email)
    return AuthResponse(access_token=token, user_id=user.id, email=user.email)


@auth_router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.id, user.email)
    return AuthResponse(access_token=token, user_id=user.id, email=user.email)


@auth_router.post("/logout")
async def logout():
    return {"message": "Logged out"}


#Assessment Router (start, submit, results)

assessment_router = APIRouter(prefix="/api/assessments", tags=["assessments"])


class StartAssessmentRequest(BaseModel):
    assessment_type: str = "dsa"
    question_count: int = Field(default=10, ge=5, le=30)


class SubmitAnswerRequest(BaseModel):
    assessment_id: str
    answers: dict[str, int | str]  # question_id -> selected_index or text answer
    code_submissions: dict[str, str] | None = None  # question_id -> code


@assessment_router.get("")
async def list_assessments(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Assessment)
        .where(Assessment.user_id == user.id)
        .order_by(Assessment.started_at.desc())
        .limit(20)
    )
    assessments = result.scalars().all()
    return [
        {
            "id": a.id,
            "type": a.assessment_type,
            "score": a.score,
            "status": a.status,
            "started_at": a.started_at.isoformat() if a.started_at else None,
            "completed_at": a.completed_at.isoformat() if a.completed_at else None,
        }
        for a in assessments
    ]


@assessment_router.post("/start")
async def start_assessment(
    body: StartAssessmentRequest,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    
    assessment_type = body.assessment_type
    if assessment_type not in ("dsa", "system_design", "aptitude"):
        raise HTTPException(400, "Invalid assessment type")

    t0 = time.monotonic()

    # Generate questions via AI
    gen_result = await _question_generator.generate(
        assessment_type=assessment_type,
        count=body.question_count,
        use_cache=True,
    )

    latency_ms = int((time.monotonic() - t0) * 1000)

    # Create assessment record
    assessment = Assessment(
        id=str(uuid.uuid4()),
        user_id=user.id,
        assessment_type=AssessmentType(assessment_type),
        status="in_progress",
    )
    db.add(assessment)
    await db.flush()

    # Store generated questions with content hashes
    for q in gen_result.questions:
        content_hash = hashlib.sha256(
            json.dumps(q, sort_keys=True).encode()
        ).hexdigest()
        gq = GeneratedQuestion(
            id=str(uuid.uuid4()),
            assessment_id=assessment.id,
            content_hash=content_hash,
            question_json=q,
            generated_by=gen_result.generated_by,
            generation_latency_ms=latency_ms if not gen_result.cache_hit else 0,
        )
        db.add(gq)

    # Log AI generation 
    log = AIGenerationLog(
        id=str(uuid.uuid4()),
        call_type=AICallType.QUESTION,
        model=settings.groq_question_model,
        prompt_tokens=gen_result.prompt_tokens,
        completion_tokens=gen_result.completion_tokens,
        latency_ms=latency_ms,
        success=not gen_result.fallback_triggered,
        fallback_triggered=gen_result.fallback_triggered,
    )
    db.add(log)
    await db.flush()

    # Strip correct answers before sending to client
    client_questions = []
    for q in gen_result.questions:
        cq = {k: v for k, v in q.items() if k not in ("correct_index", "explanation")}
        client_questions.append(cq)

    return {
        "assessment_id": assessment.id,
        "assessment_type": assessment_type,
        "question_count": len(gen_result.questions),
        "questions": client_questions,
        "generated_by": gen_result.generated_by,
        "cache_hit": gen_result.cache_hit,
        "generation_latency_ms": latency_ms,
        "fallback_triggered": gen_result.fallback_triggered,
    }


@assessment_router.post("/submit")
async def submit_assessment(
    body: SubmitAnswerRequest,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Submit answers, compute score, generate commitment, append to ledger."""
    result = await db.execute(
        select(Assessment).where(
            Assessment.id == body.assessment_id,
            Assessment.user_id == user.id,
        )
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(404, "Assessment not found")
    if assessment.status == "completed":
        raise HTTPException(400, "Assessment already submitted")

    # Load questions
    q_result = await db.execute(
        select(GeneratedQuestion).where(
            GeneratedQuestion.assessment_id == assessment.id
        )
    )
    gen_questions = q_result.scalars().all()
    questions = [gq.question_json for gq in gen_questions]

    # Score
    int_answers = {
        k: int(v) if isinstance(v, (int, str)) and str(v).isdigit() else -1
        for k, v in body.answers.items()
    }
    score, per_tag_scores = _scorer.score_mcq(questions, int_answers)

    # Find wrong tags for study plan
    wrong_tags = [
        tag
        for tag, tag_score in per_tag_scores.items()
        if tag_score < 0.5
    ]

    # Update assessment
    assessment.score = score
    assessment.per_tag_scores = per_tag_scores
    assessment.status = "completed"
    assessment.completed_at = datetime.now(timezone.utc)
    assessment.integrity_flags = {"wrong_tags": wrong_tags}

    # Generate cryptographic commitment
    commitment_result = _commitment_gen.generate(score, user.public_key)
    commitment = Commitment(
        id=str(uuid.uuid4()),
        user_id=user.id,
        assessment_id=assessment.id,
        commitment_hash=commitment_result.commitment_hash,
        encrypted_salt=commitment_result.encrypted_salt,
        threshold_proven=None,
    )
    db.add(commitment)
    await db.flush()

    # Append to tamper-evident ledger
    ledger = LedgerChain(db)
    entry = await ledger.append(
        commitment_id=commitment.id,
        commitment_hash=commitment_result.commitment_hash,
        student_pseudonym=user.pseudonym,
        assessment_type=assessment.assessment_type.value,
    )
    await db.flush()

    # Generate study plan (async, best-effort)
    try:
        study_plan = await _study_plan_gen.generate(
            incorrect_tags=wrong_tags,
            per_tag_scores=per_tag_scores,
            assessment_type=assessment.assessment_type.value,
        )
        log2 = AIGenerationLog(
            id=str(uuid.uuid4()),
            call_type=AICallType.STUDY_PLAN,
            model=settings.groq_study_plan_model,
            latency_ms=0,
            success=True,
            fallback_triggered=not settings.groq_configured,
        )
        db.add(log2)
    except Exception as e:
        logger.error("Study plan generation failed: %s", e)
        study_plan = {"error": "Study plan unavailable"}

    # Cache study plan
    await redis_set(
        f"study_plan:{assessment.id}",
        study_plan,
        ttl=86400,
    )

    return {
        "assessment_id": assessment.id,
        "score": score,
        "percentage": f"{score * 100:.1f}%",
        "per_tag_scores": per_tag_scores,
        "commitment_hash": commitment_result.commitment_hash,
        "commitment_id": commitment.id,
        "ledger_entry_hash": entry.entry_hash,
        "study_plan": study_plan,
    }


@assessment_router.get("/{assessment_id}/result")
async def get_result(
    assessment_id: str,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Assessment).where(
            Assessment.id == assessment_id, Assessment.user_id == user.id
        )
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(404, "Assessment not found")

    study_plan = await redis_get(f"study_plan:{assessment_id}")

    return {
        "id": assessment.id,
        "type": assessment.assessment_type,
        "score": assessment.score,
        "per_tag_scores": assessment.per_tag_scores,
        "integrity_flags": assessment.integrity_flags,
        "status": assessment.status,
        "study_plan": study_plan,
    }


# Proofs Router  (generate, verify(public), list)

proofs_router = APIRouter(prefix="/api/proofs", tags=["proofs"])


class GenerateProofRequest(BaseModel):
    commitment_id: str
    threshold: float = Field(ge=0.0, le=1.0)


@proofs_router.post("/generate")
async def generate_proof(
    body: GenerateProofRequest,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Commitment).where(
            Commitment.id == body.commitment_id,
            Commitment.user_id == user.id,
        )
    )
    commitment = result.scalar_one_or_none()
    if not commitment:
        raise HTTPException(404, "Commitment not found")

    # Get the assessment score
    assessment_result = await db.execute(
        select(Assessment).where(Assessment.id == commitment.assessment_id)
    )
    assessment = assessment_result.scalar_one_or_none()
    if not assessment or assessment.score is None:
        raise HTTPException(400, "Assessment score not available")

    if assessment.score <= body.threshold:
        raise HTTPException(
            400,
            f"Score ({assessment.score:.2%}) does not exceed threshold ({body.threshold:.2%}). "
            "Cannot generate a valid proof.",
        )

    # Generate proof (browser would do this via snarkjs Web Worker)
    proof_json = generate_simplified_proof(
        commitment_hash=commitment.commitment_hash,
        score=assessment.score,
        threshold=body.threshold,
    )

    skill_proof = SkillProof(
        id=str(uuid.uuid4()),
        commitment_id=commitment.id,
        proof_json=proof_json,
        public_signals=proof_json.get("public_signals", []),
        threshold=body.threshold,
        is_valid=True,
    )
    db.add(skill_proof)
    await db.flush()

    return {
        "proof_id": skill_proof.id,
        "commitment_hash": commitment.commitment_hash,
        "threshold": body.threshold,
        "proof": proof_json,
        "verify_url": f"/verify/{skill_proof.id}",
    }


@proofs_router.get("/my")
async def list_my_proofs(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SkillProof, Commitment, Assessment)
        .join(Commitment, SkillProof.commitment_id == Commitment.id)
        .join(Assessment, Commitment.assessment_id == Assessment.id)
        .where(Commitment.user_id == user.id)
        .order_by(SkillProof.created_at.desc())
    )
    rows = result.all()
    return [
        {
            "proof_id": proof.id,
            "assessment_type": assessment.assessment_type,
            "threshold": proof.threshold,
            "commitment_hash": commitment.commitment_hash[:16] + "...",
            "is_valid": proof.is_valid,
            "created_at": proof.created_at.isoformat() if proof.created_at else None,
            "verify_url": f"/verify/{proof.id}",
        }
        for proof, commitment, assessment in rows
    ]


@proofs_router.get("/{proof_id}/verify")
async def verify_proof(proof_id: str, db: AsyncSession = Depends(get_db)):
    """Public endpoint — no auth required. Returns verification result without revealing score."""
    result = await db.execute(
        select(SkillProof, Commitment, Assessment)
        .join(Commitment, SkillProof.commitment_id == Commitment.id)
        .join(Assessment, Commitment.assessment_id == Assessment.id)
        .where(SkillProof.id == proof_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(404, "Proof not found")

    proof, commitment, assessment = row

    # Run verifier
    proof_data = SkillProofData(
        proof_json=proof.proof_json or {},
        public_signals=proof.public_signals or [],
        commitment_hash=commitment.commitment_hash,
        threshold=proof.threshold,
        assessment_type=assessment.assessment_type.value,
    )
    verification = _proof_verifier.verify(proof_data)

    # Update verified_at
    if not proof.verified_at:
        proof.verified_at = datetime.now(timezone.utc)
        proof.is_valid = verification.is_valid

    return {
        "proof_id": proof_id,
        "is_valid": verification.is_valid,
        "assessment_type": assessment.assessment_type,
        "threshold": proof.threshold,
        "threshold_label": f"{proof.threshold:.0%}",
        "verified_at": verification.verified_at,
        "message": (
            f"This candidate has proven they scored above the "
            f"{proof.threshold:.0%} threshold on a {assessment.assessment_type.value.upper()} assessment. "
            "No other information was revealed."
        )
        if verification.is_valid
        else "Proof verification failed.",
        "commitment_hash": commitment.commitment_hash,
    }


# Ledger Router (entries, verify chain)

ledger_router = APIRouter(prefix="/api/ledger", tags=["ledger"])


@ledger_router.get("/entries")
async def get_ledger_entries(
    limit: int = Query(default=20, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    chain = LedgerChain(db)
    entries = await chain.get_entries(limit=limit, offset=offset)
    return [
        {
            "id": e.id,
            "student_pseudonym": e.student_pseudonym,
            "assessment_type": e.assessment_type,
            "entry_hash": e.entry_hash,
            "prev_hash": e.prev_hash,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
        }
        for e in entries
    ]


@ledger_router.get("/verify")
async def verify_ledger(db: AsyncSession = Depends(get_db)):
    """Public endpoint — verifies the entire hash chain is intact."""
    chain = LedgerChain(db)
    is_valid, entries_checked, error = await chain.verify_chain()
    return {
        "is_valid": is_valid,
        "entries_checked": entries_checked,
        "error": error,
        "message": (
            f"Chain integrity verified across {entries_checked} entries."
            if is_valid
            else f"Chain integrity FAILED: {error}"
        ),
    }


# Intelligence Router (submit signal, feed, trends)

intel_router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])


class SubmitSignalRequest(BaseModel):
    company_name: str
    role_level: str = "SDE-1"
    difficulty_score: float = Field(ge=0, le=10)
    round_count: int = Field(ge=1, le=20)
    topics: list[str] = []
    college_tier: str = "tier2"


@intel_router.post("/submit")
async def submit_signal(
    body: SubmitSignalRequest,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Apply local DP and store the signal."""
    dp = LocalDifferentialPrivacy()
    private = dp.apply_to_signal(body.model_dump())

    signal = PlacementSignalModel(
        id=str(uuid.uuid4()),
        company_sector=private.get("company_sector", "Other Tech"),
        role_level=private.get("role_level", body.role_level),
        difficulty_score=private.get("difficulty_score", body.difficulty_score),
        round_count=private.get("round_count", float(body.round_count)),
        topics=private.get("topics", body.topics),
        source_college_tier=body.college_tier,
    )
    db.add(signal)
    await db.flush()

    _gossip_node.ingest_signal(private)

    return {
        "message": "Signal submitted and anonymised via differential privacy.",
        "original": body.model_dump(),
        "privatised": private,
    }


@intel_router.get("/feed")
async def get_feed(
    sector: str | None = None,
    tier: str | None = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    query = select(PlacementSignalModel).order_by(
        PlacementSignalModel.submitted_at.desc()
    ).limit(limit)
    result = await db.execute(query)
    signals = result.scalars().all()

    filtered = [
        {
            "company_sector": s.company_sector,
            "role_level": s.role_level,
            "difficulty_score": round(s.difficulty_score, 2),
            "round_count": round(s.round_count, 1),
            "topics": s.topics,
            "source_college_tier": s.source_college_tier,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
        }
        for s in signals
        if (sector is None or s.company_sector == sector)
        and (tier is None or s.source_college_tier == tier)
    ]

    return {"signals": filtered, "count": len(filtered)}


@intel_router.get("/trends")
async def get_trends():
    trends = _gossip_node.get_trends()
    return trends


#  FL Router (status, rounds, trigger)

fl_router = APIRouter(prefix="/api/fl", tags=["federated-learning"])


@fl_router.get("/status")
async def fl_status():
    return {
        "node_id": settings.fl_node_id,
        "strategy": _fl_orchestrator.aggregator.name(),
        "round_number": _fl_orchestrator._round_number,
        "gossip_alive": _gossip_node.is_alive,
        "known_signals": len(_gossip_node.known_signals),
        "peers": len(_gossip_node.peers),
    }


@fl_router.get("/rounds")
async def list_rounds(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(FLRound).order_by(FLRound.created_at.desc()).limit(10)
    )
    rounds = result.scalars().all()
    return [
        {
            "id": r.id,
            "round_number": r.round_number,
            "strategy": r.aggregation_strategy,
            "participating_nodes": r.participating_nodes,
            "byzantine_nodes": r.byzantine_nodes,
            "global_model_hash": r.global_model_hash,
            "accuracy": r.global_model_accuracy,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rounds
    ]


@fl_router.post("/trigger-round")
async def trigger_round(
    num_nodes: int = 5,
    strategy: str = "fedavg",
    db: AsyncSession = Depends(get_db),
):
    """Trigger a simulated FL round."""
    _fl_orchestrator.aggregator = (
        __import__(
            "app.domains.fl.federated",
            fromlist=["TrimmedMeanAggregator", "FedAvgAggregator"],
        ).TrimmedMeanAggregator()
        if strategy == "trimmed_mean"
        else __import__(
            "app.domains.fl.federated",
            fromlist=["FedAvgAggregator"],
        ).FedAvgAggregator()
    )

    round_result = _fl_orchestrator.simulate_round(num_nodes=num_nodes)

    fl_round = FLRound(
        id=str(uuid.uuid4()),
        round_number=round_result.round_number,
        aggregation_strategy=round_result.strategy,
        participating_nodes=round_result.participating_nodes,
        byzantine_nodes=round_result.byzantine_nodes,
        global_model_hash=round_result.global_model_hash,
        global_model_accuracy=round_result.accuracy,
        status="completed",
    )
    db.add(fl_round)

    return {
        "round_number": round_result.round_number,
        "strategy": round_result.strategy,
        "participating_nodes": round_result.participating_nodes,
        "byzantine_nodes": round_result.byzantine_nodes,
        "global_model_hash": round_result.global_model_hash,
        "accuracy": f"{round_result.accuracy:.2%}",
        "fragments_received": round_result.fragments_received,
    }


# AI Health Router (health, study plan)

ai_router = APIRouter(prefix="/api/ai", tags=["ai"])


@ai_router.get("/health")
async def ai_health(db: AsyncSession = Depends(get_db)):
    stats = groq_client.get_stats()

    # Get from DB logs
    total_result = await db.execute(select(func.count(AIGenerationLog.id)))
    total = total_result.scalar() or 0

    fallback_result = await db.execute(
        select(func.count(AIGenerationLog.id)).where(
            AIGenerationLog.fallback_triggered == True
        )
    )
    fallback_count = fallback_result.scalar() or 0

    return {
        "groq_configured": settings.groq_configured,
        "groq_model": settings.groq_question_model,
        "question_cache_ttl_seconds": settings.question_cache_ttl_seconds,
        "total_api_calls": total,
        "fallback_triggered_count": fallback_count,
        "fallback_rate": f"{fallback_count / total:.1%}" if total else "0%",
        "runtime_stats": stats,
    }


@ai_router.get("/study-plan/{assessment_id}")
async def get_study_plan(
    assessment_id: str,
    user: CurrentUser,
):
    plan = await redis_get(f"study_plan:{assessment_id}")
    if not plan:
        raise HTTPException(404, "Study plan not found — complete the assessment first")
    return plan


#  Health + Debug (server health, env + connectivity checks)

meta_router = APIRouter(tags=["meta"])


@meta_router.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": time.time(), "version": "1.0.0"}


@meta_router.get("/api/debug")
async def debug(db: AsyncSession = Depends(get_db)):
    checks = {}

    # DB check
    try:
        await db.execute(select(func.now()))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    # Redis check
    try:
        r = await get_redis()
        await r.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {e}"

    # Groq check
    checks["groq"] = "configured" if settings.groq_configured else "not configured (fallback mode)"

    checks["env"] = {
        "GROQ_API_KEY": "set" if settings.groq_api_key else "not set",
        "DATABASE_URL": "set",
        "REDIS_URL": settings.redis_url,
        "FL_NODE_ID": settings.fl_node_id,
    }

    return checks


# Colleges Router 

colleges_router = APIRouter(prefix="/api/colleges", tags=["colleges"])


@colleges_router.get("")
async def list_colleges(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(College).order_by(College.tier, College.name))
    colleges = result.scalars().all()
    if not colleges:
        # Seed some colleges
        seed = [
            College(id=str(uuid.uuid4()), name="IIT Bombay", tier=CollegeTier.TIER1),
            College(id=str(uuid.uuid4()), name="IIT Delhi", tier=CollegeTier.TIER1),
            College(id=str(uuid.uuid4()), name="IIT Roorkee", tier=CollegeTier.TIER1),
            College(id=str(uuid.uuid4()), name="BITS Pilani", tier=CollegeTier.TIER1),
            College(id=str(uuid.uuid4()), name="NIT Trichy", tier=CollegeTier.TIER2),
            College(id=str(uuid.uuid4()), name="VIT Vellore", tier=CollegeTier.TIER2),
            College(id=str(uuid.uuid4()), name="SRM Chennai", tier=CollegeTier.TIER3),
            College(id=str(uuid.uuid4()), name="Amity University", tier=CollegeTier.TIER3),
        ]
        for c in seed:
            db.add(c)
        await db.flush()
        colleges = seed

    return [
        {"id": c.id, "name": c.name, "tier": c.tier}
        for c in colleges
    ]


#  Leaderboard Router 

leaderboard_router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@leaderboard_router.get("/{domain}")
async def get_leaderboard(domain: str, db: AsyncSession = Depends(get_db)):
    """Percentile leaderboard — pseudonyms only, no real identity."""
    result = await db.execute(
        select(Assessment.score, User.pseudonym)
        .join(User, Assessment.user_id == User.id)
        .where(
            Assessment.assessment_type == AssessmentType(domain),
            Assessment.status == "completed",
            Assessment.score.isnot(None),
        )
        .order_by(Assessment.score.desc())
        .limit(100)
    )
    rows = result.all()

    entries = []
    total = len(rows)
    for rank, (score, pseudonym) in enumerate(rows, 1):
        percentile = (total - rank) / total * 100 if total > 1 else 50
        entries.append({
            "rank": rank,
            "pseudonym": pseudonym,
            "score": f"{score:.0%}" if score else "N/A",
            "percentile": round(percentile, 1),
        })

    return {"domain": domain, "entries": entries, "total_participants": total}