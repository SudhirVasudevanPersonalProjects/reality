import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { organizeRequestSchema } from '@/lib/schemas/organization'
import { OrganizeResponse } from '@/lib/types/organization'
import { upsertTags, linkTagsToSomething } from '@/lib/api/tags'

export async function PATCH(
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
    const validation = organizeRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { realm, care, location_name, latitude, longitude, formatted_address, tags } = validation.data
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

    // Block organization if current realm is 'split' (split parent placeholder)
    if (something.realm === 'split') {
      return NextResponse.json(
        { success: false, error: 'Cannot organize split parent placeholder' },
        { status: 403 }
      )
    }

    // Build update object
    const updateData: Record<string, any> = {
      realm,
      care
    }

    // Physical-specific fields
    if (realm === 'physical') {
      updateData.location_name = location_name

      // Validate and add coordinates if provided
      if (latitude !== undefined && longitude !== undefined) {
        // Validate coordinate ranges
        if (latitude < -90 || latitude > 90) {
          return NextResponse.json(
            { success: false, error: 'Invalid latitude (must be -90 to 90)' },
            { status: 400 }
          )
        }
        if (longitude < -180 || longitude > 180) {
          return NextResponse.json(
            { success: false, error: 'Invalid longitude (must be -180 to 180)' },
            { status: 400 }
          )
        }

        updateData.latitude = latitude
        updateData.longitude = longitude
        updateData.formatted_address = formatted_address || null
        updateData.visited = true // Mark as visited when coordinates captured
      }
    }

    // Update somethings record
    const { data: updatedSomething, error: updateError } = await supabase
      .from('somethings')
      .update(updateData)
      .eq('id', somethingId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating something:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to organize something' },
        { status: 500 }
      )
    }

    // Handle tags for mind realm
    if (realm === 'mind' && tags && tags.length > 0) {
      try {
        const tagIds = await upsertTags(user.id, tags)
        await linkTagsToSomething(somethingId, tagIds)
      } catch (tagError) {
        console.error('Error processing tags:', tagError)
        // Don't fail the request if tag processing fails
        // The something was already organized successfully
      }
    }

    // Revalidate dashboard and chamber to show updated unorganized count
    revalidatePath('/dashboard');
    revalidatePath('/chamber');
    revalidatePath('/my_reality');

    const response: OrganizeResponse = {
      success: true,
      something: {
        id: updatedSomething.id,
        realm: updatedSomething.realm as 'physical' | 'mind',
        care: updatedSomething.care!,
        location_name: updatedSomething.location_name || undefined,
        latitude: updatedSomething.latitude || undefined,
        longitude: updatedSomething.longitude || undefined,
        formatted_address: updatedSomething.formatted_address || undefined,
        updated_at: updatedSomething.updated_at!
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Organize API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
