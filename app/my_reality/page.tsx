import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MapContainer } from '@/app/components/map/MapContainer'

export const dynamic = 'force-dynamic'

export default async function MyRealityPage() {
  // Server-side auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  return <MapContainer />
}
