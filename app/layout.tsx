import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/nav/Navbar'
import { Toaster } from '@/components/ui/sonner'
import { Heart, MessageSquare, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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

        <footer className="mt-20 relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #1e0b3d 0%, #2d1265 40%, #1a0a32 100%)' }}>
          {/* Gradient top accent */}
          <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #c026d3 35%, #f43f5e 65%, #7c3aed 100%)' }} />

          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-fuchsia-600/10 blur-3xl" />

          {/* Main footer grid */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-10">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

              {/* Brand column */}
              <div className="lg:col-span-2 space-y-5">
                <Link href="/" className="flex items-center gap-3 font-extrabold text-xl text-white">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
                  >
                    <Heart className="w-5 h-5 fill-white stroke-white" />
                  </div>
                  KindredAdvice
                </Link>
                <p className="text-white/60 leading-relaxed text-sm max-w-xs">
                  A safe, warm community where you can share what&apos;s on your heart and get genuine advice from people who truly care.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
                >
                  Join Free <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <p className="text-xs text-white/30">Free forever · No credit card required</p>
              </div>

              {/* Explore column */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Explore</h3>
                <ul className="space-y-3">
                  {[
                    { href: '/requests', label: 'Browse Requests' },
                    { href: '/requests/new', label: 'Ask for Advice' },
                    { href: '/requests?category=romantic', label: 'Romantic' },
                    { href: '/requests?category=family', label: 'Family' },
                    { href: '/requests?category=friendship', label: 'Friendship' },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-white/55 hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Community column */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Community</h3>
                <ul className="space-y-3">
                  {[
                    { href: '/guidelines', label: 'Community Guidelines' },
                    { href: '/signup', label: 'Create Account' },
                    { href: '/login', label: 'Sign In' },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-white/55 hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Trust badges */}
                <div className="pt-4 space-y-2">
                  {[
                    { icon: Shield, text: 'Moderated community' },
                    { icon: MessageSquare, text: 'Real advice, real people' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span className="text-xs text-white/40">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-white/30">
                &copy; {new Date().getFullYear()} KindredAdvice &mdash; Be kind to one another.
              </p>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3 h-3 fill-violet-400 stroke-violet-400" />
                <span className="text-xs text-white/30">Made with care</span>
              </div>
            </div>
          </div>
        </footer>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
