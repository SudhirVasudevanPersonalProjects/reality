'use client'

interface Abode {
  id: string
  text_content: string | null
  attributes: {
    icon?: string
    color?: string
  } | null
}

interface FilterBarProps {
  abodes: Abode[]
  activeFilters: string[]
  onToggleFilter: (abodeId: string) => void
}

export default function FilterBar({ abodes, activeFilters, onToggleFilter }: FilterBarProps) {
  if (abodes.length === 0) return null

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
        {abodes.map((abode) => {
          const isActive = activeFilters.includes(abode.id)
          const icon = abode.attributes?.icon || '🔵'
          const color = abode.attributes?.color || '#4A90D9'
          const name = abode.text_content || 'Unnamed'

          return (
            <button
              key={abode.id}
              onClick={() => onToggleFilter(abode.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-white/20 border-2 shadow-lg'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }
              `}
              style={{
                borderColor: isActive ? color : undefined,
                boxShadow: isActive ? `0 0 20px ${color}40` : undefined,
              }}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-white text-sm font-medium">{name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
