import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Flag, Users, Inbox, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: pendingReports },
    { count: privateRequests },
    { count: totalUsers },
    { count: totalRequests },
    { data: recentReports },
  ] = await Promise.all([
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('help_requests').select('*', { count: 'exact', head: true }).eq('is_private', true).eq('status', 'open'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('help_requests').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*, profiles(username)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flag className="w-4 h-4 text-destructive" />Pending Reports
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingReports ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Inbox className="w-4 h-4 text-primary" />Private Queue
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{privateRequests ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />Total Users
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalUsers ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalRequests ?? 0}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Link href="/admin/queue" className={cn(buttonVariants({ variant: 'outline' }), 'h-auto py-4 flex-col gap-2')}>
          <Inbox className="w-5 h-5" />
          <span>Review Private Queue</span>
          {(privateRequests ?? 0) > 0 && <Badge variant="destructive" className="text-xs">{privateRequests} waiting</Badge>}
        </Link>
        <Link href="/admin/reports" className={cn(buttonVariants({ variant: 'outline' }), 'h-auto py-4 flex-col gap-2')}>
          <Flag className="w-5 h-5" />
          <span>Review Reports</span>
          {(pendingReports ?? 0) > 0 && <Badge variant="destructive" className="text-xs">{pendingReports} pending</Badge>}
        </Link>
        <Link href="/admin/users" className={cn(buttonVariants({ variant: 'outline' }), 'h-auto py-4 flex-col gap-2')}>
          <Users className="w-5 h-5" />
          <span>Manage Users</span>
        </Link>
      </div>

      {recentReports && recentReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="font-medium">
                      <Badge variant="outline" className="text-xs mr-2">{report.target_type}</Badge>
                      {report.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reported by {(report.profiles as any)?.username ?? 'unknown'} · {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Link href="/admin/reports" className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}>Review</Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
