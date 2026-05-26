import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { HelpRequest } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { RequestCard } from '@/components/requests/RequestCard'
import { formatDistanceToNow } from 'date-fns'
import { CalendarDays, MessageSquare, Shield } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('username').eq('id', id).single()
  return { title: data?.username ?? 'Profile' }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error || !profile) notFound()

  const { data: requests } = await supabase
    .from('help_requests')
    .select(`*, profiles(id, username, avatar_url), request_images(id, storage_path, display_order, is_hidden)`)
    .eq('user_id', id)
    .eq('is_private', false)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(12)

  const initials = profile.username.slice(0, 2).toUpperCase()
  const memberSince = formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              {profile.role === 'admin' && (
                <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                  <Shield className="w-3 h-3 mr-1" />Admin
                </Badge>
              )}
            </div>
            {profile.bio && <p className="text-muted-foreground mt-2 leading-relaxed">{profile.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" />Joined {memberSince}</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" />{requests?.length ?? 0} public requests</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-5">Public Requests</h2>
      {requests && requests.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {(requests as HelpRequest[]).map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No public requests yet.</p>
        </div>
      )}
    </div>
  )
}
