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
    <div style={{ position: 'relative', width: '100%', paddingBottom: '140%', background: '#2e7d32', borderRadius: 12, overflow: 'hidden' }}>
      {/* Pitch markings */}
      <svg viewBox="0 0 100 140" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <rect x="0" y="0" width="100" height="140" fill="#388E3C" />
        <rect x="2" y="2" width="96" height="136" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
        <line x1="2" y1="70" x2="98" y2="70" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
        <circle cx="50" cy="70" r="12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
        {/* Penalty areas */}
        <rect x="25" y="2" width="50" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
        <rect x="25" y="118" width="50" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
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
        borderRadius: 8,
        padding: 4,
        background: isOver ? 'rgba(255,255,255,0.2)' : 'transparent',
        transition: 'background 0.15s',
        minWidth: 50,
      }}
    >
      {player ? (
        <PlayerJersey player={player} size="pitch" />
      ) : (
        <div style={{ width: 36, height: 40, border: '2px dashed rgba(255,255,255,0.4)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
          {label}
        </div>
      )}
    </div>
  )
}
