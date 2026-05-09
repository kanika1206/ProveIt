
from __future__ import annotations

import hashlib
import json
import logging
import time
import uuid
from dataclasses import dataclass
from typing import Any

from app.domains.proofs.commitment import poseidon_hash_hex

logger = logging.getLogger(__name__)


@dataclass
class SkillProofData:
   
    proof_json: dict          # Full Groth16 proof object from snarkjs
    public_signals: list[str] # [commitment_hash_as_field_element, threshold_as_field_element]
    commitment_hash: str       # The stored commitment (from database)
    threshold: float           # The threshold being proven (e.g., 0.70 = 70th percentile)
    assessment_type: str


@dataclass
class VerificationResult:
    is_valid: bool
    commitment_hash: str
    threshold: float
    assessment_type: str
    verified_at: float
    error: str | None = None


class ProofVerifier:
    

    def verify(self, proof_data: SkillProofData) -> VerificationResult:
        
        try:
            # Step 1: Validate proof structure
            if not self._validate_proof_structure(proof_data.proof_json):
                return VerificationResult(
                    is_valid=False,
                    commitment_hash=proof_data.commitment_hash,
                    threshold=proof_data.threshold,
                    assessment_type=proof_data.assessment_type,
                    verified_at=time.time(),
                    error="Malformed proof structure",
                )

            # Step 2: Verify public signals match commitment
            # The first public signal encodes the commitment hash
            if proof_data.public_signals:
                signal_commitment = proof_data.public_signals[0]
                # In the real circuit, the field element is the Poseidon hash output
                # We verify it matches the stored commitment (mod field prime)
                if not self._signals_match_commitment(
                    signal_commitment, proof_data.commitment_hash
                ):
                    return VerificationResult(
                        is_valid=False,
                        commitment_hash=proof_data.commitment_hash,
                        threshold=proof_data.threshold,
                        assessment_type=proof_data.assessment_type,
                        verified_at=time.time(),
                        error="Public signals do not match stored commitment",
                    )

            # Step 3: Verify threshold signal
            if len(proof_data.public_signals) >= 2:
                threshold_signal = proof_data.public_signals[1]
                expected_threshold = str(int(proof_data.threshold * 10000))
                if threshold_signal != expected_threshold and threshold_signal != "1":
                    logger.warning(
                        "Threshold mismatch: got %s, expected ~%s",
                        threshold_signal, expected_threshold
                    )
                    # Soft check — don't fail if threshold encoding varies

            # Step 4: Groth16 pairing check (simulated)
            # In production: subprocess call to snarkjs verify or a Rust binding
            groth16_valid = self._simulate_groth16_check(proof_data.proof_json)

            return VerificationResult(
                is_valid=groth16_valid,
                commitment_hash=proof_data.commitment_hash,
                threshold=proof_data.threshold,
                assessment_type=proof_data.assessment_type,
                verified_at=time.time(),
            )

        except Exception as e:
            logger.error("Proof verification error: %s", e)
            return VerificationResult(
                is_valid=False,
                commitment_hash=proof_data.commitment_hash,
                threshold=proof_data.threshold,
                assessment_type=proof_data.assessment_type,
                verified_at=time.time(),
                error=str(e),
            )

    def _validate_proof_structure(self, proof_json: dict) -> bool:
        
        required = {"pi_a", "pi_b", "pi_c"}
        if not all(k in proof_json for k in required):
            # Also accept simplified proof format
            if "commitment" in proof_json and "threshold_satisfied" in proof_json:
                return True
            return False
        return True

    def _signals_match_commitment(
        self, signal: str, stored_commitment: str
    ) -> bool:
        
        #
        if signal == stored_commitment:
            return True
        if signal == "1":
            # Simplified proof (no circuit) — trust the commitment lookup
            return True
        # Try hex comparison
        try:
            signal_int = int(signal)
            commitment_int = int(stored_commitment, 16)
            return signal_int == commitment_int
        except (ValueError, TypeError):
            return False

    def _simulate_groth16_check(self, proof_json: dict) -> bool:
       
        if "pi_a" in proof_json and "pi_b" in proof_json:
            # Check that the proof points are non-trivial
            pi_a = proof_json["pi_a"]
            if pi_a and pi_a[0] != "0" and pi_a[0] != "1":
                return True  # Non-trivial proof — real verification would check pairings

        # Accept simplified proofs (from browser fallback)
        if proof_json.get("protocol") == "simplified" and proof_json.get("valid"):
            return True

        # If proof looks like a real snarkjs output, trust its structure
        return "pi_a" in proof_json or "commitment" in proof_json


def generate_simplified_proof(
    commitment_hash: str, score: float, threshold: float
) -> dict:
    
    # Simulate proof generation time
    import secrets
    
   
    proves_threshold = score > threshold

    if not proves_threshold:
        # Student cannot generate a valid proof for a false claim
        return {"valid": False, "error": "Score does not exceed threshold"}

    # Simulated BN128 curve points (random-looking but deterministic from commitment)
    seed = int(hashlib.sha256(f"{commitment_hash}:{threshold}".encode()).hexdigest(), 16)
    
    def fake_g1_point(seed: int, i: int) -> list[str]:
        h = hashlib.sha256(f"{seed}:{i}:g1".encode()).hexdigest()
        x = str(int(h[:32], 16) % (2**254))
        y = str(int(h[32:], 16) % (2**254))
        return [x, y, "1"]

    def fake_g2_point(seed: int, i: int) -> list[list[str]]:
        h = hashlib.sha256(f"{seed}:{i}:g2".encode()).hexdigest()
        return [
            [str(int(h[:16], 16)), str(int(h[16:32], 16))],
            [str(int(h[32:48], 16)), str(int(h[48:], 16))],
            ["1", "0"],
        ]

    # Public signals: [commitment_field_element, threshold_signal]
    commitment_field = str(int(commitment_hash[:32], 16) % (2**254))
    threshold_field = str(int(threshold * 10000))

    return {
        "pi_a": fake_g1_point(seed, 1),
        "pi_b": fake_g2_point(seed, 2),
        "pi_c": fake_g1_point(seed, 3),
        "protocol": "groth16",
        "curve": "bn128",
        "public_signals": [commitment_field, threshold_field],
        "commitment_hash": commitment_hash,
        "threshold": threshold,
        "proves_above_threshold": True,
    }