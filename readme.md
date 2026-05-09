# ProveIt

I'm at IIT Jammu and watched people with stronger skills get filtered out in 
placements purely because of their GPA. Spent 3 months building something about it.

During my BTP I was working on wireless federated learning and that's where I got 
into the crypto and privacy side of things. Poseidon hashing, ZK proofs, 
differential privacy started making sense as tools I could actually use. 
So I combined both problems into one project.

**Live demo** → https://proveit-frontend.onrender.com  
**API docs** → https://proveit-backend.onrender.com/docs

---

## What it does

- You take an AI-generated assessment (no static question bank, so nothing can leak)
- Your score gets locked cryptographically the moment you finish
- You generate a Zero-Knowledge proof — employers can verify you scored above a 
  threshold **without ever seeing your actual score**
- Everything is on a hash-chained ledger so the platform can't silently change 
  your results
- Placement intel from colleges is aggregated with differential privacy so no 
  individual data leaks

---

## Why I built each piece the way I did

**Zero-Knowledge Proofs (snarkjs Groth16)**  
I needed employers to trust the score without me just saying "trust me". ZK proofs 
mean the math guarantees it — a fake proof is computationally impossible to generate.

**Poseidon hash for commitments**  
SHA-256 would've worked but it's expensive inside ZK circuits (~100k gates vs ~3k 
for Poseidon). Proof generation would've been 10x slower in the browser.

**Hash-chained ledger**  
A regular database means I (the platform owner) could silently edit scores. The 
chain makes tampering mathematically detectable.

**Federated Learning**  
I wanted placement intel from multiple colleges but no college would share raw 
student data. FL lets the model train across colleges without anyone sending their 
data anywhere. Came naturally from my BTP work on WWFL.

**Dynamic question generation (Groq LLaMA-3.3-70B)**  
A static question bank is a vulnerability. Once one question leaks on WhatsApp 
it's compromised forever. So there is no question bank.

**OS-level sandboxing for code execution**  
`resource.setrlimit` — 5s CPU, 256MB RAM, 0 disk writes, fork bomb protection. 
Learned this the hard way thinking about what someone could do with arbitrary 
code execution.

---

## Stack

**Frontend** — Next.js 14, TypeScript, Tailwind, Monaco Editor, snarkjs  
**Backend** — Python 3.11, FastAPI, PostgreSQL, Redis, PyTorch  
**Crypto** — Groth16/BN128, Poseidon hash, SHA-256  
**ML** — FedAvg + Trimmed Mean, additive secret sharing, Laplace mechanism  

---

## Running it locally

### You need
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Setup
```bash
git clone https://github.com/kanika1206/ProveIt.git
cd ProveIt

# Backend
cd backend
pip install -e .
python -m uvicorn main:app --reload --port 8000

# Redis (separate terminal)
redis-server --bind 127.0.0.1 --port 6379

# Frontend (separate terminal)
cd ..
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in your keys before running.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `POSTGRES_USER` | ✓ | DB user |
| `POSTGRES_PASSWORD` | ✓ | DB password |
| `POSTGRES_DB` | ✓ | DB name |
| `DATABASE_URL` | ✓ | Async connection string |
| `REDIS_URL` | ✓ | Redis connection |
| `JWT_SECRET` | ✓ | JWT signing key |
| `GROQ_API_KEY` | ✓* | Question generation |

*Without this, falls back to a 50-question seed bank.

---

## Pages

| Route | What it is |
|---|---|
| `/` | Landing page |
| `/assess` | Take an assessment |
| `/proofs` | Your ZK proof vault |
| `/verify/[proofId]` | Public employer verification |
| `/intel` | Placement intelligence feed |
| `/leaderboard` | Skill rankings (pseudonymised) |
| `/fl-dashboard` | Federated learning stats |

---

## License
MIT
