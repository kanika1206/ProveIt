import type { Metadata } from 'next'
import './globals.css'
import  Navbar  from './components/Navbar'

export const metadata: Metadata = {
  title: 'ProveIt — Prove Your Skills, Not Your GPA',
  description: 'Privacy-preserving skill verification and placement intelligence for students.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* ── Google Fonts ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />

        {/* ── Favicon ── */}
        <link rel="icon" href="/favicon.ico" />

        {/* ── Meta Theme Color (matches cream background) ── */}
        <meta name="theme-color" content="#F5F0E8" />
      </head>

      <body
        className={[
          // Base background & text
          'bg-cream text-ink',
          // Font
          'font-sans',
          // Antialiasing
          'antialiased',
          // Grain texture overlay from globals.css
          'grain',
          // Minimum height
          'min-h-screen',
          // Prevent horizontal scroll
          'overflow-x-hidden',
        ].join(' ')}
      >
        {/* ── Subtle full-page paper gradient ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-paper-gradient"
        />

        {/* ── Very faint dot grid overlay for paper texture ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-dot-grid opacity-[0.18]"
          style={{ backgroundSize: '24px 24px' }}
        />

        {/* ── Navbar ── */}
        <Navbar />

        {/* ── Page Content ── */}
        <main className="relative z-0">
          {children}
        </main>

        {/* ── Bottom page edge line ── */}
        <footer
          aria-hidden="true"
          className="w-full border-t border-border mt-auto py-6 px-6
                     flex items-center justify-between
                     bg-cream-dark"
        >
          <span className="text-label text-text-muted">
            © {new Date().getFullYear()} ProveIt
          </span>
          <span className="text-label text-text-muted">
            Your code, notarised.
          </span>
        </footer>

      </body>
    </html>
  )
}
