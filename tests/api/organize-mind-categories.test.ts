/**
 * Test suite for Story 2.4 PATCH: Mind Categories & Why Field
 * Tests the organization API with mind_category, why, and desire-specific fields
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

describe('Story 2.4 PATCH: Mind Category Organization', () => {
  let testUserId: string
  let testSomethingId: string
  let authToken: string

  beforeEach(async () => {
    // Create test user
    const email = `test-${Date.now()}@example.com`
    const password = 'TestPassword123!'

    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (signUpError) throw signUpError
    testUserId = authData.user.id

    // Get auth token
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) throw signInError
    authToken = sessionData.session!.access_token

    // Create test something
    const { data: something, error: somethingError } = await supabase
      .from('somethings')
      .insert({
        user_id: testUserId,
        text_content: 'Test mind something',
        content_type: 'text',
        realm: 'unorganized'
      })
      .select()
      .single()

    if (somethingError) throw somethingError
    testSomethingId = something.id
  })

  afterAll(async () => {
    // Cleanup: Delete test user (cascades to somethings)
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId)
    }
  })

  it('should accept mind_category as experience', async () => {
    const response = await fetch(`http://localhost:3000/api/somethings/${testSomethingId}/organize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        realm: 'mind',
        care: 4,
        attributes: {
          mind_category: 'experience',
          why: 'This memory shaped my understanding of friendship'
        }
      })
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.success).toBe(true)

    // Verify in database
    const { data: something } = await supabase
      .from('somethings')
      .select('*')
      .eq('id', testSomethingId)
      .single()

    expect(something?.attributes).toMatchObject({
      mind_category: 'experience',
      why: 'This memory shaped my understanding of friendship'
    })
  })

  it('should accept mind_category as thought', async () => {
    const response = await fetch(`http://localhost:3000/api/somethings/${testSomethingId}/organize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        realm: 'mind',
        care: 3,
        attributes: {
          mind_category: 'thought',
          why: 'This insight helps me understand patterns in my behavior'
        }
      })
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.success).toBe(true)

    const { data: something } = await supabase
      .from('somethings')
      .select('*')
      .eq('id', testSomethingId)
      .single()

    expect(something?.attributes).toMatchObject({
      mind_category: 'thought',
      why: 'This insight helps me understand patterns in my behavior'
    })
  })

  it('should accept mind_category as desire with intensity and status', async () => {
    const response = await fetch(`http://localhost:3000/api/somethings/${testSomethingId}/organize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        realm: 'mind',
        care: 5,
        attributes: {
          mind_category: 'desire',
          why: 'This goal represents my deeper need for creative expression',
          desire_intensity: 0.8,
          desire_status: 'active'
        }
      })
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.success).toBe(true)

    const { data: something } = await supabase
      .from('somethings')
      .select('*')
      .eq('id', testSomethingId)
      .single()

    expect(something?.attributes).toMatchObject({
      mind_category: 'desire',
      why: 'This goal represents my deeper need for creative expression',
      desire_intensity: 0.8,
      desire_status: 'active'
    })
  })

  it('should set sun_domain to "somewhere" when why is empty', async () => {
    const response = await fetch(`http://localhost:3000/api/somethings/${testSomethingId}/organize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        realm: 'mind',
        care: 3,
        attributes: {
          mind_category: 'thought',
          sun_domain: 'somewhere'
        }
      })
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.success).toBe(true)

    const { data: something } = await supabase
      .from('somethings')
      .select('*')
      .eq('id', testSomethingId)
      .single()

    expect(something?.attributes).toMatchObject({
      mind_category: 'thought',
      sun_domain: 'somewhere'
    })
  })

  it('should accept optional why field', async () => {
    const response = await fetch(`http://localhost:3000/api/somethings/${testSomethingId}/organize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        realm: 'mind',
        care: 3,
        attributes: {
          mind_category: 'experience'
        }
      })
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.success).toBe(true)
  })

  it('should reject why field exceeding 1000 characters', async () => {
    const longWhy = 'a'.repeat(1001)

    const response = await fetch(`http://localhost:3000/api/somethings/${testSomethingId}/organize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        realm: 'mind',
        care: 3,
        attributes: {
          mind_category: 'thought',
          why: longWhy
        }
      })
    })

    expect(response.ok).toBe(false)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('should reject invalid mind_category', async () => {
    const response = await fetch(`http://localhost:3000/api/somethings/${testSomethingId}/organize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        realm: 'mind',
        care: 3,
        attributes: {
          mind_category: 'invalid_category',
          why: 'Test'
        }
      })
    })

    expect(response.ok).toBe(false)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('should reject desire_intensity outside 0-1 range', async () => {
    const response = await fetch(`http://localhost:3000/api/somethings/${testSomethingId}/organize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        realm: 'mind',
        care: 3,
        attributes: {
          mind_category: 'desire',
          desire_intensity: 1.5
        }
      })
    })

    expect(response.ok).toBe(false)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('should reject invalid desire_status', async () => {
    const response = await fetch(`http://localhost:3000/api/somethings/${testSomethingId}/organize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        realm: 'mind',
        care: 3,
        attributes: {
          mind_category: 'desire',
          desire_status: 'invalid_status'
        }
      })
    })

    expect(response.ok).toBe(false)
    const data = await response.json()
    expect(data.success).toBe(false)
  })
})
