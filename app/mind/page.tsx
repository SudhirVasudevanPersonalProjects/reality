import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MindGridView } from './MindGridView'

export const dynamic = 'force-dynamic'

interface SearchParams {
  [key: string]: string | string[] | undefined
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function MindListPage({ searchParams }: PageProps) {
  // Server-side auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Parse search params (for future filtering/sorting)
  const params = await searchParams
  const careFilter = params.care ? String(params.care).split(',').map(Number) : null
  const categoryFilter = params.category ? String(params.category).split(',') : null
  const locationFilter = params.location ? String(params.location) : null
  const sortBy = params.sort ? String(params.sort) : 'recent'

  // Build query - initial load fetches first 50 cards
  let query = supabase
    .from('somethings')
    .select('id, text_content, media_url, care, captured_at, latitude, longitude, attributes')
    .eq('realm', 'mind')
    .order('captured_at', { ascending: false })
    .limit(50)

  // Apply care filter if present
  if (careFilter && careFilter.length > 0) {
    query = query.in('care', careFilter)
  }

  // Execute query
  const { data: somethings, error } = await query

  if (error) {
    console.error('Error fetching Mind somethings:', error)
    // Return empty array on error (handled by empty state in UI)
    return <MindGridView somethings={[]} filters={{ care: careFilter, category: categoryFilter, location: locationFilter, sort: sortBy }} />
  }

  // Filter by category client-side (JSONB field, can't filter efficiently in query)
  let filteredSomethings = somethings || []
  if (categoryFilter && categoryFilter.length > 0) {
    filteredSomethings = filteredSomethings.filter(s => {
      if (!s.attributes || typeof s.attributes !== 'object') return false
      const attrs = s.attributes as any
      const mindCategory = attrs.mind_category
      return mindCategory && categoryFilter.includes(mindCategory)
    })
  }

  // Filter by location if specified
  if (locationFilter === 'has') {
    filteredSomethings = filteredSomethings.filter(s => s.latitude !== null && s.longitude !== null)
  } else if (locationFilter === 'none') {
    filteredSomethings = filteredSomethings.filter(s => s.latitude === null || s.longitude === null)
  }

  // Apply sorting (default is already captured_at DESC from query)
  if (sortBy === 'care_desc') {
    filteredSomethings = filteredSomethings.sort((a, b) => {
      const careDiff = (b.care || 0) - (a.care || 0)
      if (careDiff !== 0) return careDiff
      return new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
    })
  } else if (sortBy === 'care_asc') {
    filteredSomethings = filteredSomethings.sort((a, b) => {
      const careDiff = (a.care || 0) - (b.care || 0)
      if (careDiff !== 0) return careDiff
      return new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
    })
  } else if (sortBy === 'oldest') {
    filteredSomethings = filteredSomethings.sort((a, b) =>
      new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
    )
  }

  return (
    <MindGridView
      somethings={filteredSomethings}
      filters={{ care: careFilter, category: categoryFilter, location: locationFilter, sort: sortBy }}
    />
  )
}
