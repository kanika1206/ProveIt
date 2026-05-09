
from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


def _uuid() -> str:
    return str(uuid.uuid4())


#  Enums

class CollegeTier(str, enum.Enum):
    TIER1 = "tier1"
    TIER2 = "tier2"
    TIER3 = "tier3"


class AssessmentType(str, enum.Enum):
    DSA = "dsa"
    SYSTEM_DESIGN = "system_design"
    APTITUDE = "aptitude"


class AICallType(str, enum.Enum):
    QUESTION = "question"
    STUDY_PLAN = "study_plan"
    RUBRIC = "rubric"


# Tables

class College(Base):
    __tablename__ = "colleges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    tier: Mapped[CollegeTier] = mapped_column(Enum(CollegeTier), nullable=False)
    node_endpoint: Mapped[str | None] = mapped_column(String(500))
    certificate_fingerprint: Mapped[str | None] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    users: Mapped[list["User"]] = relationship("User", back_populates="college")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    public_key: Mapped[str | None] = mapped_column(Text)  # PEM-encoded RSA public key
    college_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("colleges.id"), nullable=True
    )
    full_name: Mapped[str | None] = mapped_column(String(255))
    pseudonym: Mapped[str] = mapped_column(String(64), unique=True)  # for leaderboard
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    college: Mapped["College | None"] = relationship("College", back_populates="users")
    assessments: Mapped[list["Assessment"]] = relationship(
        "Assessment", back_populates="user"
    )
    commitments: Mapped[list["Commitment"]] = relationship(
        "Commitment", back_populates="user"
    )


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    assessment_type: Mapped[AssessmentType] = mapped_column(Enum(AssessmentType))
    score: Mapped[float | None] = mapped_column(Float)
    per_tag_scores: Mapped[dict | None] = mapped_column(JSONB)
    integrity_flags: Mapped[dict | None] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship("User", back_populates="assessments")
    questions: Mapped[list["GeneratedQuestion"]] = relationship(
        "GeneratedQuestion", back_populates="assessment"
    )
    commitments: Mapped[list["Commitment"]] = relationship(
        "Commitment", back_populates="assessment"
    )


class GeneratedQuestion(Base):
    __tablename__ = "generated_questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    assessment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessments.id"), nullable=False
    )
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)  # SHA-256
    question_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    generated_by: Mapped[str] = mapped_column(String(32), default="groq")  # groq | fallback
    generation_latency_ms: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    assessment: Mapped["Assessment"] = relationship(
        "Assessment", back_populates="questions"
    )


class Commitment(Base):
    __tablename__ = "commitments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    assessment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessments.id"), nullable=False
    )
    commitment_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    encrypted_salt: Mapped[str] = mapped_column(Text, nullable=False)
    threshold_proven: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship("User", back_populates="commitments")
    assessment: Mapped["Assessment"] = relationship(
        "Assessment", back_populates="commitments"
    )
    ledger_entries: Mapped[list["LedgerEntry"]] = relationship(
        "LedgerEntry", back_populates="commitment"
    )
    skill_proofs: Mapped[list["SkillProof"]] = relationship(
        "SkillProof", back_populates="commitment"
    )


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    commitment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("commitments.id"), nullable=False
    )
    student_pseudonym: Mapped[str] = mapped_column(String(64), nullable=False)
    assessment_type: Mapped[str] = mapped_column(String(32), nullable=False)
    prev_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    entry_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    commitment: Mapped["Commitment"] = relationship(
        "Commitment", back_populates="ledger_entries"
    )


class SkillProof(Base):
    __tablename__ = "skill_proofs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    commitment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("commitments.id"), nullable=False
    )
    proof_bytes: Mapped[bytes | None] = mapped_column(LargeBinary)
    proof_json: Mapped[dict | None] = mapped_column(JSONB)  # Groth16 proof object
    public_signals: Mapped[dict | None] = mapped_column(JSONB)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    verified_by: Mapped[str | None] = mapped_column(String(255))
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_valid: Mapped[bool | None] = mapped_column(Boolean)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    commitment: Mapped["Commitment"] = relationship(
        "Commitment", back_populates="skill_proofs"
    )


class FLRound(Base):
    __tablename__ = "fl_rounds"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    round_number: Mapped[int] = mapped_column(Integer, nullable=False)
    aggregation_strategy: Mapped[str] = mapped_column(String(32), default="fedavg")
    participating_nodes: Mapped[dict | None] = mapped_column(JSONB)
    byzantine_nodes: Mapped[dict | None] = mapped_column(JSONB)
    global_model_hash: Mapped[str | None] = mapped_column(String(64))
    global_model_accuracy: Mapped[float | None] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class PlacementSignal(Base):
    __tablename__ = "placement_signals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    company_sector: Mapped[str] = mapped_column(String(64), nullable=False)
    role_level: Mapped[str] = mapped_column(String(64), nullable=False)
    difficulty_score: Mapped[float | None] = mapped_column(Float)  # DP-noised
    round_count: Mapped[float | None] = mapped_column(Float)  # DP-noised
    topics: Mapped[dict | None] = mapped_column(JSONB)  # generalised
    source_college_tier: Mapped[str | None] = mapped_column(String(16))
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class AIGenerationLog(Base):
    __tablename__ = "ai_generation_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    call_type: Mapped[AICallType] = mapped_column(Enum(AICallType))
    model: Mapped[str] = mapped_column(String(64))
    prompt_tokens: Mapped[int | None] = mapped_column(Integer)
    completion_tokens: Mapped[int | None] = mapped_column(Integer)
    latency_ms: Mapped[int | None] = mapped_column(Integer)
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    fallback_triggered: Mapped[bool] = mapped_column(Boolean, default=False)
    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )