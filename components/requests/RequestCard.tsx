import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Flag, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { HelpRequest } from '@/lib/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types'
import { ReportModal } from '@/components/report/ReportModal'

const CATEGORY_STRIP: Record<string, string> = {
  romantic: 'from-rose-400 to-pink-500',
  family: 'from-amber-400 to-orange-400',
  friendship: 'from-teal-400 to-emerald-500',
  general: 'from-violet-500 to-purple-500',
}

interface RequestCardProps {
  request: HelpRequest
  showReport?: boolean
}

export function RequestCard({ request, showReport = true }: RequestCardProps) {
  const profile = request.profiles
  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? '??'
  const timeAgo = formatDistanceToNow(new Date(request.created_at), { addSuffix: true })
  const strip = CATEGORY_STRIP[request.category] ?? 'from-violet-400 to-purple-500'

  return (
    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/8 hover:-translate-y-1 transition-all duration-200">
      {/* Category color strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${strip}`} />

      <div className="p-5">
        {/* Author row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="w-7 h-7 shrink-0 ring-2 ring-border">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <span className="text-xs font-medium text-foreground/70 truncate block">
                {profile?.username ?? 'Anonymous'}
              </span>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {request.is_private && (
              <Lock className="w-3 h-3 text-muted-foreground" aria-label="Private request" />
            )}
            <Badge className={`text-xs ${CATEGORY_COLORS[request.category]} border-0 font-semibold`} variant="outline">
              {CATEGORY_LABELS[request.category]}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <Link href={`/requests/${request.id}`} className="block">
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2 text-[0.95rem]">
            {request.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{request.body}</p>
        </Link>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
          <Link
            href={`/requests/${request.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <MessageSquare className="w-4 h-4" />
            {request.reply_count ?? 0} {request.reply_count === 1 ? 'reply' : 'replies'}
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
    </div>
  )
}
