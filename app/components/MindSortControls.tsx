'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function MindSortControls() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'recent'

  const sortOptions = [
    { value: 'recent', label: 'Recent First' },
    { value: 'care_desc', label: 'Care: High → Low' },
    { value: 'care_asc', label: 'Care: Low → High' },
    { value: 'oldest', label: 'Oldest First' }
  ]

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (sortValue === 'recent') {
      params.delete('sort') // Default sort, no need to include in URL
    } else {
      params.set('sort', sortValue)
    }

    const queryString = params.toString()
    const newUrl = queryString ? `/mind?${queryString}` : '/mind'

    router.push(newUrl)
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm text-gray-400">
        Sort by:
      </label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white hover:bg-gray-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
