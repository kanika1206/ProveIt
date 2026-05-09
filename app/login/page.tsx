'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, setToken } from '../../lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.auth.login(form)
      setToken(res.access_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
          }}>
            § SIGN IN
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 900,
            letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1.05, marginBottom: 6,
          }}>
            Welcome <em style={{ color: 'var(--accent)' }}>back.</em>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Sign in to your SkillLedger account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{
          background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 2,
          padding: 28, boxShadow: '4px 4px 0 var(--ink)',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          {[
            { key: 'email',    label: 'Email',    type: 'email',    placeholder: 'you@college.edu' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••'       },
          ].map(field => (
            <div key={field.key}>
              <label style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 8,
                color: 'var(--text-muted)',
              }}>
                {field.label}
              </label>
              <input
                type={field.type} required className="input"
                value={(form as any)[field.key]}
                onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
              />
            </div>
          ))}

          {error && (
            <div style={{
              padding: '10px 14px', background: 'var(--accent-light)',
              border: '1px solid var(--accent-dim)', borderRadius: 2,
              color: 'var(--danger)', fontSize: 12, fontFamily: 'var(--font-mono)',
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: 20,
          color: 'var(--text-secondary)', fontSize: 13,
          fontFamily: 'var(--font-mono)',
        }}>
          No account?{' '}
          <Link href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>
            Sign up free →
          </Link>
        </p>
      </div>
    </div>
  )
}
