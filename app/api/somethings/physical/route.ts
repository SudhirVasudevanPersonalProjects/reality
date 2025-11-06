import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch Physical somethings with coordinates (RLS filters by user_id automatically)
    const { data: somethings, error } = await supabase
      .from('somethings')
      .select('*')
      .eq('realm', 'physical')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('captured_at', { ascending: false })

    if (error) {
      console.error('Error fetching Physical somethings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch somethings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ somethings: somethings || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
