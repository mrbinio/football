import { useDroppable } from '@dnd-kit/core'
import { Formation, Player } from '../types'
import PlayerJersey from './PlayerJersey'

interface Props {
  formation: Formation
  positions: Record<string, string>
  players: Player[]
  onPositionTap?: (posKey: string) => void
  selectedPlayer?: string | null
}

export default function Pitch({ formation, positions, players, onPositionTap, selectedPlayer }: Props) {
  return (
    <div>
      <div style={{
        position: 'relative', width: '100%', paddingBottom: '140%',
        borderRadius: 18, overflow: 'hidden',
        background: 'linear-gradient(180deg, #15572a 0%, #1d7a36 25%, #22913e 50%, #1d7a36 75%, #15572a 100%)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Mowed grass effect */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {[...Array(14)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: 0, right: 0,
              top: `${i * 7.14}%`, height: '3.57%',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)',
            }} />
          ))}
        </div>

        {/* Center logo watermark */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.12, pointerEvents: 'none',
        }}>
          <img src="/bp-logo.jpg" alt="" style={{ width: 120, height: 'auto', borderRadius: 10 }} />
        </div>

        {/* Vignette overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.25) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Pitch markings */}
        <svg viewBox="0 0 100 140" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
          <rect x="5" y="5" width="90" height="130" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.35" rx="0.5" />
          <line x1="5" y1="70" x2="95" y2="70" stroke="rgba(255,255,255,0.45)" strokeWidth="0.35" />
          <circle cx="50" cy="70" r="12" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.35" />
          <circle cx="50" cy="70" r="0.8" fill="rgba(255,255,255,0.5)" />
          {/* Top penalty area */}
          <rect x="25" y="5" width="50" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.35" />
          <rect x="35" y="5" width="30" height="9" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          <path d="M 36 25 A 10 10 0 0 0 64 25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          <circle cx="50" cy="17" r="0.6" fill="rgba(255,255,255,0.4)" />
          {/* Bottom penalty area */}
          <rect x="25" y="115" width="50" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.35" />
          <rect x="35" y="126" width="30" height="9" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          <path d="M 36 115 A 10 10 0 0 1 64 115" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          <circle cx="50" cy="123" r="0.6" fill="rgba(255,255,255,0.4)" />
          {/* Corner arcs */}
          <path d="M 5 8 A 3 3 0 0 0 8 5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          <path d="M 92 5 A 3 3 0 0 0 95 8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          <path d="M 5 132 A 3 3 0 0 1 8 135" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          <path d="M 92 135 A 3 3 0 0 1 95 132" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
        </svg>

        {formation.positions.map(pos => (
          <PositionSlot
            key={pos.key}
            posKey={pos.key}
            label={pos.label}
            x={pos.x}
            y={pos.y}
            player={players.find(p => p.id === positions[pos.key])}
            onTap={onPositionTap}
            isTarget={!!selectedPlayer && !positions[pos.key]}
          />
        ))}
      </div>
    </div>
  )
}

function PositionSlot({ posKey, label, x, y, player, onTap, isTarget }: {
  posKey: string; label: string; x: number; y: number; player?: Player
  onTap?: (posKey: string) => void; isTarget?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: posKey })
  const handleClick = () => { if (onTap) onTap(posKey) }

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${(y / 1.4)}%`,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 14,
        padding: 6,
        background: isOver ? 'rgba(255,255,255,0.12)' : isTarget ? 'rgba(211,47,47,0.12)' : 'transparent',
        border: isOver ? '1px solid rgba(255,255,255,0.25)' : isTarget ? '1px solid rgba(211,47,47,0.4)' : '1px solid transparent',
        transition: 'all 0.2s ease',
        minWidth: 54,
        cursor: onTap ? 'pointer' : 'default',
      }}
    >
      {player ? (
        <PlayerJersey player={player} size="pitch" />
      ) : (
        <div style={{
          width: 42, height: 46,
          border: `2px dashed ${isTarget ? 'rgba(211,47,47,0.5)' : 'rgba(255,255,255,0.2)'}`,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: isTarget ? 'rgba(211,47,47,0.8)' : 'rgba(255,255,255,0.35)', fontWeight: 600,
          background: 'rgba(0,0,0,0.1)',
          animation: isTarget ? 'pulse 1.5s infinite' : 'none',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}
