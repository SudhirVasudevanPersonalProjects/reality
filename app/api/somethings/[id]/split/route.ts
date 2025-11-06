import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { splitRequestSchema } from '@/lib/schemas/split'
import { SplitResponse } from '@/lib/types/split'

export async function POST(
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

    // Parse and validate request body
    const body = await request.json()
    const validation = splitRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { splits } = validation.data
    const somethingId = params.id

    // Verify user owns this something
    const { data: something, error: fetchError } = await supabase
      .from('somethings')
      .select('*')
      .eq('id', somethingId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !something) {
      return NextResponse.json(
        { success: false, error: 'Something not found or access denied' },
        { status: 404 }
      )
    }

    // Create split somethings (insert multiple rows)
    // Each split becomes an independent something with new ID
    const newSomethings = splits.map(split => ({
      user_id: user.id,
      text_content: split.text_content,
      media_url: split.media_urls && split.media_urls.length > 0 ? split.media_urls[0] : null,
      content_type: split.media_urls && split.media_urls.length > 0
        ? something.content_type
        : 'text',
      captured_at: something.captured_at, // Preserve original capture time
      parent_id: null, // No parent - these are independent somethings now
      realm: null, // Unorganized (like original)
      domain: something.domain || 'abode', // Default domain
    }))

    const { data: insertedSomethings, error: insertError } = await supabase
      .from('somethings')
      .insert(newSomethings)
      .select('id, text_content, parent_id')

    if (insertError) {
      console.error('Error inserting split somethings:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create splits' },
        { status: 500 }
      )
    }

    // Delete original parent something (split children are the reality now)
    const { error: deleteError } = await supabase
      .from('somethings')
      .delete()
      .eq('id', somethingId)

    if (deleteError) {
      console.error('Error deleting parent something:', deleteError)
      // Don't fail the request if delete fails - splits were created successfully
      // Parent will remain in Chamber, user can manually delete or re-split
    }

    // Revalidate chamber and dashboard to reflect new splits
    revalidatePath('/chamber');
    revalidatePath('/dashboard');

    const response: SplitResponse = {
      success: true,
      splits: (insertedSomethings || []).map(s => ({
        id: s.id,
        text_content: s.text_content || '',
        parent_id: s.parent_id || somethingId
      }))
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Split API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
