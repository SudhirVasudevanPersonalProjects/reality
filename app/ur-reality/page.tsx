import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UrRealityClient from './UrRealityClient'

export const dynamic = 'force-dynamic'

export default async function UrRealityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all somethings for this user
  const { data: somethings, error } = await supabase
    .from('somethings')
    .select('*')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: false })

  if (error) {
    console.error('Error fetching somethings:', error)
    return <div>Error loading your reality. Please try again.</div>
  }

  return <UrRealityClient somethings={somethings || []} />
}
