import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/nav/Navbar'
import { Toaster } from '@/components/ui/sonner'

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
    'A safe, warm community where you can share what\'s on your heart and get genuine advice from people who care.',
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
        <footer className="border-t border-border bg-card py-8 mt-12">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">KindredAdvice</p>
            <p>A safe space to share, listen, and grow together.</p>
            <div className="flex justify-center gap-6">
              <a href="/guidelines" className="hover:text-primary transition-colors">
                Community Guidelines
              </a>
              <a href="/requests" className="hover:text-primary transition-colors">
                Browse Requests
              </a>
            </div>
            <p className="text-xs mt-4">
              &copy; {new Date().getFullYear()} KindredAdvice. Be kind.
            </p>
          </div>
        </footer>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
