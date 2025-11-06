import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

type Capture = Database['public']['Tables']['somethings']['Row']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user's ORGANIZED somethings (realm IS NOT NULL) ordered by captured_at DESC
  // Filter out 'url' type somethings (those are for background storage/querying only)
  const { data: captures, error } = await supabase
    .from('somethings')
    .select('*')
    .eq('user_id', user.id)
    .neq('content_type', 'url')
    .not('realm', 'is', null)  // Only organized somethings
    .order('captured_at', { ascending: false })

  // Get count of unorganized somethings (realm IS NULL)
  const { count: unorganizedCount, error: countError } = await supabase
    .from('somethings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('realm', null)

  if (error) {
    console.error('Error fetching captures:', error)
  }

  if (countError) {
    console.error('Error fetching unorganized count:', countError)
  }

  // Generate fresh signed URLs for media captures (private bucket)
  const capturesWithSignedUrls = await Promise.all(
    (captures || []).map(async (capture) => {
      // Skip if not a media capture
      if (!capture.media_url || (capture.content_type !== 'photo' && capture.content_type !== 'video')) {
        return capture
      }

      // Extract file path from existing URL (handle both old and new URLs)
      const urlPath = capture.media_url.split('/object/sign/captures-media/')[1]?.split('?')[0] ||
                     capture.media_url.split('/object/public/captures-media/')[1]

      if (!urlPath) {
        console.error('Could not extract file path from URL:', capture.media_url)
        return capture
      }

      // Generate fresh signed URL (valid for 1 year)
      const { data: signedUrlData } = await supabase.storage
        .from('captures-media')
        .createSignedUrl(urlPath, 31536000)

      if (signedUrlData?.signedUrl) {
        return { ...capture, media_url: signedUrlData.signedUrl }
      }

      return capture
    })
  )

  return <DashboardClient user={user} captures={capturesWithSignedUrls} unorganizedCount={unorganizedCount || 0} />
}
