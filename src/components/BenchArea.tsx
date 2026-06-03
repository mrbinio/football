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
        padding: 8,
        borderRadius: 8,
        background: isOver ? 'rgba(76,175,80,0.2)' : '#0f3460',
        border: '2px dashed #333',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {bench.length === 0 && <span style={{ fontSize: 12, color: '#666' }}>Drop players here</span>}
      {bench.map(id => {
        const p = players.find(pl => pl.id === id)
        return p ? <PlayerJersey key={p.id} player={p} size="small" /> : null
      })}
    </div>
  )
}
