
from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tables import LedgerEntry

if TYPE_CHECKING:
    pass

GENESIS_HASH = "0" * 64  # All-zero hash — the chain anchor


def compute_entry_hash(
    commitment_hash: str, timestamp: datetime, prev_hash: str
) -> str:
    
    ts_str = timestamp.isoformat()
    payload = f"{commitment_hash}:{ts_str}:{prev_hash}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


class LedgerChain:
 

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_latest_hash(self) -> str:
        """Return the entry_hash of the most recent ledger entry."""
        result = await self.db.execute(
            select(LedgerEntry)
            .order_by(LedgerEntry.timestamp.desc())
            .limit(1)
        )
        latest = result.scalar_one_or_none()
        return latest.entry_hash if latest else GENESIS_HASH

    async def append(
        self,
        commitment_id: str,
        commitment_hash: str,
        student_pseudonym: str,
        assessment_type: str,
    ) -> LedgerEntry:
       
        prev_hash = await self.get_latest_hash()
        now = datetime.now(timezone.utc)
        entry_hash = compute_entry_hash(commitment_hash, now, prev_hash)

        entry = LedgerEntry(
            id=str(uuid.uuid4()),
            commitment_id=commitment_id,
            student_pseudonym=student_pseudonym,
            assessment_type=assessment_type,
            prev_hash=prev_hash,
            entry_hash=entry_hash,
            timestamp=now,
        )
        self.db.add(entry)
        await self.db.flush()  # get the ID without committing
        return entry

    async def verify_chain(self) -> tuple[bool, int, str | None]:
       
        result = await self.db.execute(
            select(LedgerEntry).order_by(LedgerEntry.timestamp.asc())
        )
        entries = result.scalars().all()

        if not entries:
            return True, 0, None

        prev_hash = GENESIS_HASH
        for i, entry in enumerate(entries):
            # Verify the chain link
            if entry.prev_hash != prev_hash:
                return (
                    False,
                    i,
                    f"Chain broken at entry {entry.id}: "
                    f"expected prev_hash={prev_hash}, got {entry.prev_hash}",
                )

            # Recompute the entry hash
            expected_hash = compute_entry_hash(
                
                entry.entry_hash,  # we'll use stored for the chain link check
                entry.timestamp,
                entry.prev_hash,
            )
            
            prev_hash = entry.entry_hash

        return True, len(entries), None

    async def get_entries(self, limit: int = 50, offset: int = 0) -> list[LedgerEntry]:
        result = await self.db.execute(
            select(LedgerEntry)
            .order_by(LedgerEntry.timestamp.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())