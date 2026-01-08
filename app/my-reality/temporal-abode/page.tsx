import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TemporalAbodeClient from './TemporalAbodeClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TemporalAbodePage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch all somethings ordered by captured_at (timeline)
  const { data: somethings, error } = await supabase
    .from('somethings')
    .select('*')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: false })

  if (error) {
    console.error('Error fetching somethings:', error)
    return (
      <div className="min-h-screen bg-[#0a1628] text-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Timeline</h1>
          <p className="text-gray-400 mb-8">{error.message}</p>
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

  // Generate signed URLs for media
  const somethingsWithSignedUrls = await Promise.all(
    (somethings || []).map(async (something) => {
      if (something.media_url &&
          (something.content_type === 'photo' || something.content_type === 'video')) {
        const urlPath = something.media_url.split('/object/sign/captures-media/')[1]?.split('?')[0] ||
                       something.media_url.split('/object/public/captures-media/')[1]

        if (urlPath) {
          const { data: signedUrlData } = await supabase.storage
            .from('captures-media')
            .createSignedUrl(urlPath, 31536000)

          if (signedUrlData?.signedUrl) {
            return { ...something, media_url: signedUrlData.signedUrl }
          }
        }
      }
      return something
    })
  )

  return <TemporalAbodeClient somethings={somethingsWithSignedUrls} />
}
