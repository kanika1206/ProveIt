import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Navbar'

export const metadata: Metadata = {
  title: 'ProveIt — Prove Your Skills, Not Your GPA',
  description:
    'Privacy-preserving skill verification and placement intelligence for students.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Theme Color */}
        <meta name="theme-color" content="#F5F0E8" />
      </head>

      <body className="bg-[#F5F0E8] text-black font-sans antialiased min-h-screen overflow-x-hidden">

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="relative z-0">
          {children}
        </main>

        {/* Footer */}
        <footer
          aria-hidden="true"
          className="w-full border-t border-black mt-auto py-6 px-6 flex items-center justify-between bg-[#EDE8DC]"
        >
          <span className="text-xs text-gray-600">
            © {new Date().getFullYear()} ProveIt
          </span>

          <span className="text-xs text-gray-600">
            Your code, notarised.
          </span>
        </footer>

      </body>
    </html>
  )
}