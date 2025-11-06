import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const somethingId = params.id

    // Verify user owns this something before deleting (RLS will also enforce this)
    const { data: something, error: fetchError } = await supabase
      .from('somethings')
      .select('id, user_id')
      .eq('id', somethingId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !something) {
      return NextResponse.json(
        { success: false, error: 'Something not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the something (cascade will handle children if parent_id references exist)
    const { error: deleteError } = await supabase
      .from('somethings')
      .delete()
      .eq('id', somethingId)

    if (deleteError) {
      console.error('Error deleting something:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete something' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Something deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
