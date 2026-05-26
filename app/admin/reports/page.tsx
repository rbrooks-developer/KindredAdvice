'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Report } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDistanceToNow } from 'date-fns'
import { Flag, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

type Action = 'dismiss' | 'warning' | 'temp_ban' | 'permanent_ban' | 'delete'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [actionReport, setActionReport] = useState<Report | null>(null)
  const [action, setAction] = useState<Action>('dismiss')
  const [adminNotes, setAdminNotes] = useState('')
  const [banDays, setBanDays] = useState('7')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const loadReports = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('*, profiles(username)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setReports((data ?? []) as Report[])
    setLoading(false)
  }

  useEffect(() => { loadReports() }, [])

  const handleAction = async () => {
    if (!actionReport) return
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }

    try {
      let ownerId: string | null = null
      if (actionReport.target_type === 'request') {
        const { data } = await supabase.from('help_requests').select('user_id').eq('id', actionReport.target_id).single()
        ownerId = data?.user_id ?? null
      } else if (actionReport.target_type === 'reply') {
        const { data } = await supabase.from('replies').select('user_id').eq('id', actionReport.target_id).single()
        ownerId = data?.user_id ?? null
      } else if (actionReport.target_type === 'image') {
        const { data } = await supabase.from('request_images').select('request_id, help_requests(user_id)').eq('id', actionReport.target_id).single()
        ownerId = (data?.help_requests as any)?.user_id ?? null
      }

      if (action === 'delete') {
        if (actionReport.target_type === 'request') {
          await supabase.from('help_requests').update({ status: 'deleted' }).eq('id', actionReport.target_id)
        } else if (actionReport.target_type === 'reply') {
          await supabase.from('replies').update({ status: 'deleted' }).eq('id', actionReport.target_id)
        } else if (actionReport.target_type === 'image') {
          await supabase.from('request_images').update({ is_hidden: true }).eq('id', actionReport.target_id)
        }
      } else if (action === 'dismiss') {
        if (actionReport.target_type === 'request') {
          await supabase.from('help_requests').update({ status: 'open' }).eq('id', actionReport.target_id)
        } else if (actionReport.target_type === 'reply') {
          await supabase.from('replies').update({ status: 'visible' }).eq('id', actionReport.target_id)
        } else if (actionReport.target_type === 'image') {
          await supabase.from('request_images').update({ is_hidden: false }).eq('id', actionReport.target_id)
        }
      }

      if (ownerId && action !== 'dismiss' && action !== 'delete') {
        let banStatus = 'warned'
        let expiresAt: string | null = null
        if (action === 'temp_ban') {
          banStatus = 'temp_banned'
          const expires = new Date()
          expires.setDate(expires.getDate() + parseInt(banDays, 10))
          expiresAt = expires.toISOString()
        } else if (action === 'permanent_ban') {
          banStatus = 'permanent_banned'
        }
        await supabase.from('profiles').update({ ban_status: banStatus, ban_expires_at: expiresAt }).eq('id', ownerId)
        await supabase.from('bans').insert({
          user_id: ownerId,
          admin_id: user.id,
          type: action === 'warning' ? 'warning' : action === 'temp_ban' ? 'temp_ban' : 'permanent_ban',
          reason: adminNotes || actionReport.reason,
          expires_at: expiresAt,
        })
      }

      await supabase.from('reports').update({
        status: action === 'dismiss' ? 'dismissed' : 'reviewed',
        admin_id: user.id,
        admin_notes: adminNotes || null,
      }).eq('id', actionReport.id)

      toast.success('Action applied successfully.')
      setActionReport(null)
      setAdminNotes('')
      loadReports()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flag className="w-6 h-6 text-destructive" />Content Reports
        </h1>
        <p className="text-muted-foreground mt-1">Review reported content and take appropriate action.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading reports…</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Flag className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No pending reports</p>
          <p className="text-sm mt-1">All caught up! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">{report.target_type}</Badge>
                    <span className="text-sm font-medium truncate">{report.reason}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reported by {(report.profiles as any)?.username ?? 'unknown'} · {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {report.target_type === 'request' && (
                    <Link href={`/requests/${report.target_id}`} target="_blank" className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }))}>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => { setActionReport(report); setAction('dismiss') }}>
                    Take Action
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!actionReport} onOpenChange={(open) => { if (!open) setActionReport(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Take Action on Report</DialogTitle>
            <DialogDescription>Choose how to handle this reported {actionReport?.target_type}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={action} onValueChange={(v) => setAction((v ?? 'dismiss') as Action)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dismiss">Dismiss — content was fine, restore it</SelectItem>
                  <SelectItem value="delete">Delete content only</SelectItem>
                  <SelectItem value="warning">Delete + warn user</SelectItem>
                  <SelectItem value="temp_ban">Delete + temporary ban</SelectItem>
                  <SelectItem value="permanent_ban">Delete + permanent ban</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {action === 'temp_ban' && (
              <div className="space-y-2">
                <Label>Ban duration (days)</Label>
                <Select value={banDays} onValueChange={(v) => setBanDays(v ?? '7')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['1', '3', '7', '14', '30'].map((d) => (
                      <SelectItem key={d} value={d}>{d} day{d !== '1' ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Admin notes (optional)</Label>
              <Textarea placeholder="Internal notes on this decision…" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActionReport(null)}>Cancel</Button>
              <Button onClick={handleAction} disabled={submitting}>
                {submitting ? 'Applying…' : 'Apply Action'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
