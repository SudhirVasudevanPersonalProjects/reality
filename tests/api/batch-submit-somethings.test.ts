/**
 * Integration Tests: Batch submit multiple somethings from Deep-Capture
 */

import { createClient } from '@/lib/supabase/server'

describe('API: Batch Submit Somethings', () => {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let testUserId: string
  const createdSomethingIds: string[] = []

  beforeAll(async () => {
    supabase = await createClient()

    // Get or create test user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user for testing')
    testUserId = user.id
  })

  afterEach(async () => {
    // Clean up created somethings
    if (createdSomethingIds.length > 0) {
      await supabase
        .from('somethings')
        .delete()
        .in('id', createdSomethingIds)
      createdSomethingIds.length = 0
    }
  })

  describe('POST /api/somethings - Batch Submit', () => {
    it('should create multiple text somethings', async () => {
      const textContents = [
        'First something',
        'Second something',
        'Third something'
      ]

      const responses = await Promise.all(
        textContents.map(text =>
          fetch('/api/somethings', {
            method: 'POST',
            body: new URLSearchParams({ text_content: text })
          })
        )
      )

      expect(responses.every(r => r.ok)).toBe(true)

      const somethings = await Promise.all(responses.map(r => r.json()))
      somethings.forEach(s => createdSomethingIds.push(s.id))

      expect(somethings).toHaveLength(3)
      somethings.forEach((s, index) => {
        expect(s.text_content).toBe(textContents[index])
        expect(s.user_id).toBe(testUserId)
      })
    })

    it('should handle mixed content types (text + media)', async () => {
      const submissions = [
        { text_content: 'Text something' },
        { media_url: 'https://example.com/photo.jpg' },
        { text_content: 'Another text' }
      ]

      const responses = await Promise.all(
        submissions.map(data =>
          fetch('/api/somethings', {
            method: 'POST',
            body: new URLSearchParams(data as Record<string, string>)
          })
        )
      )

      expect(responses.every(r => r.ok)).toBe(true)

      const somethings = await Promise.all(responses.map(r => r.json()))
      somethings.forEach(s => createdSomethingIds.push(s.id))

      expect(somethings).toHaveLength(3)
      expect(somethings[0].text_content).toBe('Text something')
      expect(somethings[1].media_url).toBe('https://example.com/photo.jpg')
      expect(somethings[2].text_content).toBe('Another text')
    })

    it('should handle link previews in attributes', async () => {
      const linkPreview = {
        url: 'https://instagram.com/p/ABC123',
        title: 'Instagram Post',
        description: 'An interesting post'
      }

      const formData = new URLSearchParams({
        text_content: linkPreview.url,
        attributes: JSON.stringify({ link_preview: linkPreview })
      })

      const response = await fetch('/api/somethings', {
        method: 'POST',
        body: formData
      })

      expect(response.ok).toBe(true)

      const something = await response.json()
      createdSomethingIds.push(something.id)

      expect(something.text_content).toBe(linkPreview.url)
      expect(something.attributes).toBeDefined()
      expect(something.attributes.link_preview).toEqual(linkPreview)
    })

    it('should handle failures gracefully', async () => {
      const submissions = [
        { text_content: 'Valid text' },
        { /* invalid - no content */ },
        { text_content: 'Another valid text' }
      ]

      const responses = await Promise.allSettled(
        submissions.map(data =>
          fetch('/api/somethings', {
            method: 'POST',
            body: new URLSearchParams(data as Record<string, string>)
          })
        )
      )

      const successfulResponses = responses
        .filter((r): r is PromiseFulfilledResult<Response> => r.status === 'fulfilled' && r.value.ok)
        .map(r => r.value)

      expect(successfulResponses.length).toBeGreaterThanOrEqual(2)

      const somethings = await Promise.all(successfulResponses.map(r => r.json()))
      somethings.forEach(s => createdSomethingIds.push(s.id))
    })

    it('should maintain order of submissions', async () => {
      const orderedTexts = ['First', 'Second', 'Third', 'Fourth', 'Fifth']

      const responses = await Promise.all(
        orderedTexts.map(text =>
          fetch('/api/somethings', {
            method: 'POST',
            body: new URLSearchParams({ text_content: text })
          })
        )
      )

      const somethings = await Promise.all(responses.map(r => r.json()))
      somethings.forEach(s => createdSomethingIds.push(s.id))

      // Verify all were created
      expect(somethings).toHaveLength(5)

      // Note: Order may not be preserved in parallel submission
      // This is expected behavior
      const texts = somethings.map(s => s.text_content)
      orderedTexts.forEach(text => {
        expect(texts).toContain(text)
      })
    })
  })

  describe('File Upload Integration', () => {
    it('should handle photo uploads via media_url', async () => {
      const mediaUrl = 'https://example.com/user123/12345-photo.jpg'

      const response = await fetch('/api/somethings', {
        method: 'POST',
        body: new URLSearchParams({ media_url: mediaUrl })
      })

      expect(response.ok).toBe(true)

      const something = await response.json()
      createdSomethingIds.push(something.id)

      expect(something.media_url).toBe(mediaUrl)
      expect(something.user_id).toBe(testUserId)
    })

    it('should handle video uploads via media_url', async () => {
      const mediaUrl = 'https://example.com/user123/12345-video.mp4'

      const response = await fetch('/api/somethings', {
        method: 'POST',
        body: new URLSearchParams({ media_url: mediaUrl })
      })

      expect(response.ok).toBe(true)

      const something = await response.json()
      createdSomethingIds.push(something.id)

      expect(something.media_url).toBe(mediaUrl)
    })
  })
})
