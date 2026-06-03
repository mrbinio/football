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
    background: size === 'small' ? '#0f3460' : 'transparent',
    borderRadius: 6,
    userSelect: 'none',
    touchAction: 'none',
  }

  if (size === 'pitch') {
    return (
      <div ref={setNodeRef} {...listeners} {...attributes} style={{ ...style, flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 36, height: 40 }}>
          <svg viewBox="0 0 40 44" width="36" height="40">
            <path d="M8 8 L20 2 L32 8 L34 30 L28 38 L12 38 L6 30 Z" fill="#1565C0" stroke="#fff" strokeWidth="1.5" />
            <text x="20" y="26" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">{player.number}</text>
          </svg>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {player.name.split(' ').pop()}
        </span>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
        {player.number}
      </div>
      <span style={{ fontSize: 13 }}>{player.name}</span>
    </div>
  )
}
