import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/nav/Navbar'
import { Toaster } from '@/components/ui/sonner'
import { Heart } from 'lucide-react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'KindredAdvice — Real Advice from Real People',
    template: '%s | KindredAdvice',
  },
  description:
    "A safe, warm community where you can share what's on your heart and get genuine advice from people who care.",
  openGraph: {
    title: 'KindredAdvice',
    description: 'A safe community for relationship advice and support.',
    siteName: 'KindredAdvice',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">{children}</main>

        <footer className="border-t border-border bg-card/50 py-12 mt-12">
          <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-5 text-center">
            {/* Logo */}
            <div className="flex items-center gap-2.5 font-extrabold text-lg">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-md shadow-violet-500/20">
                <Heart className="w-3.5 h-3.5 fill-white stroke-white" />
              </div>
              <span className="gradient-text-purple">KindredAdvice</span>
            </div>

            <p className="text-sm text-muted-foreground max-w-sm">
              A safe space to share, listen, and grow together. Real advice from real people who care.
            </p>

            <div className="flex gap-6 text-sm">
              <a href="/guidelines" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Community Guidelines
              </a>
              <a href="/requests" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Browse Requests
              </a>
            </div>

            <p className="text-xs text-muted-foreground/50">
              &copy; {new Date().getFullYear()} KindredAdvice &mdash; Be kind.
            </p>
          </div>
        </footer>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
