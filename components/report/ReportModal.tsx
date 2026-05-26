'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { ReportTargetType } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const REASONS = [
  'Harassment or bullying',
  'Explicit or adult content',
  'Spam or self-promotion',
  'Misinformation',
  'Hate speech',
  'Other',
]

interface ReportModalProps {
  targetType: ReportTargetType
  targetId: string
  children: React.ReactNode
}

export function ReportModal({ targetType, targetId, children }: ReportModalProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be signed in to report content.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: note ? `${reason}: ${note}` : reason,
    })

    if (error) {
      setLoading(false)
      if (error.code === '23505') {
        toast.info("You've already reported this content.")
      } else {
        toast.error('Could not submit report. Please try again.')
      }
      return
    }

    // Admins instantly hide content without waiting for the 5-report threshold
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      if (targetType === 'request') {
        await supabase.from('help_requests').update({ status: 'hidden' }).eq('id', targetId)
      } else if (targetType === 'reply') {
        await supabase.from('replies').update({ status: 'hidden' }).eq('id', targetId)
      } else if (targetType === 'image') {
        await supabase.from('request_images').update({ is_hidden: true }).eq('id', targetId)
      }
      toast.success('Content has been hidden.')
    } else {
      toast.success('Thank you — our team will review this report.')
    }

    setLoading(false)
    setOpen(false)
    setReason('')
    setNote('')
  }

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>{children}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
            <DialogDescription>
              Help us keep KindredAdvice safe. Our team reviews all reports within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select onValueChange={(v: string | null) => { if (v) setReason(v) }}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Additional context (optional)</Label>
              <Textarea id="note" placeholder="Provide any additional details…" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={!reason || loading}>
                {loading ? 'Submitting…' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
