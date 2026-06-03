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
      position: 'relative', width: '100%', paddingBottom: '140%',
      borderRadius: 16, overflow: 'hidden',
      background: 'linear-gradient(180deg, #1b5e20 0%, #2e7d32 30%, #388E3C 50%, #2e7d32 70%, #1b5e20 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 0 60px rgba(0,0,0,0.2)',
    }}>
      {/* Pitch markings */}
      <svg viewBox="0 0 100 140" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        {/* Field stripes */}
        <rect x="0" y="0" width="100" height="20" fill="rgba(0,0,0,0.03)" />
        <rect x="0" y="40" width="100" height="20" fill="rgba(0,0,0,0.03)" />
        <rect x="0" y="80" width="100" height="20" fill="rgba(0,0,0,0.03)" />
        <rect x="0" y="120" width="100" height="20" fill="rgba(0,0,0,0.03)" />
        {/* Border */}
        <rect x="4" y="4" width="92" height="132" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" rx="1" />
        {/* Halfway line */}
        <line x1="4" y1="70" x2="96" y2="70" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
        {/* Center circle */}
        <circle cx="50" cy="70" r="12" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
        <circle cx="50" cy="70" r="1" fill="rgba(255,255,255,0.5)" />
        {/* Penalty areas */}
        <rect x="28" y="4" width="44" height="18" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" rx="0.5" />
        <rect x="28" y="118" width="44" height="18" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" rx="0.5" />
        {/* Goal areas */}
        <rect x="36" y="4" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.3" rx="0.5" />
        <rect x="36" y="128" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.3" rx="0.5" />
        {/* Penalty arcs */}
        <path d="M 38 22 A 10 10 0 0 0 62 22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.3" />
        <path d="M 38 118 A 10 10 0 0 1 62 118" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.3" />
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
        top: `${y / 1.4}%`,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 12,
        padding: 6,
        background: isOver ? 'rgba(255,255,255,0.15)' : 'transparent',
        transition: 'background 0.2s, transform 0.2s',
        minWidth: 54,
      }}
    >
      {player ? (
        <PlayerJersey player={player} size="pitch" />
      ) : (
        <div style={{
          width: 40, height: 44,
          border: '2px dashed rgba(255,255,255,0.3)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600,
        }}>
          {label}
        </div>
      )}
    </div>
  )
}
