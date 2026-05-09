'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, setToken } from '../../lib/api'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', full_name: '', college_id: '' })
  const [colleges, setColleges] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.colleges().then(setColleges).catch(() => {})
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.auth.signup(form)
      setToken(res.access_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const tierColors: Record<string, string> = {
    tier1: 'var(--success)', tier2: 'var(--warning)', tier3: 'var(--text-muted)',
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--accent-bright)', marginBottom: 8 }}>⬡</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Create your skill profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Start proving your skills — not your GPA.
          </p>
        </div>

        <form onSubmit={submit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Full Name</label>
              <input className="input" value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Arjun Sharma" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" required className="input" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@college.edu" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" required className="input" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Min 8 characters" minLength={8} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>College</label>
            <select className="input" value={form.college_id}
              onChange={e => setForm(p => ({ ...p, college_id: e.target.value }))}
              style={{ appearance: 'none', cursor: 'pointer' }}>
              <option value="">Select your college</option>
              {colleges.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tier})
                </option>
              ))}
            </select>
          </div>

          {/* College tier display */}
          {form.college_id && (() => {
            const col = colleges.find(c => c.id === form.college_id)
            return col ? (
              <div style={{
                padding: '10px 14px', background: 'var(--surface-2)',
                borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              }}>
                <span style={{ color: tierColors[col.tier] || 'var(--text-muted)' }}>●</span>
                <span style={{ color: 'var(--text-secondary)' }}>{col.tier.toUpperCase()} institution</span>
              </div>
            ) : null
          })()}

          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
              color: 'var(--danger)', fontSize: 13,
            }}>{error}</div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? 'Creating account...' : 'Create account →'}
          </button>

          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            A cryptographic keypair is generated for you on signup.<br />
            Your scores are commitment-encrypted — only you can open them.
          </p>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent-bright)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}