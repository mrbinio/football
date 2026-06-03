import { useDroppable } from '@dnd-kit/core'
import { Player } from '../types'
import PlayerJersey from './PlayerJersey'

interface Props {
  bench: string[]
  players: Player[]
}

export default function BenchArea({ bench, players }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bench' })

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 60,
        padding: 10,
        borderRadius: 12,
        background: isOver ? 'rgba(211, 47, 47, 0.1)' : '#1a1a1a',
        border: `1px solid ${isOver ? '#d32f2f' : '#2a2a2a'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        transition: 'all 0.2s',
      }}
    >
      {bench.length === 0 && <span style={{ fontSize: 12, color: '#555', textAlign: 'center', padding: 8 }}>Drop players here</span>}
      {bench.map(id => {
        const p = players.find(pl => pl.id === id)
        return p ? <PlayerJersey key={p.id} player={p} size="small" /> : null
      })}
    </div>
  )
}
