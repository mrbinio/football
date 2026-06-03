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
      const f = formations.find(f => f.name === data.formation)
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

    // Remove from previous position
    const newPositions = { ...positions }
    Object.keys(newPositions).forEach(key => {
      if (newPositions[key] === playerId) delete newPositions[key]
    })
    const newBench = bench.filter(id => id !== playerId)

    if (target === 'bench') {
      newBench.push(playerId)
    } else if (target === 'available') {
      // Dropped back to available — just remove
    } else {
      // Dropped on a pitch position — swap if occupied
      const existing = newPositions[target]
      if (existing) {
        // Find where dragged player was
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
      const dataUrl = await toPng(pitchRef.current, { backgroundColor: '#1a1a2e' })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `lineup-${matchDate}.png`, { type: 'image/png' })

      if (navigator.share) {
        await navigator.share({ text: `Lineup vs ${opponent} (${matchDate})`, files: [file] })
      } else {
        // Fallback: open WhatsApp with text
        const url = `https://wa.me/?text=${encodeURIComponent(`Lineup vs ${opponent} (${matchDate})`)}`
        window.open(url, '_blank')
        // Also download image
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `lineup-${matchDate}.png`
        a.click()
      }
    } catch (err) {
      console.error(err)
      alert('Could not share. Try downloading the image.')
    }
  }

  const activePlayer = players.find(p => p.id === activeId)

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
        <input placeholder="Opponent" value={opponent} onChange={e => setOpponent(e.target.value)} style={{ width: 150 }} />
        <select value={formation.name} onChange={e => setFormation(formations.find(f => f.name === e.target.value)!)}>
          {formations.map(f => <option key={f.name}>{f.name}</option>)}
        </select>
        <button onClick={handleSave} disabled={saving} style={{ background: '#4CAF50', color: '#fff' }}>
          {saving ? 'Saving...' : '💾 Save'}
        </button>
        <button onClick={handleShare} style={{ background: '#25D366', color: '#fff' }}>
          📱 Share WhatsApp
        </button>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div ref={pitchRef} style={{ flex: 1, minWidth: 320 }}>
            <Pitch formation={formation} positions={positions} players={players} />
          </div>

          <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3>Bench</h3>
            <BenchArea bench={bench} players={players} />

            <h3 style={{ marginTop: 12 }}>Available</h3>
            <div id="available" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {availablePlayers.map(p => (
                <PlayerJersey key={p.id} player={p} size="small" />
              ))}
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
