/**
 * /my-reality/somewhere Page
 *
 * 2D space showing user's somethings with care-based organization
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SomewhereClient from './SomewhereClient'

export const dynamic = 'force-dynamic'

export default async function SomewherePage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's somethings
  const { data: somethings, error } = await supabase
    .from('somethings')
    .select('id, text_content, media_url, attributes, captured_at, care, content_type, parent_id')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: false })

  if (error) {
    console.error('Error fetching somethings:', error)
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <p className="text-xl">Failed to load somethings</p>
          <p className="text-sm text-red-400">{error.message}</p>
        </div>
      </div>
    )
  }

  // Fetch user's abodes (tags)
  const { data: abodesData } = await supabase
    .from('somethings')
    .select('id, text_content, attributes')
    .eq('user_id', user.id)
    .eq('content_type', 'abode')
    .order('text_content', { ascending: true })

  // Transform abodes to match expected type
  const abodes = (abodesData || []).map((abode) => ({
    id: abode.id,
    text_content: abode.text_content,
    attributes: abode.attributes as { icon?: string; color?: string } | null,
  }))

  // Get max_somethings_bound from users table
  const { data: userData } = await supabase
    .from('users')
    .select('max_somethings_bound')
    .eq('id', user.id)
    .single()

  const maxBound = userData?.max_somethings_bound || 50

  return <SomewhereClient somethings={somethings || []} abodes={abodes} maxBound={maxBound} />
}
