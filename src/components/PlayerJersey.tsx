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
    padding: size === 'small' ? '8px 12px' : 0,
    background: size === 'small' ? '#141414' : 'transparent',
    borderRadius: 10,
    userSelect: 'none',
    touchAction: 'none',
    border: size === 'small' ? '1px solid #2a2a2a' : 'none',
    transition: 'box-shadow 0.2s',
  }

  // BP jersey: red and black vertical stripes
  const Jersey = ({ w, h }: { w: number; h: number }) => (
    <svg viewBox="0 0 40 44" width={w} height={h}>
      <defs>
        <clipPath id={`jclip-${player.id}`}>
          <path d="M8 10 L14 4 L20 2 L26 4 L32 10 L36 14 L32 16 L30 12 L30 38 L10 38 L10 12 L8 16 L4 14 Z" />
        </clipPath>
        <linearGradient id={`jgrad-${player.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e53935" />
          <stop offset="100%" stopColor="#b71c1c" />
        </linearGradient>
      </defs>
      {/* Jersey shape */}
      <path d="M8 10 L14 4 L20 2 L26 4 L32 10 L36 14 L32 16 L30 12 L30 38 L10 38 L10 12 L8 16 L4 14 Z"
        fill={`url(#jgrad-${player.id})`} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      {/* Black stripes */}
      <g clipPath={`url(#jclip-${player.id})`}>
        <rect x="13" y="0" width="4" height="44" fill="#111" opacity="0.85" />
        <rect x="21" y="0" width="4" height="44" fill="#111" opacity="0.85" />
        <rect x="29" y="0" width="3" height="44" fill="#111" opacity="0.85" />
      </g>
      {/* Number */}
      <text x="20" y="27" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="Arial">{player.number}</text>
    </svg>
  )

  if (size === 'pitch') {
    return (
      <div ref={setNodeRef} {...listeners} {...attributes} style={{ ...style, flexDirection: 'column', alignItems: 'center' }}>
        <Jersey w={38} h={42} />
        <span style={{
          fontSize: 9, fontWeight: 700, textAlign: 'center',
          maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.9)',
          marginTop: 2,
        }}>
          {player.shirtName || player.name.split(' ').pop()}
        </span>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <Jersey w={22} h={24} />
      <div>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{player.shirtName || player.name}</span>
        <span style={{ fontSize: 11, color: '#666', marginLeft: 6 }}>#{player.number}</span>
      </div>
    </div>
  )
}
