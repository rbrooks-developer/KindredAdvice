'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Flag, Shield, CornerDownRight, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ReportModal } from '@/components/report/ReportModal'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Reply } from '@/lib/types'
import { getSecondsRemaining, rateLimitErrorMessage } from '@/lib/rateLimit'

interface ReplyItemProps {
  reply: Reply
  children?: Reply[]
  showReport: boolean
  isAuthenticated: boolean
  isBanned: boolean
  isAdmin?: boolean
}

export function ReplyItem({ reply, children = [], showReport, isAuthenticated, isBanned, isAdmin = false }: ReplyItemProps) {
  const [showForm, setShowForm] = useState(false)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const profile = reply.profiles
  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? '??'
  const timeAgo = formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (body.trim().length < 5) { toast.error('Reply must be at least 5 characters.'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('You must be signed in.'); setLoading(false); return }

    const remaining = await getSecondsRemaining(supabase, user.id)
    if (remaining > 0) {
      toast.error(rateLimitErrorMessage(remaining))
      setLoading(false)
      return
    }

    const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    const { error } = await supabase.from('replies').insert({
      request_id: reply.request_id,
      user_id: user.id,
      parent_id: reply.id,
      body: body.trim(),
      is_admin_reply: userProfile?.role === 'admin',
    })

    setLoading(false)
    if (error) {
      if (error.message?.includes('RATE_LIMIT')) {
        toast.error('Please wait 2 minutes between posts.')
      } else {
        toast.error('Could not post reply. Please try again.')
      }
    } else {
      toast.success('Reply posted!')
      setBody('')
      setShowForm(false)
      router.refresh()
    }
  }

  return (
    <div>
      {/* Parent reply card */}
      <div className={`group rounded-xl p-4 border ${reply.is_admin_reply ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className={`text-xs ${reply.is_admin_reply ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-sm font-medium">{profile?.username ?? 'Anonymous'}</span>
              {reply.is_admin_reply && (
                <Badge variant="outline" className="text-xs text-primary border-primary/40 flex items-center gap-1 shrink-0">
                  <Shield className="w-3 h-3" />Admin
                </Badge>
              )}
              <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
            </div>
          </div>
          {showReport && (
            <ReportModal targetType="reply" targetId={reply.id} isAdmin={isAdmin}>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                <Flag className="w-3 h-3" />Report
              </button>
            </ReportModal>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">{reply.body}</p>

        {/* Reply button */}
        {isAuthenticated && !isBanned && (
          <div className="mt-3 pt-2 border-t border-border/40">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {showForm ? 'Cancel' : 'Reply'}
            </button>
          </div>
        )}

        {/* Inline reply form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-3 space-y-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Replying to ${profile?.username ?? 'this comment'}…`}
              rows={3}
              maxLength={2000}
              autoFocus
              className="text-sm"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{body.length}/2000</span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); setBody('') }}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading || body.trim().length < 5}>
                  {loading ? 'Posting…' : 'Post Reply'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Child replies — indented */}
      {children.length > 0 && (
        <div className="mt-2 ml-6 pl-4 border-l-2 border-border/50 space-y-2">
          {children.map((child) => {
            const childProfile = child.profiles
            const childInitials = childProfile?.username?.slice(0, 2).toUpperCase() ?? '??'
            const childTimeAgo = formatDistanceToNow(new Date(child.created_at), { addSuffix: true })
            return (
              <div
                key={child.id}
                className={`group rounded-xl p-4 border ${child.is_admin_reply ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 -ml-1" />
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarImage src={childProfile?.avatar_url ?? undefined} />
                      <AvatarFallback className={`text-xs ${child.is_admin_reply ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {childInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="text-sm font-medium">{childProfile?.username ?? 'Anonymous'}</span>
                      {child.is_admin_reply && (
                        <Badge variant="outline" className="text-xs text-primary border-primary/40 flex items-center gap-1 shrink-0">
                          <Shield className="w-3 h-3" />Admin
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground shrink-0">{childTimeAgo}</span>
                    </div>
                  </div>
                  {showReport && (
                    <ReportModal targetType="reply" targetId={child.id} isAdmin={isAdmin}>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                        <Flag className="w-3 h-3" />Report
                      </button>
                    </ReportModal>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">{child.body}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
