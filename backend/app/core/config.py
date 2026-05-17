
from __future__ import annotations

import os
from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database 
    database_url: str = Field(
        default="postgresql+asyncpg://skillledger:skillledger@localhost:5432/skillledger"
    )
    database_url_sync: str = Field(
        default="postgresql+psycopg2://skillledger:skillledger@localhost:5432/skillledger"
    )

    #  Redis
    redis_url: str = Field(default="redis://localhost:6379/0")

    # Security 
    session_secret: str = Field(default="change-me-in-production-session-secret-256bit")
    jwt_secret: str = Field(default="change-me-in-production-jwt-secret-256bit")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    #  Groq AI 
    groq_api_key: str = Field(default="")
    groq_question_model: str = Field(default="llama-3.3-70b-versatile")
    groq_study_plan_model: str = Field(default="llama-3.3-70b-versatile")
    groq_base_url: str = Field(default="https://api.groq.com/openai/v1")

    #  Question Generation 
    question_cache_ttl_seconds: int = Field(default=1800)
    ai_fallback_question_bank_path: str = Field(
        default="/home/claude/skillledger/backend/seed_data/fallback_questions.json"
    )

    # ZK Proofs 
    snarkjs_circuit_path: str = Field(default="circuits/")

    #  Federated Learning 
    fl_node_id: str = Field(default="node-global-aggregator")
    fl_bootstrap_peers: str = Field(default="ws://localhost:8001,ws://localhost:8002")
    fl_byzantine_threshold: float = Field(default=2.0)  # std devs

    #  Proctoring 
    proctoring_enabled: bool = Field(default=True)

    #  Server 
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    debug: bool = Field(default=True)
    allowed_origins: list[str] = Field(
    default=["http://localhost:3000", "http://127.0.0.1:3000", "https://prove-it-phi.vercel.app"]
)
    # Differential Privacy 
    dp_epsilon: float = Field(default=1.0)
    dp_sensitivity: float = Field(default=1.0)

    @property
    def groq_configured(self) -> bool:
        return bool(self.groq_api_key and not self.groq_api_key.startswith("invalid"))


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()