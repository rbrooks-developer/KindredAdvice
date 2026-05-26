import { formatDistanceToNow } from 'date-fns'
import { Flag, Shield } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Reply } from '@/lib/types'
import { ReportModal } from '@/components/report/ReportModal'

interface ReplyListProps {
  replies: Reply[]
  showReport?: boolean
}

export function ReplyList({ replies, showReport = true }: ReplyListProps) {
  if (replies.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        No replies yet. Be the first to offer support.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {replies.map((reply) => {
        const profile = reply.profiles
        const initials = profile?.username?.slice(0, 2).toUpperCase() ?? '??'
        const timeAgo = formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })

        return (
          <div
            key={reply.id}
            className={`group rounded-xl p-4 border ${
              reply.is_admin_reply
                ? 'bg-primary/5 border-primary/20'
                : 'bg-card border-border'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback
                    className={`text-xs ${
                      reply.is_admin_reply
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {profile?.username ?? 'Anonymous'}
                  </span>
                  {reply.is_admin_reply && (
                    <Badge variant="outline" className="text-xs text-primary border-primary/40 flex items-center gap-1 shrink-0">
                      <Shield className="w-3 h-3" />
                      Admin
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
                </div>
              </div>
              {showReport && (
                <ReportModal targetType="reply" targetId={reply.id}>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                    <Flag className="w-3 h-3" />
                    Report
                  </button>
                </ReportModal>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {reply.body}
            </p>
          </div>
        )
      })}
    </div>
  )
}
