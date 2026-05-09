"""
Differential Privacy + P2P Gossip Protocol.


"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import math
import random
import time
import uuid
from dataclasses import dataclass, field
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


#  Differential Privacy 

COMPANY_SECTOR_MAP = {
    # MAANG
    "google": "MAANG", "meta": "MAANG", "amazon": "MAANG",
    "apple": "MAANG", "netflix": "MAANG", "microsoft": "MAANG",
    # Fintech
    "zerodha": "Fintech", "razorpay": "Fintech", "cred": "Fintech",
    "paytm": "Fintech", "phonepe": "Fintech", "groww": "Fintech",
    # Startup
    "zomato": "Startup", "swiggy": "Startup", "byju": "Startup",
    "unacademy": "Startup", "meesho": "Startup", "ola": "Startup",
    # IT Services
    "tcs": "IT Services", "infosys": "IT Services", "wipro": "IT Services",
    "hcl": "IT Services", "cognizant": "IT Services", "accenture": "IT Services",
}


class LocalDifferentialPrivacy:
   

    def __init__(self, epsilon: float = 1.0, sensitivity: float = 1.0):
        self.epsilon = epsilon
        self.sensitivity = sensitivity
        self._noise_scale = sensitivity / epsilon

    def add_laplace_noise(self, value: float) -> float:
        
        noise = np.random.laplace(0, self._noise_scale)
        return float(value + noise)

    def generalise_company(self, company_name: str) -> str:
       
        normalised = company_name.lower().strip()
        for key, sector in COMPANY_SECTOR_MAP.items():
            if key in normalised:
                return sector
        return "Other Tech"

    def apply_to_signal(self, raw_signal: dict) -> dict:
        
        privatised = raw_signal.copy()

        if "company_name" in privatised:
            privatised["company_sector"] = self.generalise_company(
                privatised.pop("company_name")
            )
        if "difficulty_score" in privatised:
            privatised["difficulty_score"] = max(
                0.0, min(10.0, self.add_laplace_noise(privatised["difficulty_score"]))
            )
        if "round_count" in privatised:
            privatised["round_count"] = max(
                1.0, self.add_laplace_noise(privatised["round_count"])
            )
        if "time_taken_hours" in privatised:
            privatised["time_taken_hours"] = max(
                0.0, self.add_laplace_noise(privatised["time_taken_hours"])
            )
        # Generalise topics: keep only top 3
        if "topics" in privatised and isinstance(privatised["topics"], list):
            privatised["topics"] = privatised["topics"][:3]

        return privatised


# Gossip Protocol

@dataclass
class PlacementSignal:
    """Anonymised, DP-noised placement intelligence signal."""
    signal_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    company_sector: str = ""
    role_level: str = ""
    difficulty_score: float = 5.0
    round_count: float = 3.0
    topics: list[str] = field(default_factory=list)
    source_college_tier: str = "tier2"
    forward_count: int = 0        # Rumour mongering: die after 5 forwards
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> dict:
        return {
            "signal_id": self.signal_id,
            "company_sector": self.company_sector,
            "role_level": self.role_level,
            "difficulty_score": self.difficulty_score,
            "round_count": self.round_count,
            "topics": self.topics,
            "source_college_tier": self.source_college_tier,
            "forward_count": self.forward_count,
            "timestamp": self.timestamp,
        }

    @classmethod
    def from_dict(cls, data: dict) -> PlacementSignal:
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})


@dataclass
class GossipPeer:
    node_id: str
    endpoint: str
    last_seen: float = field(default_factory=time.time)
    failures: int = 0
    quarantined: bool = False


class GossipNode:
  

    MAX_FORWARD_COUNT = 5
    GOSSIP_INTERVAL = 10.0  # seconds
    BYZANTINE_SIGMA = 2.0

    def __init__(self, node_id: str, bootstrap_peers: list[str]):
        self.node_id = node_id
        self.peers: dict[str, GossipPeer] = {
            ep: GossipPeer(node_id=ep, endpoint=ep)
            for ep in bootstrap_peers
        }
        self.known_signals: dict[str, PlacementSignal] = {}
        self.dp = LocalDifferentialPrivacy()
        self._running = False
        self._heartbeat_ts = time.time()

    def ingest_signal(self, raw_signal: dict) -> PlacementSignal:
        
        private = self.dp.apply_to_signal(raw_signal)
        signal = PlacementSignal(**{
            k: private.get(k, getattr(PlacementSignal, k, ""))
            for k in PlacementSignal.__dataclass_fields__
            if k in private
        })
        signal.signal_id = str(uuid.uuid4())
        self.known_signals[signal.signal_id] = signal
        return signal

    def receive_signal(self, signal_data: dict) -> bool:
        
        signal = PlacementSignal.from_dict(signal_data)

        # Already seen?
        if signal.signal_id in self.known_signals:
            return False

        # Rumour mongering: don't forward if too many hops
        if signal.forward_count >= self.MAX_FORWARD_COUNT:
            self.known_signals[signal.signal_id] = signal
            return False

        # Byzantine check
        if self._is_byzantine(signal):
            logger.warning("Byzantine signal rejected: difficulty=%.2f", signal.difficulty_score)
            return False

        signal.forward_count += 1
        self.known_signals[signal.signal_id] = signal
        return True

    def _is_byzantine(self, signal: PlacementSignal) -> bool:
       
        if len(self.known_signals) < 5:
            return False  # Not enough data to detect anomalies

        difficulties = [s.difficulty_score for s in self.known_signals.values()]
        median = float(np.median(difficulties))
        std = float(np.std(difficulties))

        if std < 0.01:
            return False

        return abs(signal.difficulty_score - median) > self.BYZANTINE_SIGMA * std

    def get_push_payload(self) -> list[dict]:
      
        alive = [
            s for s in self.known_signals.values()
            if s.forward_count < self.MAX_FORWARD_COUNT
        ]
        # Push at most 10 most recent signals
        sorted_signals = sorted(alive, key=lambda s: s.timestamp, reverse=True)
        return [s.to_dict() for s in sorted_signals[:10]]

    def heartbeat(self) -> None:
        self._heartbeat_ts = time.time()

    @property
    def is_alive(self) -> bool:
        return time.time() - self._heartbeat_ts < 60

    def get_trends(self) -> dict:
        
        if not self.known_signals:
            return {}

        signals = list(self.known_signals.values())

        # Sector distribution
        sector_counts: dict[str, int] = {}
        topic_counts: dict[str, int] = {}
        difficulties = []

        for s in signals:
            sector_counts[s.company_sector] = sector_counts.get(s.company_sector, 0) + 1
            for topic in s.topics:
                topic_counts[topic] = topic_counts.get(topic, 0) + 1
            difficulties.append(s.difficulty_score)

        return {
            "total_signals": len(signals),
            "sector_distribution": sector_counts,
            "top_topics": sorted(topic_counts.items(), key=lambda x: -x[1])[:10],
            "avg_difficulty": float(np.mean(difficulties)) if difficulties else 0.0,
            "median_difficulty": float(np.median(difficulties)) if difficulties else 0.0,
        }


# Watchdog Thread 

import threading


class WatchdogThread(threading.Thread):
    
    CHECK_INTERVAL = 30  # seconds

    def __init__(self, gossip_node: GossipNode, restart_callback) -> None:
        super().__init__(daemon=True, name="GossipWatchdog")
        self.gossip_node = gossip_node
        self.restart_callback = restart_callback
        self._stop_event = threading.Event()
        self._restart_count = 0

    def run(self) -> None:
        logger.info("Watchdog started — checking gossip node every %ds", self.CHECK_INTERVAL)
        while not self._stop_event.wait(self.CHECK_INTERVAL):
            if not self.gossip_node.is_alive:
                self._restart_count += 1
                logger.error(
                    "Gossip node unresponsive — restart #%d", self._restart_count
                )
                try:
                    self.restart_callback()
                    logger.info("Gossip node restarted successfully")
                except Exception as e:
                    logger.error("Gossip restart failed: %s", e)
            else:
                logger.debug("Watchdog: gossip node alive ✓")

    def stop(self) -> None:
        self._stop_event.set()

    @property
    def restart_count(self) -> int:
        return self._restart_count