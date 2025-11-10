'use client'

import { QuestionMarkPosition } from '@/lib/ur-reality/distribute-question-marks'

interface QuestionMarkProps {
  position: QuestionMarkPosition
  isClicked: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function QuestionMark({
  position,
  isClicked,
  onClick,
  onMouseEnter,
  onMouseLeave
}: QuestionMarkProps) {
  // Grey question marks - dark grey (almost black) when clicked
  const circleColor = isClicked ? '#2a2a2a' : 'transparent'
  const questionMarkColor = isClicked ? '#2a2a2a' : '#888'

  return (
    <div
      className="absolute cursor-pointer transition-all duration-200"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 1
      }}
    >
      <svg
        viewBox="0 0 100 140"
        width={position.size}
        height={position.size * 1.4}
        className="drop-shadow-lg"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Transparent clickable area - larger hit target */}
        <rect
          x="0"
          y="0"
          width="100"
          height="140"
          fill="transparent"
          className="cursor-pointer"
        />

        {/* Circle background - only visible when clicked (shaded inside) */}
        <ellipse
          cx="50"
          cy="70"
          rx="45"
          ry="58"
          fill={circleColor}
          stroke="transparent"
        />

        {/* Question mark - stretched vertically, grey color */}
        <text
          x="50"
          y="95"
          fontSize="90"
          fontWeight="bold"
          fill={questionMarkColor}
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          transform="scale(1, 1.3)"
          transformOrigin="50 70"
        >
          ?
        </text>
      </svg>
    </div>
  )
}
