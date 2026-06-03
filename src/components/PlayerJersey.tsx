import { useDraggable } from '@dnd-kit/core'
import { Player } from '../types'

interface Props {
  player: Player
  size?: 'small' | 'pitch'
}

export default function PlayerJersey({ player, size = 'small' }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: player.id })

  const style: React.CSSProperties = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: size === 'small' ? '6px 10px' : 0,
    background: size === 'small' ? '#2a1010' : 'transparent',
    borderRadius: 6,
    userSelect: 'none',
    touchAction: 'none',
  }

  // BP jersey: red and black vertical stripes
  const jerseyIcon = (w: number, h: number) => (
    <svg viewBox="0 0 40 44" width={w} height={h}>
      {/* Jersey shape */}
      <path d="M8 8 L20 2 L32 8 L34 30 L28 38 L12 38 L6 30 Z" fill="#d32f2f" stroke="#222" strokeWidth="1" />
      {/* Black stripes */}
      <clipPath id={`clip-${player.id}`}>
        <path d="M8 8 L20 2 L32 8 L34 30 L28 38 L12 38 L6 30 Z" />
      </clipPath>
      <g clipPath={`url(#clip-${player.id})`}>
        <rect x="12" y="0" width="4" height="44" fill="#111" />
        <rect x="20" y="0" width="4" height="44" fill="#111" />
        <rect x="28" y="0" width="4" height="44" fill="#111" />
      </g>
      {/* Number */}
      <text x="20" y="26" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        {player.number}
      </text>
    </svg>
  )

  if (size === 'pitch') {
    return (
      <div ref={setNodeRef} {...listeners} {...attributes} style={{ ...style, flexDirection: 'column', alignItems: 'center' }}>
        {jerseyIcon(36, 40)}
        <span style={{ fontSize: 9, fontWeight: 600, textAlign: 'center', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
          {player.shirtName || player.name.split(' ').pop()}
        </span>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {jerseyIcon(24, 28)}
      <span style={{ fontSize: 13 }}>{player.shirtName || player.name}</span>
    </div>
  )
}
