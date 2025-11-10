import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DeepCaptureClient from './DeepCaptureClient'

export const dynamic = 'force-dynamic'

export default async function DeepCapturePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <DeepCaptureClient />
}
