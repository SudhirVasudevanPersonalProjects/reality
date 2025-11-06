'use client'

interface CareSliderProps {
  value: number
  onChange: (value: number) => void
  type: 'physical' | 'mind'
}

const PHYSICAL_LABELS = [
  { emoji: '😞', label: 'Ugly' },
  { emoji: '😐', label: 'Meh' },
  { emoji: '😊', label: 'OK' },
  { emoji: '😍', label: 'Beautiful' },
  { emoji: '✨', label: 'Stunning' }
]

const MIND_LABELS = [
  { emoji: '😞', label: 'Hate' },
  { emoji: '😐', label: 'Dislike' },
  { emoji: '😊', label: 'Neutral' },
  { emoji: '😍', label: 'Like' },
  { emoji: '✨', label: 'Love' }
]

export default function CareSlider({ value, onChange, type }: CareSliderProps) {
  const labels = type === 'physical' ? PHYSICAL_LABELS : MIND_LABELS

  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-300">
        Care Rating
      </label>

      {/* Visual emoji selector */}
      <div className="flex justify-between items-center gap-2">
        {labels.map((item, index) => {
          const itemValue = index + 1
          const isSelected = value === itemValue

          return (
            <button
              key={itemValue}
              type="button"
              onClick={() => onChange(itemValue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onChange(itemValue)
                }
              }}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isSelected
                  ? 'bg-white/10 scale-110'
                  : 'hover:bg-white/5 opacity-60 hover:opacity-100'
              }`}
              aria-label={`${item.label} (${itemValue} out of 5)`}
              aria-pressed={isSelected}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs text-gray-400">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Hidden range input for accessibility */}
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sr-only"
        aria-label={`Care rating: ${value} out of 5`}
      />
    </div>
  )
}
