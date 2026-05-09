'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { api } from '../../lib/api'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type Phase = 'select' | 'loading' | 'quiz' | 'submitting' | 'result'

const TYPES = [
  { id: 'dsa',           label: 'DSA',           icon: '⚡',  desc: 'Arrays · Trees · Graphs · DP · Strings' },
  { id: 'aptitude',      label: 'Aptitude',       icon: '🧮', desc: 'Quant · Logical Reasoning · Verbal' },
  { id: 'system_design', label: 'System Design',  icon: '🏗️', desc: 'Architecture · Scalability · Databases' },
]

function useProctoring(enabled: boolean) {
  const flags = useRef<string[]>([])
  useEffect(() => {
    if (!enabled) return
    const onVisibility = () => { if (document.hidden) flags.current.push('TAB_SWITCH_' + Date.now()) }
    const onPaste = () => flags.current.push('PASTE_' + Date.now())
    const onCopy  = () => flags.current.push('COPY_'  + Date.now())
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('paste', onPaste)
    document.addEventListener('copy',  onCopy)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('paste', onPaste)
      document.removeEventListener('copy',  onCopy)
    }
  }, [enabled])
  return flags
}

function Timer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(id)
  }, [startTime])
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize:   14,
      color:      elapsed > 1800 ? 'var(--danger)' : 'var(--ink)',
    }}>
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  )
}

