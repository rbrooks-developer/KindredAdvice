import type { SupabaseClient } from '@supabase/supabase-js'

const COOLDOWN_SECONDS = 60

export async function getSecondsRemaining(supabase: SupabaseClient, userId: string): Promise<number> {
  const [{ data: lastRequest }, { data: lastReply }] = await Promise.all([
    supabase
      .from('help_requests')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('replies')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const t1 = lastRequest ? new Date(lastRequest.created_at).getTime() : 0
  const t2 = lastReply ? new Date(lastReply.created_at).getTime() : 0
  const lastActivity = Math.max(t1, t2)
  if (!lastActivity) return 0

  const remaining = COOLDOWN_SECONDS * 1000 - (Date.now() - lastActivity)
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0
}

export function rateLimitErrorMessage(secondsRemaining: number): string {
  if (secondsRemaining >= 60) {
    const m = Math.floor(secondsRemaining / 60)
    const s = secondsRemaining % 60
    return `Please wait ${m}m ${s > 0 ? `${s}s` : ''} before posting again.`
  }
  return `Please wait ${secondsRemaining} seconds before posting again.`
}
