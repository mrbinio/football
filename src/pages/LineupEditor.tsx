import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { Player, Lineup } from '../types'
import { formations } from '../formations'
import { useParams } from 'react-router-dom'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import Pitch from '../components/Pitch'
import BenchArea from '../components/BenchArea'
import PlayerJersey from '../components/PlayerJersey'
import { toPng } from 'html-to-image'

export default function LineupEditor() {
  const { id } = useParams()
  const [players, setPlayers] = useState<Player[]>([])
  const [formation, setFormation] = useState(formations[0])
  const [positions, setPositions] = useState<Record<string, string>>({})
  const [bench, setBench] = useState<string[]>([])
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0])
  const [opponent, setOpponent] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const pitchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return onSnapshot(collection(db, 'players'), (snap) => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Player)))
    })
  }, [])

  useEffect(() => {
    if (!id) return
    return onSnapshot(doc(db, 'lineups', id), (snap) => {
      if (!snap.exists()) return
      const data = snap.data() as Omit<Lineup, 'id'>
      setPositions(data.positions || {})
      setBench(data.bench || [])
      setMatchDate(data.matchDate)
      setOpponent(data.opponent)
      const f = formations.find(fm => fm.name === data.formation)
      if (f) setFormation(f)
    })
  }, [id])

  const assignedPlayerIds = [...Object.values(positions), ...bench]
  const availablePlayers = players.filter(p => !assignedPlayerIds.includes(p.id))

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const playerId = active.id as string
    const target = over.id as string

    const newPositions = { ...positions }
    Object.keys(newPositions).forEach(key => {
      if (newPositions[key] === playerId) delete newPositions[key]
    })
    const newBench = bench.filter(bId => bId !== playerId)

    if (target === 'bench') {
      newBench.push(playerId)
    } else if (target === 'available') {
      // dropped back
    } else {
      const existing = newPositions[target]
      if (existing) {
        const prevPos = Object.keys(positions).find(k => positions[k] === playerId)
        if (prevPos) newPositions[prevPos] = existing
        else newBench.push(existing)
      }
      newPositions[target] = playerId
    }

    setPositions(newPositions)
    setBench(newBench)
  }

  const handleSave = async () => {
    setSaving(true)
    const data = {
      matchDate,
      opponent,
      formation: formation.name,
      positions,
      bench,
      createdBy: auth.currentUser?.email || '',
      createdAt: Date.now(),
    }
    if (id) {
      await updateDoc(doc(db, 'lineups', id), data)
    } else {
      await addDoc(collection(db, 'lineups'), data)
    }
    setSaving(false)
    alert('Lineup saved!')
  }

  const handleShare = async () => {
    if (!pitchRef.current) return
    try {
      const dataUrl = await toPng(pitchRef.current, { backgroundColor: '#0f0f0f', pixelRatio: 2 })

      // Always download the image
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `lineup-vs-${opponent || 'TBD'}-${matchDate}.png`
      a.click()

      // Open WhatsApp with message
      const text = `Lineup vs ${opponent || 'TBD'} (${matchDate})`
      window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')

      alert('Image downloaded! Attach it in the WhatsApp chat that just opened.')
    } catch (err) {
      console.error(err)
    }
  }

  const activePlayer = players.find(p => p.id === activeId)

  return (
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto' }}>
      {/* Top controls */}
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center',
        background: '#141414', padding: 16, borderRadius: 12, border: '1px solid #2a2a2a',
      }}>
        <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
        <input placeholder="Opponent" value={opponent} onChange={e => setOpponent(e.target.value)} style={{ width: 140 }} />
        <select value={formation.name} onChange={e => setFormation(formations.find(f => f.name === e.target.value)!)}>
          {formations.map(f => <option key={f.name}>{f.name}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={handleSave} disabled={saving} style={{ background: '#d32f2f', color: '#fff' }}>
          {saving ? 'Saving...' : '💾 Save Lineup'}
        </button>
        <button onClick={handleShare} style={{ background: '#25D366', color: '#fff' }}>
          📱 WhatsApp
        </button>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Pitch */}
          <div ref={pitchRef} style={{ flex: 1, minWidth: 300 }}>
            <Pitch formation={formation} positions={positions} players={players} />
          </div>

          {/* Sidebar */}
          <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 13, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Bench</h3>
              <BenchArea bench={bench} players={players} />
            </div>

            <div>
              <h3 style={{ fontSize: 13, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Available ({availablePlayers.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 400, overflowY: 'auto' }}>
                {availablePlayers.map(p => (
                  <PlayerJersey key={p.id} player={p} size="small" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activePlayer ? <PlayerJersey player={activePlayer} size="small" /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
