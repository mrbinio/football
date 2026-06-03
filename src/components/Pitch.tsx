import { useDroppable } from '@dnd-kit/core'
import { Formation, Player } from '../types'
import PlayerJersey from './PlayerJersey'

interface Props {
  formation: Formation
  positions: Record<string, string>
  players: Player[]
}

export default function Pitch({ formation, positions, players }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', paddingBottom: '135%',
      borderRadius: 18, overflow: 'hidden',
      background: 'linear-gradient(180deg, #1a6b2a 0%, #228B35 20%, #25a03a 50%, #228B35 80%, #1a6b2a 100%)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Mowed grass stripes */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0,
            top: `${i * 10}%`, height: '5%',
            background: i % 2 === 0 ? '#fff' : 'transparent',
          }} />
        ))}
      </div>

      {/* Pitch markings */}
      <svg viewBox="0 0 100 135" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        {/* Border */}
        <rect x="5" y="5" width="90" height="125" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" />
        {/* Halfway */}
        <line x1="5" y1="67.5" x2="95" y2="67.5" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" />
        {/* Center circle */}
        <circle cx="50" cy="67.5" r="10" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" />
        <circle cx="50" cy="67.5" r="0.8" fill="rgba(255,255,255,0.5)" />
        {/* Top penalty area */}
        <rect x="25" y="5" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" />
        <rect x="35" y="5" width="30" height="8" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.3" />
        <path d="M 36 23 A 9 9 0 0 0 64 23" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.3" />
        {/* Bottom penalty area */}
        <rect x="25" y="112" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" />
        <rect x="35" y="122" width="30" height="8" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.3" />
        <path d="M 36 112 A 9 9 0 0 1 64 112" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.3" />
        {/* Corner arcs */}
        <path d="M 5 8 A 3 3 0 0 0 8 5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
        <path d="M 92 5 A 3 3 0 0 0 95 8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
        <path d="M 5 127 A 3 3 0 0 1 8 130" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
        <path d="M 92 130 A 3 3 0 0 1 95 127" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
      </svg>

      {/* Position slots */}
      {formation.positions.map(pos => (
        <PositionSlot
          key={pos.key}
          posKey={pos.key}
          label={pos.label}
          x={pos.x}
          y={pos.y}
          player={players.find(p => p.id === positions[pos.key])}
        />
      ))}
    </div>
  )
}

function PositionSlot({ posKey, label, x, y, player }: { posKey: string; label: string; x: number; y: number; player?: Player }) {
  const { setNodeRef, isOver } = useDroppable({ id: posKey })

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${(y / 1.35)}%`,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 14,
        padding: 6,
        background: isOver ? 'rgba(255,255,255,0.12)' : 'transparent',
        border: isOver ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
        transition: 'all 0.2s ease',
        minWidth: 56,
      }}
    >
      {player ? (
        <PlayerJersey player={player} size="pitch" />
      ) : (
        <div style={{
          width: 42, height: 46,
          border: '2px dashed rgba(255,255,255,0.25)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600,
          background: 'rgba(0,0,0,0.1)',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}
