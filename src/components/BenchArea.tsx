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
        minHeight: 50,
        padding: 10,
        borderRadius: 12,
        background: isOver ? 'rgba(211, 47, 47, 0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px dashed ${isOver ? '#d32f2f' : 'rgba(255,255,255,0.1)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        transition: 'all 0.2s',
      }}
    >
      {bench.length === 0 && <span style={{ fontSize: 11, color: '#444', textAlign: 'center', padding: 8 }}>Drop here</span>}
      {bench.map(id => {
        const p = players.find(pl => pl.id === id)
        return p ? <PlayerJersey key={p.id} player={p} size="small" /> : null
      })}
    </div>
  )
}
