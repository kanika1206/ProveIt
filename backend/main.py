
from __future__ import annotations

import asyncio
import json
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import create_tables
from app.api.routers import (
    ai_router,
    assessment_router,
    auth_router,
    colleges_router,
    fl_router,
    intel_router,
    ledger_router,
    leaderboard_router,
    meta_router,
    proofs_router,
    _fl_orchestrator,
    _gossip_node,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Active WebSocket connections
_fl_connections: list[WebSocket] = []
_dashboard_connections: list[WebSocket] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 SkillLedger starting up...")

    # Create DB tables
    await create_tables()
    logger.info("✓ Database tables ready")

    # Start background tasks
    asyncio.create_task(fl_broadcast_loop())
    asyncio.create_task(gossip_heartbeat_loop())
    logger.info("✓ Background tasks started")

    yield

    logger.info("SkillLedger shutting down...")


app = FastAPI(
    title="SkillLedger API",
    description="Privacy-preserving skill verification and placement intelligence",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router)
app.include_router(assessment_router)
app.include_router(proofs_router)
app.include_router(ledger_router)
app.include_router(intel_router)
app.include_router(fl_router)
app.include_router(ai_router)
app.include_router(colleges_router)
app.include_router(leaderboard_router)
app.include_router(meta_router)


#  WebSocket: FL Round Events 

@app.websocket("/ws/fl-round")
async def fl_round_websocket(websocket: WebSocket):
    
    await websocket.accept()
    _fl_connections.append(websocket)
    logger.info("FL WebSocket connected. Total: %d", len(_fl_connections))

    try:
        # Send initial state
        await websocket.send_json({
            "type": "FL_STATUS",
            "round_number": _fl_orchestrator._round_number,
            "strategy": _fl_orchestrator.aggregator.name(),
        })

        # Listen for commands from client
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_json(), timeout=30)
                cmd = data.get("command")
                if cmd == "TRIGGER_ROUND":
                    result = _fl_orchestrator.simulate_round(
                        num_nodes=data.get("num_nodes", 5)
                    )
                    await websocket.send_json({
                        "type": "ROUND_COMPLETE",
                        "round_number": result.round_number,
                        "strategy": result.strategy,
                        "participating_nodes": result.participating_nodes,
                        "byzantine_nodes": result.byzantine_nodes,
                        "global_model_hash": result.global_model_hash,
                        "accuracy": result.accuracy,
                    })
            except asyncio.TimeoutError:
                # Send heartbeat
                await websocket.send_json({"type": "HEARTBEAT", "ts": time.time()})
    except WebSocketDisconnect:
        pass
    finally:
        _fl_connections.remove(websocket)


# WebSocket: Dashboard Events 

@app.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    """
    Real-time dashboard updates — ledger appends, signal counts, FL status.
    """
    await websocket.accept()
    _dashboard_connections.append(websocket)

    try:
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=5)
            except asyncio.TimeoutError:
                # Push live stats
                await websocket.send_json({
                    "type": "STATS_UPDATE",
                    "fl_round": _fl_orchestrator._round_number,
                    "gossip_signals": len(_gossip_node.known_signals),
                    "gossip_alive": _gossip_node.is_alive,
                    "ts": time.time(),
                })
    except WebSocketDisconnect:
        pass
    finally:
        if websocket in _dashboard_connections:
            _dashboard_connections.remove(websocket)


#  Background Tasks 

async def fl_broadcast_loop():
   
    while True:
        await asyncio.sleep(30)
        if _fl_connections or _dashboard_connections:
            status = {
                "type": "FL_HEARTBEAT",
                "round_number": _fl_orchestrator._round_number,
                "ts": time.time(),
            }
            for ws in list(_fl_connections):
                try:
                    await ws.send_json(status)
                except Exception:
                    pass


async def gossip_heartbeat_loop():
    
    while True:
        await asyncio.sleep(10)
        _gossip_node.heartbeat()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info",
    )