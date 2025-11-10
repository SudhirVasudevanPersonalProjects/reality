import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MindCard } from '@/app/components/MindCard'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MindDetailPage({ params }: PageProps) {
  const { id } = await params

  // Server-side auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  // Fetch Mind something by ID
  const { data: something, error } = await supabase
    .from('somethings')
    .select('*')
    .eq('id', id)
    .eq('realm', 'mind')
    .single()

  if (error || !something) {
    console.error('Error fetching something:', error)
    notFound()
  }

  // Fetch connection count (bidirectional)
  const { count: connectionCount } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .or(`from_something_id.eq.${id},to_something_id.eq.${id}`)

  // Fetch dependencies if this is a Desire
  let dependencies = null
  const mindCategory = something.attributes && typeof something.attributes === 'object' && 'mind_category' in something.attributes
    ? (something.attributes as any).mind_category
    : null

  if (mindCategory === 'desire') {
    const { data: deps } = await supabase
      .from('connections')
      .select('to_something_id, somethings!connections_to_something_id_fkey(id, text_content, attributes)')
      .eq('from_something_id', id)
      .eq('relationship_type', 'depends_on')

    dependencies = deps || []
  }

  // Fetch adjacent somethings for Previous/Next navigation
  const { data: adjacentData } = await supabase
    .from('somethings')
    .select('id, captured_at')
    .eq('realm', 'mind')
    .order('captured_at', { ascending: true })

  const currentIndex = adjacentData?.findIndex(s => s.id === id) ?? -1
  const previousSomething = currentIndex > 0 ? adjacentData?.[currentIndex - 1] : null
  const nextSomething = currentIndex >= 0 && currentIndex < (adjacentData?.length ?? 0) - 1 ? adjacentData?.[currentIndex + 1] : null

  return (
    <MindCard
      something={something}
      connectionCount={connectionCount ?? 0}
      dependencies={dependencies}
      previousId={previousSomething?.id ?? null}
      nextId={nextSomething?.id ?? null}
    />
  )
}
