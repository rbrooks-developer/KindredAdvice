import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { HelpRequest, Reply } from '@/lib/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ImageGallery } from '@/components/images/ImageGallery'
import { AddRequestImages } from '@/components/images/AddRequestImages'
import { ReplyList } from '@/components/replies/ReplyList'
import { ReplyForm } from '@/components/replies/ReplyForm'
import { ReportModal } from '@/components/report/ReportModal'
import { formatDistanceToNow } from 'date-fns'
import { Flag, Lock, AlertTriangle, Shield, Clock } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('help_requests').select('title').eq('id', id).single()
  return { title: data?.title ?? 'Request' }
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: request, error } = await supabase
    .from('help_requests')
    .select(`*, profiles(id, username, avatar_url, role, ban_status), request_images(id, storage_path, display_order, is_hidden, report_count)`)
    .eq('id', id)
    .single()

  if (error || !request || request.status === 'deleted') notFound()

  const req = request as HelpRequest

  if (req.is_private) {
    if (!user) notFound()
    const isOwner = user.id === req.user_id
    if (!isOwner) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') notFound()
    }
  }

  const { data: replies } = await supabase
    .from('replies')
    .select(`*, profiles(id, username, avatar_url, role)`)
    .eq('request_id', id)
    .eq('status', 'visible')
    .order('created_at', { ascending: true })

  let userProfile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('role, ban_status').eq('id', user.id).single()
    userProfile = data
  }

  const isAuthenticated = !!user
  const isBanned = userProfile !== null && userProfile?.ban_status !== 'active'
  const isAdmin = userProfile?.role === 'admin'
  const authorProfile = req.profiles as { username: string; avatar_url: string | null; role: string }
  const initials = authorProfile?.username?.slice(0, 2).toUpperCase() ?? '??'
  const timeAgo = formatDistanceToNow(new Date(req.created_at), { addSuffix: true })

  const sortedImages = (req.request_images ?? []).sort(
    (a: any, b: any) => a.display_order - b.display_order
  )
  const visibleImages = sortedImages.filter((img: any) => !img.is_hidden)
  const isOwner = user?.id === req.user_id
  const highestDisplayOrder = sortedImages.length > 0
    ? Math.max(...sortedImages.map((img: any) => img.display_order))
    : -1

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {req.status === 'hidden' && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>This request has been temporarily hidden pending admin review.</AlertDescription>
        </Alert>
      )}

      <article className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src={authorProfile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{authorProfile?.username ?? 'Anonymous'}</p>
                {authorProfile?.role === 'admin' && (
                  <Badge variant="outline" className="text-xs text-primary border-primary/40 flex items-center gap-1 shrink-0">
                    <Shield className="w-3 h-3" />Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`text-xs ${CATEGORY_COLORS[req.category]}`} variant="outline">{CATEGORY_LABELS[req.category]}</Badge>
            {req.is_private && <Lock className="w-4 h-4 text-muted-foreground" aria-label="Private request" />}
          </div>
        </div>

        <h1 className="text-2xl font-bold leading-snug mb-4">{req.title}</h1>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{req.body}</p>

        {sortedImages.length > 0 && (
          <ImageGallery images={sortedImages} showReport={isAuthenticated} isAdmin={isAdmin} />
        )}

        {isOwner && visibleImages.length < 5 && (
          <AddRequestImages
            requestId={req.id}
            userId={req.user_id}
            currentCount={visibleImages.length}
            highestDisplayOrder={highestDisplayOrder}
          />
        )}

        {isAuthenticated && (
          <div className="flex justify-end mt-4 pt-4 border-t border-border">
            <ReportModal targetType="request" targetId={req.id} isAdmin={isAdmin} redirectOnDelete="/requests">
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
                <Flag className="w-3 h-3" />{isAdmin ? 'Delete request' : 'Report this request'}
              </button>
            </ReportModal>
          </div>
        )}
      </article>

      {req.is_private && (
        <Alert className="mb-6 border-violet-200 bg-violet-50">
          <Clock className="h-4 w-4 text-violet-600" />
          <AlertDescription className="text-violet-800 text-sm">
            <strong>Private Request:</strong> Our admins do their best to reply as soon as possible, but please allow up to <strong>12–24 hours</strong> for a response. Thank you for your patience.
          </AlertDescription>
        </Alert>
      )}

      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          <strong>Community Notice:</strong> Please be respectful and kind. Anything inappropriate may result in a warning or permanent ban from KindredAdvice.
        </AlertDescription>
      </Alert>

      <section>
        <h2 className="text-xl font-bold mb-5">
          {(replies?.length ?? 0)} {replies?.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        <ReplyList
          replies={(replies ?? []) as Reply[]}
          showReport={isAuthenticated}
          isAuthenticated={isAuthenticated}
          isBanned={!!isBanned}
          isAdmin={isAdmin}
        />
      </section>

      <section className="mt-8 pt-8 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Add Your Support</h3>
        <ReplyForm requestId={req.id} isAuthenticated={isAuthenticated} isBanned={!!isBanned} />
      </section>
    </div>
  )
}
