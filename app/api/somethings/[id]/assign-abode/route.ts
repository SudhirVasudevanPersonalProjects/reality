import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: somethingId } = await params
    const { abode_name, icon, color, whys } = await request.json()

    if (!abode_name || typeof abode_name !== 'string') {
      return NextResponse.json(
        { error: 'abode_name is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the something belongs to the user
    const { data: something, error: somethingError } = await supabase
      .from('somethings')
      .select('*')
      .eq('id', somethingId)
      .eq('user_id', user.id)
      .single()

    if (somethingError || !something) {
      return NextResponse.json(
        { error: 'Something not found' },
        { status: 404 }
      )
    }

    // 1. Find or create abode
    let abode
    const { data: existingAbode } = await supabase
      .from('somethings')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_type', 'abode')
      .ilike('text_content', abode_name)
      .single()

    if (existingAbode) {
      abode = existingAbode
    } else {
      // Create new abode
      const { data: newAbode, error: createError } = await supabase
        .from('somethings')
        .insert({
          user_id: user.id,
          content_type: 'abode',
          text_content: abode_name,
          captured_at: new Date().toISOString(),
          parent_id: null,
          attributes: {
            icon: icon || '📦',
            color: color || '#6B7280',
          },
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating abode:', createError)
        return NextResponse.json(
          { error: 'Failed to create abode' },
          { status: 500 }
        )
      }

      abode = newAbode
    }

    // 2. Assign capture to abode (set parent_id)
    const { error: assignError } = await supabase
      .from('somethings')
      .update({ parent_id: abode.id })
      .eq('id', somethingId)

    if (assignError) {
      console.error('Error assigning to abode:', assignError)
      return NextResponse.json(
        { error: 'Failed to assign to abode' },
        { status: 500 }
      )
    }

    // 3. Process whys (first-class somethings)
    const whyIds: string[] = []
    const newWhys: any[] = []

    if (whys && Array.isArray(whys)) {
      for (const whyText of whys) {
        if (!whyText || typeof whyText !== 'string') continue

        // Find or create why something
        let whySomething
        const { data: existingWhy } = await supabase
          .from('somethings')
          .select('*')
          .eq('user_id', user.id)
          .eq('content_type', 'why')
          .ilike('text_content', whyText)
          .single()

        if (existingWhy) {
          whySomething = existingWhy
        } else {
          // Create new why
          const { data: newWhy, error: whyCreateError } = await supabase
            .from('somethings')
            .insert({
              user_id: user.id,
              content_type: 'why',
              text_content: whyText,
              captured_at: new Date().toISOString(),
              parent_id: null,
            })
            .select()
            .single()

          if (whyCreateError) {
            console.error('Error creating why:', whyCreateError)
            continue
          }

          whySomething = newWhy
          newWhys.push(newWhy)
        }

        // Create connection: capture → why
        const { error: connectionError } = await supabase
          .from('connections')
          .insert({
            user_id: user.id,
            from_something_id: somethingId,
            to_something_id: whySomething.id,
            relationship_type: 'has_why',
          })

        if (connectionError) {
          // Connection might already exist, ignore duplicate errors
          if (!connectionError.message?.includes('duplicate')) {
            console.error('Error creating connection:', connectionError)
          }
        } else {
          whyIds.push(whySomething.id)
        }
      }
    }

    return NextResponse.json({
      success: true,
      abode,
      whyIds,
      newWhys,
    })
  } catch (error) {
    console.error('Error in assign-abode:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
