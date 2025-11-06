import { describe, it, expect } from 'vitest'

describe('Dashboard Query Filtering', () => {
  it('should filter somethings to only show realm IS NOT NULL', () => {
    // Mock somethings data
    const allSomethings = [
      { id: '1', realm: null, text_content: 'Unorganized' },
      { id: '2', realm: 'reality', text_content: 'Reality item' },
      { id: '3', realm: null, text_content: 'Another unorganized' },
      { id: '4', realm: 'mind', text_content: 'Mind item' },
      { id: '5', realm: 'heart', text_content: 'Heart item' }
    ]

    // Simulate dashboard query filter
    const organizedSomethings = allSomethings.filter(s => s.realm !== null)

    expect(organizedSomethings).toHaveLength(3)
    expect(organizedSomethings.every(s => s.realm !== null)).toBe(true)
    expect(organizedSomethings.map(s => s.id)).toEqual(['2', '4', '5'])
  })

  it('should count unorganized somethings correctly (realm IS NULL)', () => {
    const allSomethings = [
      { id: '1', realm: null },
      { id: '2', realm: 'reality' },
      { id: '3', realm: null },
      { id: '4', realm: null },
      { id: '5', realm: 'mind' }
    ]

    const unorganizedCount = allSomethings.filter(s => s.realm === null).length

    expect(unorganizedCount).toBe(3)
  })

  it('should return empty array when no organized somethings exist', () => {
    const allSomethings = [
      { id: '1', realm: null },
      { id: '2', realm: null }
    ]

    const organizedSomethings = allSomethings.filter(s => s.realm !== null)

    expect(organizedSomethings).toHaveLength(0)
  })

  it('should return 0 when no unorganized somethings exist', () => {
    const allSomethings = [
      { id: '1', realm: 'reality' },
      { id: '2', realm: 'mind' }
    ]

    const unorganizedCount = allSomethings.filter(s => s.realm === null).length

    expect(unorganizedCount).toBe(0)
  })
})
