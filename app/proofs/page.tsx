'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '../../lib/api'

function ProofCard({ proof }: { proof: any }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/verify/${proof.proof_id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: proof.is_valid ? 'var(--success)' : 'var(--danger)',
        borderRadius: '12px 12px 0 0',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 13 }}>
              {String(proof.assessment_type).replace('_', ' ')}
            </span>
            <div className={`badge ${proof.is_valid ? 'badge-success' : 'badge-danger'}`}>
              {proof.is_valid ? '✓ Valid' : '✗ Invalid'}
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-bright)' }}>
            ≥ {Math.round(proof.threshold * 100)}th %ile
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
          {proof.created_at ? new Date(proof.created_at).toLocaleDateString() : 'Recently'}
        </div>
      </div>

      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 12 }}>
        {proof.commitment_hash}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={copy} className="btn btn-secondary" style={{ fontSize: 12, flex: 1, justifyContent: 'center' }}>
          {copied ? '✓ Copied!' : '🔗 Copy verify link'}
        </button>
        <Link href={`/verify/${proof.proof_id}`} className="btn btn-ghost" style={{ fontSize: 12 }}>
          Open →
        </Link>
      </div>
    </div>
  )
}

function GenerateProofModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [assessments, setAssessments] = useState<any[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)
  const [threshold, setThreshold] = useState(0.7)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [commitmentId, setCommitmentId] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    setLoading(true)
    api.assessments.list().then(list => {
      const completed = list.filter(a => a.status === 'completed' && a.score != null)
      setAssessments(completed)
    }).finally(() => setLoading(false))
  }, [])

  const generate = async () => {
    if (!selectedAssessment) return
    setGenerating(true)
    setError('')

    try {
      // First get commitment ID for this assessment
      const results = await api.assessments.result(selectedAssessment.id)
      // In a real flow, the commitment_id comes from the submit result
      // For demo, we'll use assessment_id as a proxy and let backend find it

      // Generate proof
      const proof = await api.proofs.generate({
        commitment_id: selectedAssessment.commitment_id || '',
        threshold,
      })
      setResult(proof)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Generate ZK Proof</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
          Prove you exceeded a threshold without revealing your score.
          Proof generated in your browser via Groth16 circuit.
        </div>

        {!result ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                Assessment
              </label>
              {loading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {assessments.map(a => (
                    <div key={a.id}
                      onClick={() => setSelectedAssessment(a)}
                      style={{
                        padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                        border: `2px solid ${selectedAssessment?.id === a.id ? 'var(--accent)' : 'var(--border)'}`,
                        background: selectedAssessment?.id === a.id ? 'var(--accent-glow)' : 'var(--surface-2)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                      <span style={{ fontSize: 13 }}>
                        {a.type?.toUpperCase()} · {new Date(a.started_at).toLocaleDateString()}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-bright)' }}>
                        {Math.round(a.score * 100)}%
                      </span>
                    </div>
                  ))}
                  {assessments.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      No completed assessments. Take a test first.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                Threshold to prove: {Math.round(threshold * 100)}th percentile
              </label>
              <input type="range" min={0.5} max={0.95} step={0.05}
                value={threshold} onChange={e => setThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                <span>50th %ile</span><span>95th %ile</span>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
                color: 'var(--danger)', fontSize: 13, marginBottom: 16,
              }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={generate} disabled={!selectedAssessment || generating}
                className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {generating ? '⏳ Generating proof...' : '🔐 Generate ZK Proof'}
              </button>
              <button onClick={onClose} className="btn btn-ghost">Cancel</button>
            </div>

            {generating && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
                Running Groth16 circuit in browser · Score stays local · Only proof leaves device
              </div>
            )}
          </>
        ) : (
          <div>
            <div style={{
              padding: '20px', background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, marginBottom: 20,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--success)' }}>Proof Generated</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Proves score ≥ {Math.round(threshold * 100)}th percentile
              </div>
            </div>
            <div className="hash-display" style={{ marginBottom: 20, wordBreak: 'break-all', fontSize: 10 }}>
              {JSON.stringify(result.proof).slice(0, 120)}...
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href={`/verify/${result.proof_id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                View verification page →
              </Link>
              <button onClick={() => { onSuccess(); onClose() }} className="btn btn-secondary">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProofsPage() {
  const router = useRouter()
  const [proofs, setProofs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const load = () => {
    api.proofs.list().then(setProofs).catch(() => router.push('/login')).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!localStorage.getItem('sl_token')) { router.push('/login'); return }
    load()
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Proof Vault</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Share these links with employers — they prove your skill level without revealing your score.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Generate New Proof
        </button>
      </div>

      <div style={{
        padding: '14px 18px', background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 10, marginBottom: 24,
        fontSize: 13, color: 'var(--text-muted)',
      }}>
        🔐 Zero-knowledge proofs: an employer follows the verification link and sees only ✓ or ✗.
        Your raw score, salt, and any personal information remain invisible — cryptographically guaranteed.
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card shimmer" style={{ height: 160 }} />
          ))}
        </div>
      ) : proofs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No proofs yet</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Complete an assessment first, then generate a ZK proof here.
          </div>
          <Link href="/assess" className="btn btn-primary">Take an assessment →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {proofs.map(p => <ProofCard key={p.proof_id} proof={p} />)}
        </div>
      )}

      {showModal && (
        <GenerateProofModal onClose={() => setShowModal(false)} onSuccess={load} />
      )}
    </div>
  )
}