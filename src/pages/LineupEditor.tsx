import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { Player, Lineup } from '../types'
import { formations } from '../formations'
import { useParams } from 'react-router-dom'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
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

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  })
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  })
  const sensors = useSensors(mouseSensor, touchSensor)

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
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `lineup-${matchDate}.png`, { type: 'image/png' })

      // Mobile: use native share with file
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          text: `Lineup vs ${opponent || 'TBD'} (${matchDate})`,
          files: [file],
        })
      } else {
        // Desktop: download + open WhatsApp Web
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `lineup-vs-${opponent || 'TBD'}-${matchDate}.png`
        a.click()
        window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(`Lineup vs ${opponent || 'TBD'} (${matchDate})`)}`, '_blank')
        alert('Image downloaded! Attach it in the WhatsApp chat.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const activePlayer = players.find(p => p.id === activeId)

  return (
    <div style={{ padding: '20px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center',
        background: 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)',
        padding: '16px 20px', borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
        <input placeholder="Opponent" value={opponent} onChange={e => setOpponent(e.target.value)} style={{ width: 140 }} />
        <select value={formation.name} onChange={e => setFormation(formations.find(f => f.name === e.target.value)!)}>
          {formations.map(f => <option key={f.name}>{f.name}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={handleSave} disabled={saving} style={{
          background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
          color: '#fff', boxShadow: '0 2px 10px rgba(211,47,47,0.3)',
        }}>
          {saving ? 'Saving...' : '💾 Save'}
        </button>
        <button onClick={handleShare} style={{
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          color: '#fff', boxShadow: '0 2px 10px rgba(37,211,102,0.3)',
        }}>
          📱 Share
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Pitch */}
          <div ref={pitchRef} style={{ flex: 1, minWidth: 300 }}>
            <Pitch formation={formation} positions={positions} players={players} />
          </div>

          {/* Sidebar */}
          <div style={{
            width: 220, display: 'flex', flexDirection: 'column', gap: 16,
            position: 'sticky', top: 80,
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #141414, #1a1a1a)',
              borderRadius: 14, padding: 14,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <h3 style={{ fontSize: 11, color: '#666', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Bench</h3>
              <BenchArea bench={bench} players={players} />
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #141414, #1a1a1a)',
              borderRadius: 14, padding: 14,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <h3 style={{ fontSize: 11, color: '#666', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
                Available ({availablePlayers.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 380, overflowY: 'auto' }}>
                {availablePlayers.map(p => (
                  <PlayerJersey key={p.id} player={p} size="small" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activePlayer ? <PlayerJersey player={activePlayer} size="small" /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
