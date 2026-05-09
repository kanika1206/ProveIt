'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, clearToken } from '../../lib/api'

export default function ProfilePage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<any[]>([])
  const [proofs,      setProofs]      = useState<any[]>([])
  const [flStatus,    setFlStatus]    = useState<any>(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('sl_token')) { router.push('/login'); return }
    Promise.all([api.assessments.list(), api.proofs.list(), api.fl.status()])
      .then(([a, p, fl]) => { setAssessments(a); setProofs(p); setFlStatus(fl) })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [])

  const downloadPortfolio = () => {
    const portfolio = {
      exported_at: new Date().toISOString(),
      platform: 'SkillLedger',
      assessments: assessments.map(a => ({
        type: a.type, score: a.score, status: a.status,
        started_at: a.started_at, completed_at: a.completed_at,
      })),
      proofs: proofs.map(p => ({
        proof_id: p.proof_id, assessment_type: p.assessment_type,
        threshold: p.threshold, is_valid: p.is_valid,
        verify_url: `${window.location.origin}/verify/${p.proof_id}`,
        created_at: p.created_at,
      })),
      note: 'Proofs are cryptographically verifiable at the verify_url. No raw scores included.',
    }
    const blob = new Blob([JSON.stringify(portfolio, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'skillledger-portfolio.json'
    a.click(); URL.revokeObjectURL(url)
  }

  const logout = () => { clearToken(); router.push('/login') }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em' }}>
        LOADING PROFILE...
      </div>
    </div>
  )

  const completedAssessments = assessments.filter(a => a.status === 'completed')
  const avgScore = completedAssessments.length > 0
    ? completedAssessments.reduce((s, a) => s + (a.score || 0), 0) / completedAssessments.length : 0

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32, borderBottom: '2px solid var(--ink)', paddingBottom: 20 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
        }}>
          § PROFILE · PORTFOLIO
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 900,
            letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1.05,
          }}>
            Your <em style={{ color: 'var(--accent)' }}>record.</em>
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={downloadPortfolio} className="btn btn-secondary" style={{ fontSize: 12 }}>
              ↓ Download JSON
            </button>
            <button onClick={logout} className="btn btn-ghost" style={{ fontSize: 12 }}>
              Sign out
            </button>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
          Your full assessment history and cryptographic proof portfolio.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '2px solid var(--ink)', marginBottom: 24 }}>
        {[
          { label: 'Assessments',  value: assessments.length },
          { label: 'Completed',    value: completedAssessments.length },
          { label: 'Avg Score',    value: avgScore > 0 ? `${Math.round(avgScore * 100)}%` : '—' },
          { label: 'ZK Proofs',    value: proofs.length },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '20px 24px', textAlign: 'center',
            borderRight: i < 3 ? '1px solid var(--border-light)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 900, color: 'var(--ink)', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* FL Node */}
      {flStatus && (
        <div style={{
          background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
          padding: 20, marginBottom: 20,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14,
          }}>
            COLLEGE FL NODE
          </p>
          <div style={{ display: 'flex', gap: 24, fontSize: 13, flexWrap: 'wrap' }}>
            {[
              { label: 'Node ID',  value: flStatus.node_id,        mono: true  },
              { label: 'Strategy', value: flStatus.strategy,        mono: true  },
              { label: 'FL Round', value: flStatus.round_number,    mono: true  },
              { label: 'Gossip',   value: flStatus.gossip_alive ? '🟢 Alive' : '🔴 Down', mono: false },
            ].map(row => (
              <div key={row.label}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                  {row.label}
                </div>
                <div style={{ fontFamily: row.mono ? 'var(--font-mono)' : 'inherit', fontWeight: 700 }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment history */}
      <div style={{
        background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
        padding: 24, marginBottom: 20,
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16,
        }}>
          ASSESSMENT HISTORY
        </p>
        {assessments.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            No assessments yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {assessments.map((a, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 16px', background: 'var(--cream-dark)',
                border: '1px solid var(--border-light)', borderRadius: 2,
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className={`badge ${a.status === 'completed' ? 'badge-success' : 'badge-muted'}`}>
                    {a.status}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    {a.type?.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                  {a.score != null && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
                      {Math.round(a.score * 100)}%
                    </span>
                  )}
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    {a.started_at ? new Date(a.started_at).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ZK Proof portfolio */}
      <div style={{
        background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
        padding: 24, marginBottom: 20,
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16,
        }}>
          ZK PROOF PORTFOLIO
        </p>
        {proofs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            No proofs yet. Complete an assessment and generate a proof from the Proof Vault.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {proofs.map((p, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 16px', background: 'var(--cream-dark)',
                border: '1px solid var(--border-light)', borderRadius: 2,
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className={`badge ${p.is_valid ? 'badge-success' : 'badge-danger'}`}>
                    {p.is_valid ? '✓ Valid' : '✗ Invalid'}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    {String(p.assessment_type).replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ≥ {Math.round(p.threshold * 100)}th %ile
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {p.commitment_hash?.slice(0, 16)}…
                  </span>
                  <a href={`/verify/${p.proof_id}`} target="_blank"
                    style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    Verify →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div style={{
        padding: '14px 18px', background: 'var(--cream-dark)',
        border: '1px solid var(--border-light)', borderRadius: 2,
        fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
        fontFamily: 'var(--font-mono)',
      }}>
        🔐 Your portfolio JSON contains only proof metadata and verification URLs — never raw scores.
        Employers can verify each proof at its URL without learning anything except pass/fail.
      </div>
    </div>
  )
}
