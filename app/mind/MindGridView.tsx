'use client'

import { MindCardPreview, SomethingPreview } from '@/app/components/MindCardPreview'
import { MindSortControls } from '@/app/components/MindSortControls'

interface Filters {
  care: number[] | null
  category: string[] | null
  location: string | null
  sort: string
}

interface MindGridViewProps {
  somethings: SomethingPreview[]
  filters: Filters
}

export function MindGridView({ somethings, filters }: MindGridViewProps) {
  // Empty state: No Mind somethings exist
  if (somethings.length === 0 && !filters.care && !filters.category && !filters.location) {
    return (
      <main className="min-h-screen bg-void text-white p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Mind&apos;s Abode</h1>
            <p className="text-gray-400">Your thoughts, experiences & desires</p>
          </header>

          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">💭</div>
            <h2 className="text-2xl font-semibold mb-2">No thoughts captured yet</h2>
            <p className="text-gray-400 mb-6">Start by organizing captures in your Chamber.</p>
            <a
              href="/chamber"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Go to Chamber
            </a>
          </div>
        </div>
      </main>
    )
  }

  // Empty state: Filters applied but no results
  if (somethings.length === 0) {
    return (
      <main className="min-h-screen bg-void text-white p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Mind&apos;s Abode</h1>
            <p className="text-gray-400">Your thoughts, experiences & desires</p>
          </header>

          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold mb-2">No matches found</h2>
            <p className="text-gray-400 mb-6">Try adjusting your filters.</p>
            <a
              href="/mind"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Clear All Filters
            </a>
          </div>
        </div>
      </main>
    )
  }

  // Main grid view
  return (
    <main className="min-h-screen bg-void text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Mind&apos;s Abode</h1>
              <p className="text-gray-400">Your thoughts, experiences & desires</p>
            </div>
            <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
              New Mind Entry
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {somethings.length} Mind {somethings.length === 1 ? 'something' : 'somethings'}
            </div>
            <MindSortControls />
          </div>
        </header>

        {/* Grid using MindCardPreview components */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" role="list">
          {somethings.map((something) => (
            <MindCardPreview key={something.id} something={something} />
          ))}
        </div>
      </div>
    </main>
  )
}
