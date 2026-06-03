import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { Player, Lineup } from '../types'
import { formations, GameFormat } from '../formations'
import { useParams } from 'react-router-dom'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import Pitch from '../components/Pitch'
import BenchArea from '../components/BenchArea'
import PlayerJersey from '../components/PlayerJersey'
import { getCoachName } from '../coaches'
import { toPng } from 'html-to-image'

export default function LineupEditor() {
  const { id } = useParams()
  const [players, setPlayers] = useState<Player[]>([])
  const [gameFormat, setGameFormat] = useState<GameFormat>('7v7')
  const [formation, setFormation] = useState(formations['7v7'][0])
  const [positions, setPositions] = useState<Record<string, string>>({})
  const [bench, setBench] = useState<string[]>([])
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0])
  const [opponent, setOpponent] = useState('')
  const [title, setTitle] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const pitchRef = useRef<HTMLDivElement>(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  const sensors = useSensors(mouseSensor)

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
      if (data.title) setTitle(data.title)
      const f = [...formations['7v7'], ...formations['5v5']].find(fm => fm.name === data.formation)
      if (f) {
        setFormation(f)
        setGameFormat(formations['5v5'].some(ff => ff.name === f.name) ? '5v5' : '7v7')
      }
    })
  }, [id])

  const assignedPlayerIds = [...Object.values(positions), ...bench]
  const availablePlayers = players.filter(p => !assignedPlayerIds.includes(p.id))

  // --- Mobile: tap to assign ---
  const handlePlayerTap = (playerId: string) => {
    if (!isMobile) return
    setSelectedPlayer(prev => prev === playerId ? null : playerId)
  }

  const handlePositionTap = (posKey: string) => {
    if (!isMobile) return

    if (selectedPlayer) {
      // Assign selected player to this position
      const newPositions = { ...positions }
      // Remove player from old position
      Object.keys(newPositions).forEach(key => {
        if (newPositions[key] === selectedPlayer) delete newPositions[key]
      })
      const newBench = bench.filter(bId => bId !== selectedPlayer)

      // Swap if occupied
      const existing = newPositions[posKey]
      if (existing) {
        const prevPos = Object.keys(positions).find(k => positions[k] === selectedPlayer)
        if (prevPos) newPositions[prevPos] = existing
        else newBench.push(existing)
      }
      newPositions[posKey] = selectedPlayer
      setPositions(newPositions)
      setBench(newBench)
      setSelectedPlayer(null)
    } else {
      // Tap on occupied position -> select that player to move
      const playerId = positions[posKey]
      if (playerId) setSelectedPlayer(playerId)
    }
  }

  const handleRemoveFromPosition = (playerId: string) => {
    if (!isMobile) return
    const newPositions = { ...positions }
    Object.keys(newPositions).forEach(key => {
      if (newPositions[key] === playerId) delete newPositions[key]
    })
    setPositions(newPositions)
    setBench(bench.filter(b => b !== playerId))
    setSelectedPlayer(null)
  }

  // --- Desktop: drag & drop ---
  const handleDragStart = (event: DragStartEvent) => { setActiveId(event.active.id as string) }
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
    } else if (target !== 'available') {
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
      matchDate, opponent, title, formation: formation.name,
      positions, bench,
      createdBy: auth.currentUser?.email || '',
      createdByName: getCoachName(auth.currentUser?.email || ''),
      createdAt: Date.now(),
    }
    if (id) await updateDoc(doc(db, 'lineups', id), data)
    else await addDoc(collection(db, 'lineups'), data)
    setSaving(false)
    alert('Lineup saved!')
  }

  const handleShare = async () => {
    if (!pitchRef.current) return
    try {
      // Pre-load all images as base64 for screenshot
      const images = pitchRef.current.querySelectorAll('img') as NodeListOf<HTMLImageElement>
      const saved: { el: HTMLImageElement; original: string }[] = []

      for (const img of images) {
        if (img.src && img.src.includes('firebasestorage')) {
          try {
            const res = await fetch(img.src)
            const blob = await res.blob()
            const b64 = await new Promise<string>((resolve) => {
              const r = new FileReader()
              r.onloadend = () => resolve(r.result as string)
              r.readAsDataURL(blob)
            })
            saved.push({ el: img, original: img.src })
            img.src = b64
          } catch (_e) { /* skip */ }
        }
      }

      // Small delay to let images render
      await new Promise(r => setTimeout(r, 100))

      const dataUrl = await toPng(pitchRef.current, {
        backgroundColor: '#111',
        pixelRatio: 2,
      })

      // Restore original src
      saved.forEach(({ el, original }) => { el.src = original })

      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `lineup-${matchDate}.png`, { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ text: `Lineup vs ${opponent || 'TBD'} (${matchDate})`, files: [file] })
      } else {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `lineup-vs-${opponent || 'TBD'}-${matchDate}.png`
        a.click()
        window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(`Lineup vs ${opponent || 'TBD'} (${matchDate})`)}`, '_blank')
      }
    } catch (err) {
      console.error('Share error:', err)
      alert('Could not generate image.')
    }
  }

  const activePlayer = players.find(p => p.id === activeId)

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div style={{ padding: '16px', paddingBottom: 80, maxWidth: 500, margin: '0 auto' }}>
        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
          <input placeholder="Opponent" value={opponent} onChange={e => setOpponent(e.target.value)} style={{ flex: 1, minWidth: 100 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input placeholder="Title (e.g. Cup Round 2)" value={title} onChange={e => setTitle(e.target.value)} style={{ flex: 1 }} />
          <select value={gameFormat} onChange={e => { const f = e.target.value as GameFormat; setGameFormat(f); setFormation(formations[f][0]); setPositions({}) }} style={{ width: 60 }}>
            <option value="7v7">7v7</option>
            <option value="5v5">5v5</option>
          </select>
          <select value={formation.name} onChange={e => setFormation(formations[gameFormat].find(f => f.name === e.target.value)!)} style={{ width: 80 }}>
            {formations[gameFormat].map(f => <option key={f.name}>{f.name}</option>)}
          </select>
        </div>

        {/* Selected player indicator */}
        {selectedPlayer && (
          <div style={{
            background: 'rgba(211,47,47,0.15)', border: '1px solid rgba(211,47,47,0.3)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, color: '#eee' }}>
              Tap a position for: <strong>{players.find(p => p.id === selectedPlayer)?.shirtName}</strong>
            </span>
            <button onClick={() => setSelectedPlayer(null)} style={{ background: '#333', color: '#fff', padding: '4px 10px', fontSize: 11 }}>Cancel</button>
          </div>
        )}

        {/* Pitch - full width */}
        <div ref={pitchRef}>
          <Pitch
            formation={formation} positions={positions} players={players}
            onPositionTap={handlePositionTap} selectedPlayer={selectedPlayer}
          />
        </div>

        {/* Players list below pitch */}
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 11, color: '#666', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Available ({availablePlayers.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
            {availablePlayers.map(p => (
              <div
                key={p.id}
                onClick={() => handlePlayerTap(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 10,
                  background: selectedPlayer === p.id ? 'rgba(211,47,47,0.15)' : 'rgba(255,255,255,0.03)',
                  border: selectedPlayer === p.id ? '1px solid #d32f2f' : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>{p.number || '-'}</div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#eee', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.shirtName}</div>
                  <div style={{ fontSize: 9, color: '#555' }}>{p.position}</div>
                </div>
              </div>
            ))}
          </div>

          {bench.length > 0 && (
            <>
              <h3 style={{ fontSize: 11, color: '#666', marginTop: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>Bench</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
                {bench.map(bId => {
                  const p = players.find(pl => pl.id === bId)
                  if (!p) return null
                  return (
                    <div key={p.id} onClick={() => handlePlayerTap(p.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 10,
                      background: selectedPlayer === p.id ? 'rgba(211,47,47,0.15)' : 'rgba(255,255,255,0.03)',
                      border: selectedPlayer === p.id ? '1px solid #d32f2f' : '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #555, #333)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>{p.number || '-'}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#eee' }}>{p.shirtName}</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* On-pitch players — tap to remove */}
          {Object.values(positions).length > 0 && (
            <>
              <h3 style={{ fontSize: 11, color: '#666', marginTop: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>On pitch (tap to move)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
                {Object.entries(positions).map(([posKey, pId]) => {
                  const p = players.find(pl => pl.id === pId)
                  if (!p) return null
                  const posLabel = formation.positions.find(fp => fp.key === posKey)?.label || posKey
                  return (
                    <div key={pId} onClick={() => handleRemoveFromPosition(pId)} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 10,
                      background: 'rgba(30,120,50,0.1)', border: '1px solid rgba(30,120,50,0.2)',
                      cursor: 'pointer',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>{posLabel}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#eee' }}>{p.shirtName}</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Floating action bar */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          display: 'flex', gap: 10, padding: '12px 16px',
          background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          zIndex: 100,
        }}>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg, #d32f2f, #b71c1c)', color: '#fff' }}>
            {saving ? 'Saving...' : '💾 Save Lineup'}
          </button>
          <button onClick={handleShare} style={{ flex: 1, background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' }}>
            📱 Share WhatsApp
          </button>
        </div>
      </div>
    )
  }
  return (
    <div style={{ padding: '20px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center',
        background: 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)',
        padding: '16px 20px', borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
        <input placeholder="Opponent" value={opponent} onChange={e => setOpponent(e.target.value)} style={{ width: 140 }} />
        <input placeholder="Title (e.g. Cup Round 2)" value={title} onChange={e => setTitle(e.target.value)} style={{ width: 160 }} />
        <select value={gameFormat} onChange={e => { const f = e.target.value as GameFormat; setGameFormat(f); setFormation(formations[f][0]); setPositions({}) }} style={{ width: 70 }}>
          <option value="7v7">7v7</option>
          <option value="5v5">5v5</option>
        </select>
        <select value={formation.name} onChange={e => setFormation(formations[gameFormat].find(f => f.name === e.target.value)!)}>
          {formations[gameFormat].map(f => <option key={f.name}>{f.name}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(135deg, #d32f2f, #b71c1c)', color: '#fff', boxShadow: '0 2px 10px rgba(211,47,47,0.3)' }}>
          {saving ? 'Saving...' : '💾 Save'}
        </button>
        <button onClick={handleShare} style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', boxShadow: '0 2px 10px rgba(37,211,102,0.3)' }}>
          📱 Share
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div ref={pitchRef} style={{ flex: 1, minWidth: 300 }}>
            <Pitch formation={formation} positions={positions} players={players} />
          </div>
          <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>
            <div style={{ background: 'linear-gradient(135deg, #141414, #1a1a1a)', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 11, color: '#666', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Bench</h3>
              <BenchArea bench={bench} players={players} />
            </div>
            <div style={{ background: 'linear-gradient(135deg, #141414, #1a1a1a)', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 11, color: '#666', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Available ({availablePlayers.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 380, overflowY: 'auto' }}>
                {availablePlayers.map(p => (<PlayerJersey key={p.id} player={p} size="small" />))}
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
