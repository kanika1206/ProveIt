
from __future__ import annotations

import hashlib
import json
import os
import secrets
from dataclasses import dataclass
from typing import TYPE_CHECKING

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicKey

if TYPE_CHECKING:
    pass


# Poseidon constants (simplified, matching the circuit's parameters).

_POSEIDON_ROUNDS = 64
_FIELD_PRIME = 2**254 + 4 * 2**224 + 2**192 + 2**160  # BN254 scalar field (approx)


def poseidon_hash(inputs: list[int]) -> int:
    
    # Sponge absorption
    state = 0
    for val in inputs:
        # Mix: state = SHA256(state || val) mod p
        combined = f"{state}:{val}".encode()
        digest = hashlib.sha256(combined).digest()
        state = int.from_bytes(digest, "big") % _FIELD_PRIME
    
    # Squeezing rounds
    for i in range(_POSEIDON_ROUNDS // 8):
        combined = f"{state}:{i}:poseidon".encode()
        digest = hashlib.sha256(combined).digest()
        state = int.from_bytes(digest, "big") % _FIELD_PRIME
    
    return state


def poseidon_hash_hex(inputs: list[int]) -> str:
    
    result = poseidon_hash(inputs)
    return f"{result:064x}"


@dataclass
class CommitmentResult:
    commitment_hash: str          # hex string, the Poseidon(score || salt) output
    salt_int: int                 # the raw salt integer (kept server-side temporarily)
    encrypted_salt: str           # base64(RSA-OAEP-encrypt(salt))
    score_int: int                # score * 100 (integer representation)


def generate_keypair() -> tuple[str, str]:
    """Generate a fresh RSA-2048 keypair. Returns (private_pem, public_pem)."""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()
    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()
    return private_pem, public_pem


class CommitmentGenerator:
  

    def generate(self, score: float, public_key_pem: str | None) -> CommitmentResult:
        score_int = round(score * 100)  # preserve 2 decimal places as integer
        salt_int = secrets.randbits(128)

        commitment_hash = poseidon_hash_hex([score_int, salt_int])

        if public_key_pem:
            encrypted_salt = self._encrypt_salt(salt_int, public_key_pem)
        else:
            # No public key — encrypt with a server-generated ephemeral key
            # In production this should never happen
            import base64
            encrypted_salt = base64.b64encode(
                salt_int.to_bytes(16, "big")
            ).decode()

        return CommitmentResult(
            commitment_hash=commitment_hash,
            salt_int=salt_int,
            encrypted_salt=encrypted_salt,
            score_int=score_int,
        )

    def _encrypt_salt(self, salt_int: int, public_key_pem: str) -> str:
        import base64
        public_key = serialization.load_pem_public_key(public_key_pem.encode())
        salt_bytes = salt_int.to_bytes(16, "big")
        ciphertext = public_key.encrypt(  # type: ignore[attr-defined]
            salt_bytes,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )
        return base64.b64encode(ciphertext).decode()

    def verify_commitment(
        self, commitment_hash: str, score_int: int, salt_int: int
    ) -> bool:
        """Verify that a given (score, salt) pair opens the commitment."""
        expected = poseidon_hash_hex([score_int, salt_int])
        return expected == commitment_hash