/**
 * Tags API helper functions for Chamber organization
 */

import { createClient } from '@/lib/supabase/server'

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string | null
  created_at: string
}

/**
 * Upsert tags: Create tags if they don't exist, return tag IDs
 * Handles duplicate tag names case-insensitively (lowercase normalize)
 * @param userId - User ID
 * @param tagNames - Array of tag names to upsert
 * @returns Array of tag IDs
 */
export async function upsertTags(userId: string, tagNames: string[]): Promise<string[]> {
  const supabase = await createClient()

  // Normalize tag names: lowercase, trim whitespace, remove duplicates
  const normalizedNames = Array.from(new Set(
    tagNames
      .map(name => name.trim().toLowerCase())
      .filter(name => name.length > 0)
  ))

  if (normalizedNames.length === 0) {
    return []
  }

  // Fetch existing tags for this user with matching names
  const { data: existingTags, error: fetchError } = await supabase
    .from('tags')
    .select('id, name')
    .eq('user_id', userId)
    .in('name', normalizedNames)

  if (fetchError) {
    throw new Error(`Failed to fetch existing tags: ${fetchError.message}`)
  }

  const existingTagMap = new Map<string, string>()
  existingTags?.forEach(tag => {
    existingTagMap.set(tag.name.toLowerCase(), tag.id)
  })

  // Identify new tag names that need to be created
  const newTagNames = normalizedNames.filter(name => !existingTagMap.has(name))

  // Create new tags
  if (newTagNames.length > 0) {
    const { data: newTags, error: insertError } = await supabase
      .from('tags')
      .insert(
        newTagNames.map(name => ({
          user_id: userId,
          name: name,
          color: null
        }))
      )
      .select('id, name')

    if (insertError) {
      throw new Error(`Failed to create new tags: ${insertError.message}`)
    }

    // Add newly created tags to the map
    newTags?.forEach(tag => {
      existingTagMap.set(tag.name.toLowerCase(), tag.id)
    })
  }

  // Return all tag IDs in the order of the normalized names
  return normalizedNames.map(name => existingTagMap.get(name)!).filter(Boolean)
}

/**
 * Link tags to a something
 * @param somethingId - Something ID
 * @param tagIds - Array of tag IDs to link
 */
export async function linkTagsToSomething(
  somethingId: string,
  tagIds: string[]
): Promise<void> {
  const supabase = await createClient()

  if (tagIds.length === 0) {
    return
  }

  // Insert tag links (ignoring duplicates)
  const { error } = await supabase
    .from('something_tags')
    .upsert(
      tagIds.map(tagId => ({
        something_id: somethingId,
        tag_id: tagId
      })),
      { onConflict: 'something_id,tag_id' }
    )

  if (error) {
    throw new Error(`Failed to link tags to something: ${error.message}`)
  }
}
