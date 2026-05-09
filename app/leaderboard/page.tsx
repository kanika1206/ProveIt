'use client'
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

const DOMAINS = [
  { id: 'dsa',           label: 'DSA',          icon: '⚡'  },
  { id: 'system_design', label: 'System Design', icon: '🏗️' },
  { id: 'aptitude',      label: 'Aptitude',      icon: '🧮' },
]

export default function LeaderboardPage() {
  const [domain,  setDomain]  = useState('dsa')
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.leaderboard.get(domain).then(setData).finally(() => setLoading(false))
  }, [domain])

  const entries = data?.entries || []

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32, borderBottom: '2px solid var(--ink)', paddingBottom: 20 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
        }}>
          § 005 · THE HALL OF FAME
        </p>
        <h1 style={{
          fontFamily:    'var(--font-serif)',
          fontSize:      56,
          fontWeight:    900,
          letterSpacing: '-0.03em',
          color:         'var(--ink)',
          lineHeight:    1.0,
        }}>
          The <em style={{ color: 'var(--accent)' }}>hall.</em>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>
          Pseudonymised skill percentile rankings. No names, no colleges — only proven ability.
        </p>
      </div>

      {/* Domain selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {DOMAINS.map(d => (
          <button key={d.id} onClick={() => setDomain(d.id)}
            className={`btn ${domain === d.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 12 }}>
            {d.icon} {d.label}
          </button>
        ))}
      </div>

      {/* Distribution bar */}
      {data && (
        <div style={{
          background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
          padding: '16px 20px', marginBottom: 20,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 10,
          }}>
            {data.total_participants} verified participants · Pseudonymised ranking
          </div>
          <div style={{ height: 6, background: 'var(--cream-dark)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--danger), var(--warning), var(--success))',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
            <span>0th</span><span>50th</span><span>100th percentile</span>
          </div>
        </div>
      )}

      {/* Entries table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px 100px',
        gap: 12, padding: '8px 16px', borderBottom: '2px solid var(--ink)',
        marginBottom: 4,
      }}>
        {['RANK', 'PSEUDONYM', 'SCORE', '%ILE', 'BAR'].map(h => (
          <span key={h} style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {loading ? (
          Array(10).fill(0).map((_, i) => (
            <div key={i} className="shimmer" style={{ height: 52, borderRadius: 2, border: '1px solid var(--border-light)' }} />
          ))
        ) : entries.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12,
          }}>
            No verified results yet for {domain}. Be first — take an assessment.
          </div>
        ) : (
          entries.map((entry: any, i: number) => (
            <div key={i} style={{
              display:      'grid',
              gridTemplateColumns: '48px 1fr 80px 80px 100px',
              gap:          12,
              alignItems:   'center',
              padding:      '12px 16px',
              background:   i < 3 ? 'var(--accent-light)' : 'var(--paper)',
              border:       `2px solid ${i < 3 ? 'var(--accent)' : 'var(--ink)'}`,
              borderRadius: 2,
              boxShadow:    i < 3 ? '2px 2px 0 var(--accent)' : '2px 2px 0 var(--ink)',
            }}>
              {/* Rank */}
              <div style={{
                fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 16,
                color: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--olive)' : i === 2 ? 'var(--warning)' : 'var(--text-muted)',
              }}>
                {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${entry.rank}`}
              </div>

              {/* Pseudonym */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: 700 }}>
                {entry.pseudonym}
              </div>

              {/* Score */}
              <div style={{
                fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 900,
                color: 'var(--ink)', textAlign: 'right',
              }}>
                {entry.score}
              </div>

              {/* Percentile */}
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'right',
                color: entry.percentile > 75 ? 'var(--success)' : entry.percentile > 50 ? 'var(--warning)' : 'var(--text-muted)',
                fontWeight: 700,
              }}>
                {entry.percentile}th
              </div>

              {/* Bar */}
              <div style={{ height: 6, background: 'var(--cream-dark)', borderRadius: 1 }}>
                <div style={{
                  width: `${entry.percentile}%`, height: '100%', borderRadius: 1,
                  background: entry.percentile > 75 ? 'var(--success)' : entry.percentile > 50 ? 'var(--warning)' : 'var(--danger)',
                }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
