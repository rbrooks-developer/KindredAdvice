import { createClient } from '@/lib/supabase/server'
import type { HelpRequest } from '@/lib/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Inbox, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Private Request Queue' }

export default async function AdminQueuePage() {
  const supabase = await createClient()

  const { data: requests } = await supabase
    .from('help_requests')
    .select(`*, profiles(id, username, avatar_url), request_images(id, storage_path, display_order, is_hidden)`)
    .eq('is_private', true)
    .in('status', ['open', 'hidden'])
    .order('created_at', { ascending: true })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Inbox className="w-6 h-6 text-primary" />Private Request Queue
        </h1>
        <p className="text-muted-foreground mt-1">These requests are only visible to administrators. Reply to support the user.</p>
      </div>

      {requests && requests.length > 0 ? (
        <div className="space-y-4">
          {(requests as HelpRequest[]).map((req) => {
            const profile = req.profiles as any
            const initials = profile?.username?.slice(0, 2).toUpperCase() ?? '??'
            const timeAgo = formatDistanceToNow(new Date(req.created_at), { addSuffix: true })

            return (
              <div key={req.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="text-sm font-medium">{profile?.username ?? 'Anonymous'}</span>
                      <span className="text-xs text-muted-foreground ml-2">{timeAgo}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-xs ${CATEGORY_COLORS[req.category]}`} variant="outline">{CATEGORY_LABELS[req.category]}</Badge>
                    {req.status === 'hidden' && <Badge variant="destructive" className="text-xs">Hidden</Badge>}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{req.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{req.body}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />Private request
                  </span>
                  <Link href={`/requests/${req.id}`} className={cn(buttonVariants({ size: 'sm' }))}>View & Reply</Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Inbox className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Queue is empty</p>
          <p className="text-sm mt-1">No private requests waiting for a response.</p>
        </div>
      )}
    </div>
  )
}
