'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getSecondsRemaining, rateLimitErrorMessage } from '@/lib/rateLimit'

interface ReplyFormProps {
  requestId: string
  isAuthenticated: boolean
  isBanned: boolean
}

export function ReplyForm({ requestId, isAuthenticated, isBanned }: ReplyFormProps) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-border bg-muted/50 p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Want to offer support? Sign in to join the conversation.</p>
        <div className="flex justify-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>Sign In</Link>
          <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }))}>Create Account</Link>
        </div>
      </div>
    )
  }

  if (isBanned) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Your account has been restricted from posting. Please contact support if you believe this is an error.
        </AlertDescription>
      </Alert>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || body.trim().length < 5) {
      toast.error('Reply must be at least 5 characters.')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be signed in to reply.')
      setLoading(false)
      return
    }

    const remaining = await getSecondsRemaining(supabase, user.id)
    if (remaining > 0) {
      toast.error(rateLimitErrorMessage(remaining))
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const { error } = await supabase.from('replies').insert({
      request_id: requestId,
      user_id: user.id,
      body: body.trim(),
      is_admin_reply: profile?.role === 'admin',
    })

    setLoading(false)

    if (error) {
      if (error.message?.includes('RATE_LIMIT')) {
        toast.error('Please wait 2 minutes between posts.')
      } else {
        toast.error('Could not post your reply. Please try again.')
      }
    } else {
      toast.success('Reply posted!')
      setBody('')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Alert className="border-amber-200 bg-amber-50 text-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs">
          Be kind and supportive. Anything inappropriate may result in a warning or permanent ban from KindredAdvice.
        </AlertDescription>
      </Alert>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your thoughts, advice, or support…"
        rows={4}
        maxLength={2000}
        required
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{body.length}/2000</span>
        <Button type="submit" disabled={loading || body.trim().length < 5}>
          {loading ? 'Posting…' : 'Post Reply'}
        </Button>
      </div>
    </form>
  )
}
