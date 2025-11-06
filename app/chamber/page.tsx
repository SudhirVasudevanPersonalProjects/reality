import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChamberClient from './ChamberClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ChamberPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch unorganized something
  // Priority: specific ID (from split) > FIFO (oldest first)
  let { data: unorganizedSomething, error } = searchParams.id
    ? await supabase
        .from('somethings')
        .select('*')
        .eq('id', searchParams.id)
        .eq('user_id', user.id)
        .is('realm', null)
        .maybeSingle()
    : { data: null, error: null }

  // If specific ID not found or no ID provided, get FIFO
  if (!unorganizedSomething) {
    const result = await supabase
      .from('somethings')
      .select('*')
      .eq('user_id', user.id)
      .is('realm', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    unorganizedSomething = result.data
    error = result.error
  }

  if (error) {
    console.error('Error fetching unorganized something:', error)
  }

  // If no unorganized somethings, show empty state
  if (!unorganizedSomething) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✨</div>
          <h1 className="text-4xl font-bold mb-4">Chamber is Empty</h1>
          <p className="text-gray-400 mb-4">
            All captures organized!
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

  // Generate signed URL for media if exists
  let somethingWithSignedUrl = unorganizedSomething
  if (unorganizedSomething.media_url &&
      (unorganizedSomething.content_type === 'photo' || unorganizedSomething.content_type === 'video')) {
    const urlPath = unorganizedSomething.media_url.split('/object/sign/captures-media/')[1]?.split('?')[0] ||
                   unorganizedSomething.media_url.split('/object/public/captures-media/')[1]

    if (urlPath) {
      const { data: signedUrlData } = await supabase.storage
        .from('captures-media')
        .createSignedUrl(urlPath, 31536000)

      if (signedUrlData?.signedUrl) {
        somethingWithSignedUrl = { ...unorganizedSomething, media_url: signedUrlData.signedUrl }
      }
    }
  }

  return <ChamberClient something={somethingWithSignedUrl} />
}
