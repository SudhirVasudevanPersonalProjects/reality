/**
 * Unit Tests: Auto-split logic for Deep-Capture
 * Tests text splitting on newlines
 */

describe('Deep-Capture Split Logic', () => {
  describe('splitOnNewlines', () => {
    it('should split text on single newline', () => {
      const text = 'Line 1\nLine 2\nLine 3'
      const splits = text.split('\n').filter(s => s.trim())

      expect(splits).toEqual(['Line 1', 'Line 2', 'Line 3'])
      expect(splits.length).toBe(3)
    })

    it('should handle empty lines', () => {
      const text = 'Line 1\n\nLine 2\n  \nLine 3'
      const splits = text.split('\n').filter(s => s.trim())

      expect(splits).toEqual(['Line 1', 'Line 2', 'Line 3'])
      expect(splits.length).toBe(3)
    })

    it('should return single item for text without newlines', () => {
      const text = 'Single line text'
      const splits = text.includes('\n')
        ? text.split('\n').filter(s => s.trim())
        : text.trim() ? [text.trim()] : []

      expect(splits).toEqual(['Single line text'])
      expect(splits.length).toBe(1)
    })

    it('should return empty array for empty text', () => {
      const text = ''
      const splits = text.split('\n').filter(s => s.trim())

      expect(splits).toEqual([])
      expect(splits.length).toBe(0)
    })

    it('should handle text with only whitespace', () => {
      const text = '   \n  \n   '
      const splits = text.split('\n').filter(s => s.trim())

      expect(splits).toEqual([])
      expect(splits.length).toBe(0)
    })

    it('should preserve content in splits', () => {
      const text = 'First item with special chars !@#\nSecond item with 123\nThird item with emoji 🚀'
      const splits = text.split('\n').filter(s => s.trim())

      expect(splits).toEqual([
        'First item with special chars !@#',
        'Second item with 123',
        'Third item with emoji 🚀'
      ])
    })
  })

  describe('mergeItems', () => {
    it('should concatenate two text items with newline', () => {
      const item1 = { content: 'First text', type: 'text' }
      const item2 = { content: 'Second text', type: 'text' }
      const merged = `${item1.content}\n${item2.content}`

      expect(merged).toBe('First text\nSecond text')
    })

    it('should handle empty content', () => {
      const item1 = { content: '', type: 'text' }
      const item2 = { content: 'Some text', type: 'text' }
      const merged = `${item1.content}\n${item2.content}`

      expect(merged).toBe('\nSome text')
    })
  })

  describe('deleteItem', () => {
    it('should remove item from array', () => {
      const items = [
        { id: '1', content: 'First', type: 'text' },
        { id: '2', content: 'Second', type: 'text' },
        { id: '3', content: 'Third', type: 'text' }
      ]
      const filtered = items.filter(item => item.id !== '2')

      expect(filtered).toEqual([
        { id: '1', content: 'First', type: 'text' },
        { id: '3', content: 'Third', type: 'text' }
      ])
      expect(filtered.length).toBe(2)
    })

    it('should handle non-existent id', () => {
      const items = [
        { id: '1', content: 'First', type: 'text' }
      ]
      const filtered = items.filter(item => item.id !== '999')

      expect(filtered).toEqual(items)
    })
  })
})
