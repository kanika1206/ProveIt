'use client'
import { useEffect, useState, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../../lib/api'

export default function FLDashboardPage() {
  const [status,     setStatus]     = useState<any>(null)
  const [rounds,     setRounds]     = useState<any[]>([])
  const [aiHealth,   setAiHealth]   = useState<any>(null)
  const [triggering, setTriggering] = useState(false)
  const [strategy,   setStrategy]   = useState('fedavg')
  const [numNodes,   setNumNodes]   = useState(5)
  const [wsConnected,setWsConnected]= useState(false)
  const [wsMessages, setWsMessages] = useState<any[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  const load = async () => {
    const [s, r, h] = await Promise.all([api.fl.status(), api.fl.rounds(), api.ai.health()])
    setStatus(s); setRounds(r); setAiHealth(h)
  }

  useEffect(() => {
    load()
    try {
      const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}/ws/fl-round`)
      wsRef.current = ws
      ws.onopen    = () => setWsConnected(true)
      ws.onclose   = () => setWsConnected(false)
      ws.onmessage = e => {
        try {
          const msg = JSON.parse(e.data)
          setWsMessages(prev => [msg, ...prev].slice(0, 20))
          if (msg.type === 'ROUND_COMPLETE') load()
        } catch {}
      }
    } catch {}
    return () => { wsRef.current?.close() }
  }, [])

  const triggerRound = async () => {
    setTriggering(true)
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ command: 'TRIGGER_ROUND', num_nodes: numNodes, strategy }))
      } else {
        await api.fl.triggerRound(numNodes, strategy)
      }
      await load()
    } catch (e: any) { alert(e.message) }
    finally { setTriggering(false) }
  }

  const accuracyData = rounds.slice().reverse().map(r => ({
    round: r.round_number,
    accuracy: Math.round((r.accuracy || 0) * 100),
  }))

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
          § FL OBSERVABILITY
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 900,
              letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1.05,
            }}>
              Federated <em style={{ color: 'var(--accent)' }}>learning.</em>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
              FL rounds · Byzantine detection · Secret-shared gradients
            </p>
          </div>
          <div className={`badge ${wsConnected ? 'badge-success' : 'badge-muted'}`}>
            {wsConnected ? '● WS Live' : '○ WS Offline'}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Current Round',  value: status?.round_number || 0 },
          { label: 'Strategy',       value: status?.strategy || '—'   },
          { label: 'Gossip Signals', value: status?.known_signals || 0 },
          { label: 'Peers',          value: status?.peers || 0         },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
            padding: '16px 20px', textAlign: 'center', boxShadow: '3px 3px 0 var(--ink)',
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 900, color: 'var(--ink)', marginBottom: 4 }}>
              {s.value}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Accuracy chart */}
        <div style={{ background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2, padding: 24 }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16,
          }}>
            GLOBAL MODEL ACCURACY BY ROUND
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="round" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis domain={[40, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [v + '%', 'Accuracy']} />
              <Line type="monotone" dataKey="accuracy" stroke="var(--accent)" strokeWidth={2}
                dot={{ fill: 'var(--accent)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trigger controls */}
        <div style={{ background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2, padding: 24 }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16,
          }}>
            TRIGGER FL ROUND
          </p>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.06em' }}>
              STRATEGY
            </p>
            {['fedavg', 'trimmed_mean'].map(s => (
              <label key={s} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', padding: '6px 0', fontSize: 13,
              }}>
                <input type="radio" name="strategy" value={s} checked={strategy === s}
                  onChange={() => setStrategy(s)} style={{ accentColor: 'var(--accent)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {s === 'fedavg' ? 'FedAvg (weighted mean)' : 'Trimmed Mean (Byzantine-robust)'}
                </span>
              </label>
            ))}
          </div>
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.06em' }}>
              NODES: {numNodes}
            </p>
            <input type="range" min={3} max={10} value={numNodes}
              onChange={e => setNumNodes(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
          <button onClick={triggerRound} disabled={triggering} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}>
            {triggering ? '⏳ Running…' : '▶ Trigger Round'}
          </button>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
            Gradients are secret-shared (additive two-party). Byzantine nodes flagged at ±2σ gradient norm.
          </p>
        </div>
      </div>

      {/* AI Health */}
      {aiHealth && (
        <div style={{
          background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
          padding: 24, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
            }}>
              🤖 AI HEALTH PANEL
            </p>
            <div className={`badge ${aiHealth.groq_configured ? 'badge-success' : 'badge-warning'}`}>
              {aiHealth.groq_configured ? 'Groq Connected' : 'Fallback Mode'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Total API Calls',      value: aiHealth.total_api_calls },
              { label: 'Fallback Rate',         value: aiHealth.fallback_rate },
              { label: 'Avg Latency',           value: `${aiHealth.runtime_stats?.avg_latency_ms || 0}ms` },
              { label: 'Model',                 value: aiHealth.groq_model, small: true },
              { label: 'Cache TTL',             value: `${aiHealth.question_cache_ttl_seconds}s` },
              { label: 'Fallbacks Triggered',   value: aiHealth.fallback_triggered_count },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '14px 16px', background: 'var(--cream-dark)',
                border: '1px solid var(--border-light)', borderRadius: 2,
              }}>
                <div style={{
                  fontSize: stat.small ? 12 : 22, fontWeight: 900,
                  color: 'var(--ink)', fontFamily: stat.small ? 'var(--font-mono)' : 'var(--font-serif)',
                  marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {String(stat.value)}
                </div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Round history */}
      <div style={{ background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2, padding: 24, marginBottom: 24 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16,
        }}>
          ROUND HISTORY
        </p>
        {rounds.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            No rounds yet — trigger one above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rounds.map(r => (
              <div key={r.id} style={{
                padding: '11px 16px', background: 'var(--cream-dark)',
                border: '1px solid var(--border-light)', borderRadius: 2,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                    Round #{r.round_number}
                  </span>
                  <div className="badge badge-muted" style={{ fontSize: 10 }}>{r.strategy}</div>
                  {r.byzantine_nodes?.length > 0 && (
                    <div className="badge badge-danger" style={{ fontSize: 10 }}>
                      ⚠ {r.byzantine_nodes.length} Byzantine
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Accuracy: <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                      {r.accuracy ? Math.round(r.accuracy * 100) + '%' : '—'}
                    </span>
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Nodes: <span style={{ color: 'var(--ink)', fontWeight: 700 }}>
                      {r.participating_nodes?.length || 0}
                    </span>
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                    {r.global_model_hash?.slice(0, 12)}…
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WS event log */}
      <div style={{ background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2, padding: 24 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
        }}>
          LIVE EVENT STREAM
          <span style={{ marginLeft: 8, fontWeight: 400, color: 'var(--border-light)' }}>
            /ws/fl-round
          </span>
        </p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {wsMessages.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>Waiting for events…</div>
          ) : (
            wsMessages.slice(0, 8).map((msg, i) => (
              <div key={i} style={{
                padding: '6px 10px', background: 'var(--cream-dark)',
                border: '1px solid var(--border-light)', borderRadius: 2,
                color: msg.type === 'ROUND_COMPLETE' ? 'var(--success)' : 'var(--text-secondary)',
                display: 'flex', gap: 12,
              }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{msg.type}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {JSON.stringify(msg).slice(0, 80)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
