import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChamberClient from './ChamberClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ChamberPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user's maxBound for lattice calculation
  const { data: userData } = await supabase
    .from('users')
    .select('max_somethings_bound')
    .eq('id', user.id)
    .single()

  const maxBound = userData?.max_somethings_bound || 100

  // Fetch ALL somethings for background display (excluding abodes and whys)
  const { data: allSomethings, error: allError } = await supabase
    .from('somethings')
    .select('*')
    .eq('user_id', user.id)
    .not('content_type', 'in', '("abode","why")')
    .order('captured_at', { ascending: true })

  if (allError) {
    console.error('Error fetching all somethings:', allError)
  }

  // Fetch unorganized somethings (parent_id IS NULL), ordered by captured_at ASC (FIFO)
  const { data: unorganizedSomethings, error } = await supabase
    .from('somethings')
    .select('*')
    .eq('user_id', user.id)
    .is('parent_id', null)
    .not('content_type', 'in', '("abode","why")')
    .order('captured_at', { ascending: true })

  // Fetch user's abodes for autocomplete
  const { data: abodes, error: abodesError } = await supabase
    .from('somethings')
    .select('*')
    .eq('user_id', user.id)
    .eq('content_type', 'abode')
    .order('text_content', { ascending: true })

  if (abodesError) {
    console.error('Error fetching abodes:', abodesError)
  }

  // Fetch user's whys for autocomplete
  const { data: whys, error: whysError } = await supabase
    .from('somethings')
    .select('*')
    .eq('user_id', user.id)
    .eq('content_type', 'why')
    .order('text_content', { ascending: true })

  if (whysError) {
    console.error('Error fetching whys:', whysError)
  }

  if (error) {
    console.error('Error fetching unorganized somethings:', error)
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Chamber</h1>
          <p className="text-gray-400 mb-8">
            {error.message || 'Failed to fetch somethings'}
          </p>
          <Link
            href="/dashboard"
            prefetch={false}
            className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition font-semibold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // If no unorganized somethings, show empty state
  if (!unorganizedSomethings || unorganizedSomethings.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✨</div>
          <h1 className="text-4xl font-bold mb-4">All organized!</h1>
          <p className="text-gray-400 mb-4">
            Your chamber is empty.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Your reality awaits. Return to explore your organized experiences.
          </p>
          <Link
            href="/dashboard"
            prefetch={false}
            className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition font-semibold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Helper function to generate signed URLs for somethings with media
  const generateSignedUrls = async (somethingsList: typeof unorganizedSomethings) => {
    if (!somethingsList) return []

    return Promise.all(
      somethingsList.map(async (something) => {
        if (something.media_url &&
            (something.content_type === 'photo' || something.content_type === 'video')) {
          // Extract path from URL
          const urlPath = something.media_url.split('/object/sign/captures-media/')[1]?.split('?')[0] ||
                         something.media_url.split('/object/public/captures-media/')[1]

          if (urlPath) {
            const { data: signedUrlData } = await supabase.storage
              .from('captures-media')
              .createSignedUrl(urlPath, 31536000) // 1 year expiry

            if (signedUrlData?.signedUrl) {
              return { ...something, media_url: signedUrlData.signedUrl }
            }
          }
        }
        return something
      })
    )
  }

  // Generate signed URLs for both all somethings and unorganized somethings
  const [allSomethingsWithUrls, unorganizedWithUrls] = await Promise.all([
    generateSignedUrls(allSomethings || []),
    generateSignedUrls(unorganizedSomethings || [])
  ])

  return (
    <ChamberClient
      somethings={unorganizedWithUrls}
      allSomethings={allSomethingsWithUrls}
      abodes={abodes || []}
      whys={whys || []}
      maxBound={maxBound}
    />
  )
}
