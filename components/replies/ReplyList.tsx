import type { Reply } from '@/lib/types'
import { ReplyItem } from './ReplyItem'

interface ReplyListProps {
  replies: Reply[]
  showReport?: boolean
  isAuthenticated?: boolean
  isBanned?: boolean
  isAdmin?: boolean
}

export function ReplyList({ replies, showReport = true, isAuthenticated = false, isBanned = false, isAdmin = false }: ReplyListProps) {
  if (replies.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        No replies yet. Be the first to offer support.
      </div>
    )
  }

  const topLevel = replies.filter((r) => !r.parent_id)
  const childMap = new Map<string, Reply[]>()
  replies.filter((r) => r.parent_id).forEach((r) => {
    const key = r.parent_id!
    childMap.set(key, [...(childMap.get(key) ?? []), r])
  })

  return (
    <div className="space-y-4">
      {topLevel.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          children={childMap.get(reply.id) ?? []}
          showReport={showReport}
          isAuthenticated={isAuthenticated}
          isBanned={isBanned}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  )
}
