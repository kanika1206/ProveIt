'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api } from '../../lib/api'

export default function IntelPage() {
  const [feed,         setFeed]         = useState<any[]>([])
  const [trends,       setTrends]       = useState<any>(null)
  const [showSubmit,   setShowSubmit]   = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [form,         setForm]         = useState({
    company_name: '', role_level: 'SDE-1',
    difficulty_score: 5, round_count: 3, topics: '', college_tier: 'tier2',
  })
  const [submitResult, setSubmitResult] = useState<any>(null)
  const [submitting,   setSubmitting]   = useState(false)
  const [sectorFilter, setSectorFilter] = useState('')

  useEffect(() => {
    Promise.all([api.intel.feed(), api.intel.trends()])
      .then(([f, t]) => { setFeed(f.signals || []); setTrends(t) })
      .finally(() => setLoading(false))
  }, [])

  const submit = async () => {
    setSubmitting(true)
    try {
      const res = await api.intel.submit({
        ...form,
        topics: form.topics.split(',').map(t => t.trim()).filter(Boolean),
      })
      setSubmitResult(res)
    } catch (e: any) { alert(e.message) }
    finally { setSubmitting(false) }
  }

  const topTopics  = trends?.top_topics?.slice(0, 8).map(([topic, count]: [string, number]) => ({ topic, count })) || []
  const sectorData = trends?.sector_distribution
    ? Object.entries(trends.sector_distribution).map(([sector, count]) => ({ sector, count: Number(count) }))
    : []
  const sectors  = [...new Set(feed.map(s => s.company_sector))]
  const filtered = sectorFilter ? feed.filter(s => s.company_sector === sectorFilter) : feed

  const tooltipStyle = {
    background: 'var(--paper)', border: '2px solid var(--ink)',
    borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 11,
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32, borderBottom: '2px solid var(--ink)', paddingBottom: 20 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
        }}>
          § PLACEMENT INTELLIGENCE
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 900,
              letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1.05,
            }}>
              The <em style={{ color: 'var(--accent)' }}>intel.</em>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
              Anonymised signals — DP-noised before submission. No identity ever revealed.
            </p>
          </div>
          <button onClick={() => setShowSubmit(!showSubmit)} className="btn btn-primary">
            + Submit experience
          </button>
        </div>
      </div>

      {/* Submit form */}
      {showSubmit && (
        <div style={{
          background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
          padding: 24, marginBottom: 24, boxShadow: '4px 4px 0 var(--ink)',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4,
          }}>
            SHARE INTERVIEW EXPERIENCE
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
            Local differential privacy (ε=1.0) applied before your data enters the network.
          </p>

          {!submitResult ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                  Company Name
                </label>
                <input className="input" placeholder="e.g. Google, Razorpay…"
                  value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                  Role Level
                </label>
                <select className="input" value={form.role_level} onChange={e => setForm(p => ({ ...p, role_level: e.target.value }))}>
                  {['Intern', 'SDE-1', 'SDE-2', 'SDE-3', 'Senior', 'Lead'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                  Difficulty (1–10): {form.difficulty_score}
                </label>
                <input type="range" min={1} max={10} value={form.difficulty_score}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                  onChange={e => setForm(p => ({ ...p, difficulty_score: Number(e.target.value) }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                  Rounds: {form.round_count}
                </label>
                <input type="range" min={1} max={10} value={form.round_count}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                  onChange={e => setForm(p => ({ ...p, round_count: Number(e.target.value) }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                  Topics (comma-separated)
                </label>
                <input className="input" placeholder="arrays, dp, system design…"
                  value={form.topics} onChange={e => setForm(p => ({ ...p, topics: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                  College Tier
                </label>
                <select className="input" value={form.college_tier} onChange={e => setForm(p => ({ ...p, college_tier: e.target.value }))}>
                  {['tier1', 'tier2', 'tier3'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <button onClick={submit} disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Applying DP noise…' : '📡 Submit (with DP anonymisation)'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                ✓ SUBMITTED WITH DIFFERENTIAL PRIVACY
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'ORIGINAL', data: submitResult.original, color: 'var(--text-muted)' },
                  { label: 'AFTER DP', data: submitResult.privatised, color: 'var(--success)' },
                ].map(col => (
                  <div key={col.label}>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: col.color, marginBottom: 8 }}>
                      {col.label}
                    </div>
                    <pre style={{
                      fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
                      background: 'var(--cream-dark)', padding: 12, borderRadius: 2,
                      border: '1px solid var(--border-light)', overflow: 'auto',
                    }}>
                      {JSON.stringify(col.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
              <button onClick={() => setSubmitResult(null)} className="btn btn-ghost" style={{ marginTop: 12 }}>
                Submit another
              </button>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          {
            title: 'MOST-TESTED TOPICS',
            chart: (
              <BarChart data={topTopics}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="topic" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Space Mono' }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {topTopics.map((_: any, i: number) => (
                    <Cell key={i} fill={i % 2 === 0 ? 'var(--accent)' : 'var(--accent-dim)'} />
                  ))}
                </Bar>
              </BarChart>
            ),
          },
          {
            title: 'SIGNALS BY SECTOR',
            chart: (
              <BarChart data={sectorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis type="category" dataKey="sector" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="var(--olive)" radius={[0, 2, 2, 0]} />
              </BarChart>
            ),
          },
        ].map(panel => (
          <div key={panel.title} style={{
            background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2, padding: 20,
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16,
            }}>
              {panel.title}
            </p>
            <ResponsiveContainer width="100%" height={200}>{panel.chart}</ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Network stats */}
      {trends && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Signals',    value: trends.total_signals || 0 },
            { label: 'Avg Difficulty',   value: (trends.avg_difficulty || 0).toFixed(1) + '/10' },
            { label: 'Median Diff',      value: (trends.median_difficulty || 0).toFixed(1) + '/10' },
            { label: 'DP Protection',    value: 'ε=1.0' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
              padding: '16px 20px', boxShadow: '3px 3px 0 var(--ink)',
            }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 900, color: 'var(--ink)', marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sector filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['All', ...sectors].map(s => (
          <button key={s}
            onClick={() => setSectorFilter(s === 'All' ? '' : s)}
            className={`badge ${(s === 'All' && !sectorFilter) || sectorFilter === s ? 'badge-accent' : 'badge-muted'}`}
            style={{ cursor: 'pointer', border: 'none', fontSize: 10 }}>
            {s}
          </button>
        ))}
      </div>

      {/* Signal feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="shimmer" style={{ height: 56, borderRadius: 2, border: '1px solid var(--border-light)' }} />
          ))
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            No signals yet — be the first to submit.
          </div>
        ) : (
          filtered.map((signal, i) => (
            <div key={i} style={{
              background: 'var(--paper)', border: '1px solid var(--border-light)', borderRadius: 2,
              padding: '13px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="badge badge-accent">{signal.company_sector}</div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{signal.role_level}</span>
                {signal.topics?.slice(0, 3).map((t: string) => (
                  <span key={t} className="badge badge-muted" style={{ fontSize: 10 }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Diff: <span style={{ color: 'var(--warning)', fontWeight: 700 }}>
                    {signal.difficulty_score?.toFixed(1)}/10
                  </span>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Rounds: <span style={{ color: 'var(--ink)', fontWeight: 700 }}>
                    {Math.round(signal.round_count)}
                  </span>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{signal.source_college_tier}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