export default function AssessPage() {
  const router = useRouter()
  const [phase,        setPhase]        = useState<Phase>('select')
  const [selectedType, setSelectedType] = useState<string>('dsa')
  const [assessment,   setAssessment]   = useState<any>(null)
  const [answers,      setAnswers]      = useState<Record<string, number | string>>({})
  const [currentQ,     setCurrentQ]     = useState(0)
  const [result,       setResult]       = useState<any>(null)
  const [error,        setError]        = useState('')
  const [startTime,    setStartTime]    = useState(Date.now())
  const proctoringFlags = useProctoring(phase === 'quiz')

  const startAssessment = async () => {
    setPhase('loading'); setError('')
    try {
      const data = await api.assessments.start({ assessment_type: selectedType, question_count: 10 })
      setAssessment(data); setCurrentQ(0); setAnswers({})
      setStartTime(Date.now()); setPhase('quiz')
    } catch (e: any) { setError(e.message); setPhase('select') }
  }

  const submitAssessment = async () => {
    setPhase('submitting')
    try {
      const data = await api.assessments.submit({ assessment_id: assessment.assessment_id, answers })
      setResult(data); setPhase('result')
    } catch (e: any) { setError(e.message); setPhase('quiz') }
  }

  const q        = assessment?.questions?.[currentQ]
  const progress = assessment ? (currentQ / assessment.questions.length) * 100 : 0

  /* ── SELECT ── */
  if (phase === 'select') return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
      }}>
        § START ASSESSMENT
      </p>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 900,
        letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 8, lineHeight: 1.05,
      }}>
        Prove your skills,<br /><em style={{ color: 'var(--accent)' }}>not your GPA.</em>
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
        Questions are generated live by AI — no two assessments are identical.
        Your score is commitment-encrypted immediately on completion.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {TYPES.map(t => (
          <div key={t.id} onClick={() => setSelectedType(t.id)} style={{
            padding:      '18px 22px',
            borderRadius: 2,
            cursor:       'pointer',
            border:       `2px solid ${selectedType === t.id ? 'var(--accent)' : 'var(--ink)'}`,
            background:   selectedType === t.id ? 'var(--accent-light)' : 'var(--paper)',
            display:      'flex',
            alignItems:   'center',
            gap:          16,
            transition:   'all 0.15s',
            boxShadow:    selectedType === t.id ? '3px 3px 0 var(--accent)' : '3px 3px 0 var(--ink)',
          }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{t.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-serif)', marginBottom: 2 }}>
                {t.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {t.desc}
              </div>
            </div>
            {selectedType === t.id && (
              <div style={{
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11,
                color: 'var(--accent)', letterSpacing: '0.08em',
              }}>
                SELECTED ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', background: 'var(--accent-light)',
          border: '1px solid var(--accent-dim)', borderRadius: 2,
          color: 'var(--danger)', fontSize: 13, marginBottom: 16,
          fontFamily: 'var(--font-mono)',
        }}>
          {error}
        </div>
      )}

      <button onClick={startAssessment} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 14 }}>
        Generate My Assessment →
      </button>

      <div style={{
        marginTop: 20, padding: '14px 18px',
        background: 'var(--cream-dark)', border: '1px solid var(--border-light)',
        borderRadius: 2, fontSize: 12,
        color: 'var(--text-muted)', display: 'flex', gap: 10, alignItems: 'center',
        fontFamily: 'var(--font-mono)',
      }}>
        🤖 Generated by Groq LLaMA-3.3-70B on demand · Results committed to tamper-evident ledger.
      </div>
    </div>
  )

  /* ── LOADING ── */
  if (phase === 'loading') return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid var(--border-light)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 1s linear infinite',
      }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
          Generating your question set…
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
          Groq LLaMA-3.3-70B · ~5 seconds
        </div>
      </div>
    </div>
  )

  /* ── RESULT ── */
  if (phase === 'result' && result) return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32, borderBottom: '2px solid var(--ink)', paddingBottom: 20 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
        }}>
          § ASSESSMENT COMPLETE
        </p>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 72, fontWeight: 900,
          letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1,
        }}>
          {Math.round(result.score * 100)}
          <span style={{ fontSize: 32, color: 'var(--accent)' }}>%</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
          {result.percentage} correct · Results committed to ledger
        </p>
      </div>

      {/* Commitment hash */}
      <div style={{
        background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
        padding: 20, marginBottom: 16, boxShadow: '3px 3px 0 var(--ink)',
      }} className="chain-append">
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
        }}>
          🔐 CRYPTOGRAPHIC COMMITMENT
        </p>
        <div className="hash-display">{result.commitment_hash}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
          Ledger: {result.ledger_entry_hash?.slice(0, 32)}...
        </div>
      </div>

      {/* Per-tag scores */}
      {result.per_tag_scores && (
        <div style={{
          background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
          padding: 20, marginBottom: 16,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16,
          }}>
            SCORE BY TOPIC
          </p>
          {Object.entries(result.per_tag_scores).map(([tag, score]: [string, any]) => (
            <div key={tag} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{tag}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {Math.round(Number(score) * 100)}%
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--cream-dark)', borderRadius: 1 }}>
                <div style={{
                  height: '100%', borderRadius: 1,
                  width: `${Math.round(Number(score) * 100)}%`,
                  background: Number(score) > 0.7 ? 'var(--success)' : Number(score) > 0.4 ? 'var(--warning)' : 'var(--danger)',
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => router.push('/proofs')} className="btn btn-primary">
          Generate ZK Proof →
        </button>
        <button onClick={() => { setPhase('select'); setResult(null) }} className="btn btn-secondary">
          Take another
        </button>
        <button onClick={() => router.push('/dashboard')} className="btn btn-ghost">
          Dashboard
        </button>
      </div>
    </div>
  )

  /* ── QUIZ ── */
  if (phase === 'quiz' && q) return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, borderBottom: '2px solid var(--ink)', paddingBottom: 14,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
            Q {currentQ + 1} / {assessment.questions.length}
          </span>
          <div className="badge badge-accent">{q.topic} · {q.difficulty}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {proctoringFlags.current.length > 0 && (
            <div className="badge badge-warning">
              ⚠ {proctoringFlags.current.length} flag{proctoringFlags.current.length > 1 ? 's' : ''}
            </div>
          )}
          <Timer startTime={startTime} />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--cream-dark)', borderRadius: 1, marginBottom: 24 }}>
        <div style={{
          height: '100%', borderRadius: 1, background: 'var(--accent)',
          width: `${progress}%`, transition: 'width 0.3s',
        }} />
      </div>

      {/* Question */}
      <div style={{
        background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
        padding: 20, marginBottom: 16,
      }}>
        <div style={{ fontSize: 15, lineHeight: 1.7, fontWeight: 500, color: 'var(--ink)' }}>
          {q.question_text || q.question}
        </div>
      </div>

      {/* MCQ options */}
      {q.options && q.options.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {q.options.map((opt: string, idx: number) => {
            const selected = answers[q.id] === idx
            return (
              <button key={idx} onClick={() => setAnswers(p => ({ ...p, [q.id]: idx }))} style={{
                padding:      '13px 18px',
                borderRadius: 2,
                cursor:       'pointer',
                textAlign:    'left',
                border:       `2px solid ${selected ? 'var(--accent)' : 'var(--ink)'}`,
                background:   selected ? 'var(--accent-light)' : 'var(--paper)',
                color:        'var(--ink)',
                fontSize:     14,
                transition:   'all 0.15s',
                display:      'flex',
                alignItems:   'center',
                gap:          12,
                boxShadow:    selected ? '2px 2px 0 var(--accent)' : '2px 2px 0 var(--ink)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 2, flexShrink: 0,
                  border: `2px solid ${selected ? 'var(--accent)' : 'var(--border-light)'}`,
                  background: selected ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
                  color: selected ? 'white' : 'var(--text-muted)',
                }}>
                  {String.fromCharCode(65 + idx)}
                </div>
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {/* Open answer */}
      {(!q.options || q.options.length === 0) && (
        <textarea className="input" style={{ minHeight: 120, resize: 'vertical', marginBottom: 24 }}
          placeholder="Describe your approach..."
          value={String(answers[q.id] || '')}
          onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
        />
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
          disabled={currentQ === 0} className="btn btn-secondary">
          ← Previous
        </button>
        {currentQ < assessment.questions.length - 1 ? (
          <button onClick={() => setCurrentQ(p => p + 1)} className="btn btn-primary">
            Next →
          </button>
        ) : (
          <button onClick={submitAssessment} disabled={phase === 'submitting' as any}
            className="btn btn-primary" style={{ background: 'var(--success)' }}>
            {(phase as string) === 'submitting' ? 'Submitting...' : 'Submit ✓'}
          </button>
        )}
      </div>

      {/* Meta */}
      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        {assessment.generated_by?.toUpperCase() || 'AI'} ·{' '}
        {assessment.cache_hit ? 'Cached' : `${assessment.generation_latency_ms}ms`} ·{' '}
        {assessment.fallback_triggered ? '⚠ Fallback' : 'Live Groq API'}
      </div>
    </div>
  )

  return null
}
