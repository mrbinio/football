import { useDraggable } from '@dnd-kit/core'
import { Player } from '../types'

interface Props {
  player: Player
  size?: 'small' | 'pitch'
}

export default function PlayerJersey({ player, size = 'small' }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: player.id })

  const style: React.CSSProperties = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: size === 'small' ? '10px 12px' : 0,
    background: size === 'small' ? 'rgba(255,255,255,0.03)' : 'transparent',
    borderRadius: 10,
    userSelect: 'none',
    touchAction: 'none',
    border: size === 'small' ? '1px solid rgba(255,255,255,0.08)' : 'none',
    opacity: isDragging ? 0.5 : 1,
    transition: 'opacity 0.15s, box-shadow 0.2s, background 0.2s',
  }

  // BP jersey SVG
  const Jersey = ({ w, h }: { w: number; h: number }) => (
    <svg viewBox="0 0 44 48" width={w} height={h} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
      <defs>
        <clipPath id={`jc-${player.id}-${size}`}>
          <path d="M10 11 L16 5 L22 3 L28 5 L34 11 L38 15 L34 17.5 L32 13 L32 42 L12 42 L12 13 L10 17.5 L6 15 Z" />
        </clipPath>
        <linearGradient id={`jg-${player.id}-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef5350" />
          <stop offset="50%" stopColor="#d32f2f" />
          <stop offset="100%" stopColor="#b71c1c" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="22" cy="46" rx="8" ry="2" fill="rgba(0,0,0,0.2)" />
      {/* Jersey body */}
      <path d="M10 11 L16 5 L22 3 L28 5 L34 11 L38 15 L34 17.5 L32 13 L32 42 L12 42 L12 13 L10 17.5 L6 15 Z"
        fill={`url(#jg-${player.id}-${size})`} />
      {/* Black stripes */}
      <g clipPath={`url(#jc-${player.id}-${size})`}>
        <rect x="10" y="0" width="5" height="48" fill="#1a1a1a" opacity="0.8" />
        <rect x="19" y="0" width="5" height="48" fill="#1a1a1a" opacity="0.8" />
        <rect x="28" y="0" width="5" height="48" fill="#1a1a1a" opacity="0.8" />
      </g>
      {/* Collar */}
      <path d="M19 4 L22 3 L25 4 L24 6 L20 6 Z" fill="#111" opacity="0.5" />
      {/* Number */}
      <text x="22" y="30" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
        {player.number || ''}
      </text>
    </svg>
  )

  if (size === 'pitch') {
    return (
      <div ref={setNodeRef} {...listeners} {...attributes} style={{ ...style, flexDirection: 'column', alignItems: 'center' }}>
        <Jersey w={40} h={44} />
        <span style={{
          fontSize: 8, fontWeight: 700, textAlign: 'center',
          maxWidth: 80, color: '#fff',
          textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.5)',
          marginTop: 2, lineHeight: 1.2, wordBreak: 'break-word',
        }}>
          {player.shirtName || player.name.split(' ').pop()}
        </span>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <Jersey w={26} h={28} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#eee' }}>{player.shirtName || player.name}</span>
        <span style={{ fontSize: 10, color: '#555' }}>#{player.number} · {player.position}</span>
      </div>
    </div>
  )
}
