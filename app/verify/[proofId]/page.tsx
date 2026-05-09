'use client'
import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

export default function VerifyPage({ params }: { params: { proofId: string } }) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = params.proofId
    if (id === 'demo') {
      setResult({
        is_valid: true,
        assessment_type: 'dsa',
        threshold: 0.75,
        threshold_label: '75%',
        message: 'This candidate has proven they scored above the 75% threshold on a DSA assessment. No other information was revealed.',
        commitment_hash: 'a3f2b91ce4d7...demo',
        verified_at: Date.now() / 1000,
      })
      setLoading(false)
      return
    }
    api.proofs.verify(id)
      .then(setResult)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [params.proofId])

  if (loading) return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Verifying Groth16 proof...</div>
        <div style={{ fontSize: 12 }}>Running pairing checks on BN128 curve</div>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ maxWidth: 520, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Proof not found</div>
      <div style={{ color: 'var(--text-muted)' }}>{error}</div>
    </div>
  )

  const valid = result?.is_valid

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px' }}>
      {/* Verification result */}
      <div style={{
        textAlign: 'center', padding: '48px 40px',
        background: valid
          ? 'linear-gradient(135deg, rgba(34,197,94,0.12), transparent)'
          : 'linear-gradient(135deg, rgba(239,68,68,0.12), transparent)',
        border: `2px solid ${valid ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
        borderRadius: 20, marginBottom: 32,
      }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>{valid ? '✅' : '❌'}</div>
        <div style={{
          fontSize: 28, fontWeight: 800, marginBottom: 12,
          color: valid ? 'var(--success)' : 'var(--danger)',
        }}>
          {valid ? 'PROOF VALID' : 'PROOF INVALID'}
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {result?.message}
        </div>
      </div>

      {/* Proof metadata */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>Proof Details</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Assessment Type', value: result?.assessment_type?.toUpperCase()?.replace('_', ' ') },
            { label: 'Threshold Proven', value: `Score ≥ ${result?.threshold_label || (result?.threshold * 100 + '%')}` },
            { label: 'Protocol', value: 'Groth16 / BN128', mono: true },
            { label: 'Hash Function', value: 'Poseidon (ZK-friendly)', mono: true },
            { label: 'Verified At', value: result?.verified_at ? new Date(result.verified_at * 1000).toLocaleString() : '-' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: 10, borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.label}</span>
              <span style={{
                fontSize: 13,
                fontFamily: row.mono ? 'var(--font-mono)' : 'inherit',
                color: 'var(--text-primary)',
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Commitment hash */}
      {result?.commitment_hash && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Commitment Hash (Poseidon output, stored on ledger)
          </div>
          <div className="hash-display">{result.commitment_hash}</div>
        </div>
      )}

      {/* What this proves / doesn't prove */}
      <div className="card" style={{ background: 'var(--ink-3)' }}>
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>How to interpret this</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
          {[
            { icon: '✓', text: 'This candidate sat a verified assessment', color: 'var(--success)' },
            { icon: '✓', text: `Their score exceeds the ${result?.threshold_label} threshold`, color: 'var(--success)' },
            { icon: '✓', text: 'The proof was generated client-side — score never sent to any server', color: 'var(--success)' },
            { icon: '✗', text: 'Their exact score — not revealed', color: 'var(--danger)' },
            { icon: '✗', text: 'Their name, college, or CGPA — not revealed', color: 'var(--danger)' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: item.color, fontWeight: 700, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        Powered by SkillLedger · Zero-Knowledge Proof System
      </div>
    </div>
  )
}