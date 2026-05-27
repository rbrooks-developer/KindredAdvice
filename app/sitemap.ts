import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: requests } = await supabase
    .from('help_requests')
    .select('id, updated_at')
    .eq('is_private', false)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1000)

  const requestUrls: MetadataRoute.Sitemap = (requests ?? []).map((r) => ({
    url: `https://kindredadvice.com/requests/${r.id}`,
    lastModified: new Date(r.updated_at),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [
    { url: 'https://kindredadvice.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://kindredadvice.com/requests', lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: 'https://kindredadvice.com/guidelines', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: 'https://kindredadvice.com/signup', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ...requestUrls,
  ]
}
