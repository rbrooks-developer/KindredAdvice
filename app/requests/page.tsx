import { createClient } from '@/lib/supabase/server'
import { RequestCard } from '@/components/requests/RequestCard'
import type { HelpRequest, Category } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchParams {
  category?: string
  page?: string
}

const PAGE_SIZE = 10

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const category = params.category as Category | undefined
  const page = parseInt(params.page ?? '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  let query = supabase
    .from('help_requests')
    .select(`*, profiles(id, username, avatar_url), request_images(id, storage_path, display_order, is_hidden)`, { count: 'exact' })
    .eq('is_private', false)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (category) {
    query = query.eq('category', category)
  }

  const { data: requests, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const categories = ['romantic', 'family', 'friendship', 'general'] as Category[]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Requests</h1>
        <p className="text-muted-foreground mt-2">Real people, real situations. Offer your perspective or just read along.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/requests" className={cn(buttonVariants({ variant: !category ? 'default' : 'outline', size: 'sm' }))}>All</Link>
        {categories.map((cat) => (
          <Link key={cat} href={`/requests?category=${cat}`} className={cn(buttonVariants({ variant: category === cat ? 'default' : 'outline', size: 'sm' }))}>
            {CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </div>

      {requests && requests.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(requests as HelpRequest[]).map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {page > 1 && (
                <Link href={`/requests?${category ? `category=${category}&` : ''}page=${page - 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>Previous</Link>
              )}
              <span className="flex items-center px-3 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              {page < totalPages && (
                <Link href={`/requests?${category ? `category=${category}&` : ''}page=${page + 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>Next</Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No requests found</p>
          <p className="text-sm mt-1">{category ? `No ${CATEGORY_LABELS[category]} requests yet.` : 'Be the first to ask!'}</p>
          <Link href="/requests/new" className={cn(buttonVariants(), 'mt-6')}>Ask for Advice</Link>
        </div>
      )}
    </div>
  )
}
