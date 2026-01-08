/**
 * Care Picker UI Component
 *
 * Displays 5 buttons for rating care level (-2 to +2)
 */

import { getCareLabel, getCareVisual } from '@/lib/my-reality/care-visual-mapping'

interface CarePickerUIProps {
  currentCare: number | null
  onSelectCare: (care: number) => void
  onDelete?: () => void
  onClose?: () => void
}

export default function CarePickerUI({
  currentCare,
  onSelectCare,
  onDelete,
  onClose,
}: CarePickerUIProps) {
  const careLevels = [-2, -1, 0, 1, 2, 3]

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex gap-2 bg-black/80 backdrop-blur-md p-2 rounded-lg border border-white/10">
        {/* Nothing button (delete) */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-red-500/20 hover:scale-105 transition-all duration-200"
            title="Delete this something (make it nothing)"
          >
            {/* X icon */}
            <div className="w-8 h-8 flex items-center justify-center text-red-400 text-2xl font-bold">
              ✕
            </div>

            {/* Label */}
            <span className="text-xs text-red-400/90">nothing</span>
          </button>
        )}

        {/* Care level buttons */}
        {careLevels.map((care) => {
          const { label } = getCareLabel(care)
          const visual = getCareVisual(care)
          const isSelected = currentCare === care
          const isDream = care === 3

          return (
            <button
              key={care}
              onClick={() => onSelectCare(care)}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg
                transition-all duration-200
                ${
                  isSelected
                    ? 'bg-white/20 scale-105 ring-1 ring-white/40'
                    : 'hover:bg-white/10 hover:scale-105'
                }
              `}
              title={label}
            >
              {/* Preview icon - star for dream, ball for others */}
              {isDream ? (
                <div
                  className="w-8 h-8 flex items-center justify-center text-3xl transition-all duration-300"
                  style={{
                    filter: `drop-shadow(0 0 ${visual.glowBlur / 3}px ${visual.glowColor})`,
                  }}
                >
                  ⭐
                </div>
              ) : (
                <div
                  className="w-8 h-8 rounded-full transition-all duration-300"
                  style={{
                    background: `radial-gradient(circle, ${visual.gradientStops[0].color}, ${visual.gradientStops[1].color})`,
                    boxShadow:
                      visual.glowBlur > 0
                        ? `0 0 ${visual.glowBlur / 2}px ${visual.glowColor}`
                        : 'none',
                  }}
                />
              )}

              {/* Care label */}
              <span className="text-xs text-white/70">
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
