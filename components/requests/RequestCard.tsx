import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Flag, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { HelpRequest } from '@/lib/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types'
import { ReportModal } from '@/components/report/ReportModal'

interface RequestCardProps {
  request: HelpRequest
  showReport?: boolean
}

export function RequestCard({ request, showReport = true }: RequestCardProps) {
  const profile = request.profiles
  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? '??'
  const timeAgo = formatDistanceToNow(new Date(request.created_at), { addSuffix: true })

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground truncate">
            {profile?.username ?? 'Anonymous'} · {timeAgo}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={`text-xs ${CATEGORY_COLORS[request.category]}`} variant="outline">
            {CATEGORY_LABELS[request.category]}
          </Badge>
          {request.is_private && (
            <Lock className="w-3 h-3 text-muted-foreground" aria-label="Private request" />
          )}
        </div>
      </div>

      <Link href={`/requests/${request.id}`} className="block group">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-2 line-clamp-2">
          {request.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{request.body}</p>
      </Link>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <Link href={`/requests/${request.id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span>{request.reply_count ?? 0} replies</span>
        </Link>
        {showReport && (
          <ReportModal targetType="request" targetId={request.id}>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
              <Flag className="w-3 h-3" />
              Report
            </button>
          </ReportModal>
        )}
      </div>
    </div>
  )
}
