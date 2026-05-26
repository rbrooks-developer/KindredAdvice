'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Profile, BanType } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Users, Search, Shield } from 'lucide-react'

const BAN_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  warned: 'bg-amber-100 text-amber-700',
  temp_banned: 'bg-orange-100 text-orange-700',
  permanent_banned: 'bg-red-100 text-red-700',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionUser, setActionUser] = useState<Profile | null>(null)
  const [banType, setBanType] = useState<BanType>('warning')
  const [banDays, setBanDays] = useState('7')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const loadUsers = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100)
    setUsers((data ?? []) as Profile[])
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  const filtered = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()))

  const handleBanAction = async () => {
    if (!actionUser || !reason.trim()) { toast.error('Please provide a reason.'); return }
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }

    let banStatus = 'warned'
    let expiresAt: string | null = null

    if (banType === 'temp_ban') {
      banStatus = 'temp_banned'
      const expires = new Date()
      expires.setDate(expires.getDate() + parseInt(banDays, 10))
      expiresAt = expires.toISOString()
    } else if (banType === 'permanent_ban') {
      banStatus = 'permanent_banned'
    }

    await supabase.from('profiles').update({ ban_status: banStatus, ban_expires_at: expiresAt }).eq('id', actionUser.id)
    await supabase.from('bans').insert({ user_id: actionUser.id, admin_id: user.id, type: banType, reason: reason.trim(), expires_at: expiresAt })

    toast.success(`Action applied to ${actionUser.username}.`)
    setActionUser(null)
    setReason('')
    loadUsers()
    setSubmitting(false)
  }

  const handleUnban = async (profile: Profile) => {
    await supabase.from('profiles').update({ ban_status: 'active', ban_expires_at: null }).eq('id', profile.id)
    toast.success(`${profile.username} has been unbanned.`)
    loadUsers()
  }

  const handlePromoteAdmin = async (profile: Profile) => {
    const newRole = profile.role === 'admin' ? 'user' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id)
    toast.success(`${profile.username} is now ${newRole === 'admin' ? 'an admin' : 'a regular user'}.`)
    loadUsers()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />User Management
        </h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by username…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading users…</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((profile) => (
            <div key={profile.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {profile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{profile.username}</span>
                    {profile.role === 'admin' && (
                      <Badge className="text-xs bg-primary/10 text-primary border-primary/20" variant="outline">
                        <Shield className="w-3 h-3 mr-1" />Admin
                      </Badge>
                    )}
                    <Badge className={`text-xs ${BAN_STATUS_COLORS[profile.ban_status] ?? ''}`} variant="outline">
                      {profile.ban_status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {profile.ban_status !== 'active' && (
                  <Button size="sm" variant="outline" onClick={() => handleUnban(profile)}>Unban</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handlePromoteAdmin(profile)}>
                  {profile.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { setActionUser(profile); setBanType('warning') }}>
                  Ban/Warn
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">No users found.</div>
          )}
        </div>
      )}

      <Dialog open={!!actionUser} onOpenChange={(open) => { if (!open) setActionUser(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Action for {actionUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={banType} onValueChange={(v) => setBanType((v ?? 'warning') as BanType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Issue Warning</SelectItem>
                  <SelectItem value="temp_ban">Temporary Ban</SelectItem>
                  <SelectItem value="permanent_ban">Permanent Ban</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {banType === 'temp_ban' && (
              <div className="space-y-2">
                <Label>Duration (days)</Label>
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
              <Label>Reason <span className="text-destructive">*</span></Label>
              <Textarea placeholder="Describe the reason for this action…" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActionUser(null)}>Cancel</Button>
              <Button onClick={handleBanAction} disabled={submitting || !reason.trim()}>
                {submitting ? 'Applying…' : 'Apply'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
