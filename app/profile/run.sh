#!/usr/bin/env bash
# SkillLedger — one-command local start
# Usage: ./run.sh
# Prerequisites: Python 3.11+, Node 18+, PostgreSQL running, Redis running

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${GREEN}⬡ SkillLedger — Starting up${NC}"

# Check .env
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠ No .env found — copying .env.example${NC}"
  cp .env.example .env
  echo -e "${RED}Edit .env and add your GROQ_API_KEY, then re-run.${NC}"
  exit 1
fi

source .env

# Check Groq key
if [ -z "$GROQ_API_KEY" ] || [ "$GROQ_API_KEY" = "gsk_..." ]; then
  echo -e "${YELLOW}⚠ GROQ_API_KEY not set — running in fallback mode (seed question bank)${NC}"
fi

# Backend
echo -e "${GREEN}Starting backend...${NC}"
cd backend
pip install -e . -q
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait for backend
echo -n "Waiting for backend"
for i in {1..20}; do
  if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e " ${GREEN}✓${NC}"
    break
  fi
  echo -n "."
  sleep 1
done

# Frontend
echo -e "${GREEN}Starting frontend...${NC}"
cd frontend
npm install -q
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✓ SkillLedger running:${NC}"
echo -e "  Frontend:  http://localhost:3000"
echo -e "  Backend:   http://localhost:8000"
echo -e "  API Docs:  http://localhost:8000/docs"
echo -e "  AI Health: http://localhost:8000/api/ai/health"
echo -e "  Debug:     http://localhost:8000/api/debug"
echo ""
echo -e "Press Ctrl+C to stop."

cleanup() {
  echo -e "\n${YELLOW}Stopping...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM
wait