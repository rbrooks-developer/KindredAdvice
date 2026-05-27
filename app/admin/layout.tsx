import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Users, Flag, Inbox } from 'lucide-react'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Shield className="w-4 h-4" />
            Admin Panel
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Shield className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/queue"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Inbox className="w-4 h-4" />
            Private Queue
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Flag className="w-4 h-4" />
            Reports
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Users className="w-4 h-4" />
            Users
          </Link>
        </nav>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card z-40 flex">
        <Link href="/admin" className="flex-1 flex flex-col items-center py-3 text-xs text-muted-foreground hover:text-foreground gap-1">
          <Shield className="w-5 h-5" />
          Dashboard
        </Link>
        <Link href="/admin/queue" className="flex-1 flex flex-col items-center py-3 text-xs text-muted-foreground hover:text-foreground gap-1">
          <Inbox className="w-5 h-5" />
          Queue
        </Link>
        <Link href="/admin/reports" className="flex-1 flex flex-col items-center py-3 text-xs text-muted-foreground hover:text-foreground gap-1">
          <Flag className="w-5 h-5" />
          Reports
        </Link>
        <Link href="/admin/users" className="flex-1 flex flex-col items-center py-3 text-xs text-muted-foreground hover:text-foreground gap-1">
          <Users className="w-5 h-5" />
          Users
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </div>
    </div>
  )
}
