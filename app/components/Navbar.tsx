'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { clearToken } from '../lib/api'

const NAV = [
  { href: '/dashboard',    label: 'Dashboard' },
  { href: '/assess',       label: 'Assess' },
  { href: '/proofs',       label: 'Proof Vault' },
  { href: '/intel',        label: 'Intel' },
  { href: '/leaderboard',  label: 'Leaderboard' },
  { href: '/fl-dashboard', label: 'FL Monitor' },
  { href: '/profile',      label: 'Profile' },
]

export function Navbar() {
  const path     = usePathname()
  const router   = useRouter()
  const [authed, setAuthed] = useState(false)
  const [open,   setOpen]   = useState(false)

  useEffect(() => {
    setAuthed(!!localStorage.getItem('sl_token'))
  }, [path])

  const logout = () => { clearToken(); router.push('/login') }

  return (
    <nav style={{
      position:     'sticky',
      top:          0,
      zIndex:       100,
      background:   'var(--cream)',
      borderBottom: '2px solid var(--ink)',
    }}>
      <div style={{
        maxWidth:   1200,
        margin:     '0 auto',
        padding:    '0 24px',
        display:    'flex',
        alignItems: 'center',
        height:     56,
        gap:        4,
      }}>

        {/* Logo */}
        <Link href="/" style={{
          fontFamily:     'var(--font-serif)',
          fontWeight:     900,
          fontSize:       17,
          color:          'var(--ink)',
          textDecoration: 'none',
          marginRight:    24,
          letterSpacing:  '-0.02em',
          fontStyle:      'italic',
        }}>
          ⬡ <em style={{ color: 'var(--accent)' }}>Prove</em>It
        </Link>

        {/* Nav links */}
        {authed && NAV.map(({ href, label }) => (
          <Link key={href} href={href} style={{
            fontSize:       12,
            fontWeight:     600,
            fontFamily:     'var(--font-mono)',
            letterSpacing:  '0.04em',
            padding:        '5px 10px',
            borderRadius:   2,
            color:          path === href ? 'var(--accent)' : 'var(--text-secondary)',
            background:     path === href ? 'var(--accent-light)' : 'transparent',
            border:         path === href ? '1px solid var(--accent-dim)' : '1px solid transparent',
            textDecoration: 'none',
            transition:     'all 0.15s',
          }}>
            {label}
          </Link>
        ))}

        <div style={{ flex: 1 }} />

        {authed ? (
          <button onClick={logout} className="btn btn-ghost" style={{ fontSize: 12 }}>
            Sign out
          </button>
        ) : (
          <>
            <Link href="/login"  className="btn btn-ghost"     style={{ fontSize: 12 }}>Sign in</Link>
            <Link href="/signup" className="btn btn-primary"   style={{ fontSize: 12 }}>Get started</Link>
          </>
        )}
      </div>
    </nav>
  )
}
