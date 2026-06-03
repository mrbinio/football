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
import html2canvas from 'html2canvas'

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
  const [nextIn, setNextIn] = useState<string[]>([])
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
      const canvas = await html2canvas(pitchRef.current, {
        backgroundColor: '#111',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })
      const dataUrl = canvas.toDataURL('image/png')
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

  const handleShareSquad = async () => {
    const calledUp = players.filter(p => calledUpIds.includes(p.id)).sort((a, b) => a.number - b.number)
    if (calledUp.length === 0) { alert('No players selected'); return }
    const coachName = getCoachName(auth.currentUser?.email || '')

    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    container.style.zIndex = '9999'
    container.style.pointerEvents = 'none'
    container.style.opacity = '0.01'
    document.body.appendChild(container)

    container.innerHTML = `
      <div id="squad-capture" style="width:400px;padding:24px;border-radius:16px;background:linear-gradient(160deg,#1a0a0a 0%,#0f0f0f 50%,#1a0a0a 100%);border:1px solid rgba(211,47,47,0.3);font-family:Inter,sans-serif;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#d32f2f,#b71c1c);padding:6px 16px;border-radius:20px;margin-bottom:12px;">
            <span style="font-size:11px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;">Matchday Squad</span>
          </div>
          <h2 style="font-size:18px;font-weight:700;color:#fff;margin:8px 0 4px;">${title || `vs ${opponent || 'TBD'}`}</h2>
          <p style="font-size:12px;color:#888;margin:0;">${matchDate}</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px;">
          ${calledUp.map(p => `
            <div style="display:flex;flex-direction:column;align-items:center;padding:10px 4px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);">
              ${p.photoURL
                ? `<img src="${p.photoURL}" crossorigin="anonymous" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(211,47,47,0.4);margin-bottom:6px;" />`
                : `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#d32f2f,#b71c1c);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;margin-bottom:6px;">${p.number}</div>`
              }
              <span style="font-size:10px;font-weight:600;color:#eee;text-align:center;">${p.shirtName || p.name.split(' ').pop()}</span>
              <span style="font-size:9px;color:#666;">#${p.number}</span>
            </div>
          `).join('')}
        </div>
        <div style="text-align:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">
          <p style="font-size:10px;color:#666;margin:0;">Coach: ${coachName}</p>
          <p style="font-size:9px;color:#444;margin-top:4px;">BP · BrommaPojkarna P18-8</p>
        </div>
      </div>
    `

    try {
      // Wait for images to load
      const imgs = container.querySelectorAll('img')
      await Promise.all(Array.from(imgs).map(img => new Promise(r => { img.onload = r; img.onerror = r; if (img.complete) r(null) })))
      await new Promise(r => setTimeout(r, 300))

      const target = container.querySelector('#squad-capture') as HTMLElement
      const canvas = await html2canvas(target, {
        backgroundColor: '#0f0f0f',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })
      document.body.removeChild(container)

      const dataUrl = canvas.toDataURL('image/png')
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `squad-${matchDate}.png`, { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ text: `Squad vs ${opponent || 'TBD'} (${matchDate})`, files: [file] })
      } else {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `squad-vs-${opponent || 'TBD'}-${matchDate}.png`
        a.click()
        window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(`Squad vs ${opponent || 'TBD'} (${matchDate})`)}`, '_blank')
      }
    } catch (err) {
      console.error('Share squad error:', err)
      document.body.removeChild(container)
      alert('Could not generate squad image.')
    }
  }

  const calledUpIds = [...Object.values(positions), ...bench]
  const activePlayer = players.find(p => p.id === activeId)

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div style={{ padding: '16px', paddingBottom: 140, maxWidth: 500, margin: '0 auto' }}>
        {/* Controls */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', borderRadius: 14,
          padding: 12, marginBottom: 14, border: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} style={{ flex: 1, minWidth: 110 }} />
            <input placeholder="Opponent" value={opponent} onChange={e => setOpponent(e.target.value)} style={{ flex: 1, minWidth: 90 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Title (e.g. Cup Round 2)" value={title} onChange={e => setTitle(e.target.value)} style={{ flex: 1 }} />
            <select value={gameFormat} onChange={e => { const f = e.target.value as GameFormat; setGameFormat(f); setFormation(formations[f][0]); setPositions({}) }} style={{ width: 56 }}>
              <option value="7v7">7v7</option>
              <option value="5v5">5v5</option>
            </select>
            <select value={formation.name} onChange={e => setFormation(formations[gameFormat].find(f => f.name === e.target.value)!)} style={{ width: 76 }}>
              {formations[gameFormat].map(f => <option key={f.name}>{f.name}</option>)}
            </select>
          </div>
        </div>

        {/* Pitch - full width */}
        <div ref={pitchRef}>
          <Pitch
            formation={formation} positions={positions} players={players}
            onPositionTap={handlePositionTap} selectedPlayer={selectedPlayer}
          />
          {bench.length > 0 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: 12 }}>
              {bench.map(bId => {
                const p = players.find(pl => pl.id === bId)
                if (!p) return null
                const isNext = nextIn.includes(p.id)
                return (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}>
                    {isNext && <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 10, color: '#FFC107' }}>★</span>}
                    {p.photoURL ? (
                      <img src={p.photoURL} alt={p.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: isNext ? '2px solid #FFC107' : 'none' }} />
                    ) : (
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: isNext ? '#FFC107' : '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: isNext ? '#000' : '#fff' }}>{p.number}</div>
                    )}
                    <span style={{ fontSize: 8, color: '#ccc' }}>{(p.shirtName || p.name).split(' ')[0]}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected player indicator - below pitch */}
        {selectedPlayer && (
          <div style={{
            background: 'rgba(211,47,47,0.15)', border: '1px solid rgba(211,47,47,0.3)',
            borderRadius: 10, padding: '10px 14px', marginTop: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 12, color: '#eee', flex: 1 }}>
              <strong>{players.find(p => p.id === selectedPlayer)?.shirtName}</strong> →
            </span>
            <button onClick={() => {
              if (selectedPlayer && !bench.includes(selectedPlayer)) {
                const newPositions = { ...positions }
                Object.keys(newPositions).forEach(k => { if (newPositions[k] === selectedPlayer) delete newPositions[k] })
                setPositions(newPositions)
                setBench([...bench.filter(b => b !== selectedPlayer), selectedPlayer])
              }
              setSelectedPlayer(null)
            }} style={{ background: '#1565C0', color: '#fff', padding: '6px 12px', fontSize: 11 }}>+ Bench</button>
            <button onClick={() => setSelectedPlayer(null)} style={{ background: '#333', color: '#fff', padding: '6px 12px', fontSize: 11 }}>Cancel</button>
          </div>
        )}

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
              <h3 style={{ fontSize: 11, color: '#666', marginTop: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>Bench <span style={{ color: '#444', fontWeight: 400 }}>· tap ★ = next in</span></h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
                {bench.map(bId => {
                  const p = players.find(pl => pl.id === bId)
                  if (!p) return null
                  const isNextIn = nextIn.includes(p.id)
                  return (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 10,
                      background: isNextIn ? 'rgba(255,193,7,0.08)' : selectedPlayer === p.id ? 'rgba(211,47,47,0.15)' : 'rgba(255,255,255,0.03)',
                      border: isNextIn ? '1px solid rgba(255,193,7,0.3)' : selectedPlayer === p.id ? '1px solid #d32f2f' : '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                    }}>
                      <div onClick={() => handlePlayerTap(p.id)} style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #555, #333)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>{p.number || '-'}</div>
                      <div onClick={() => handlePlayerTap(p.id)} style={{ fontSize: 11, fontWeight: 600, color: '#eee', flex: 1 }}>{p.shirtName}</div>
                      <span onClick={e => { e.stopPropagation(); setNextIn(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]) }} style={{ fontSize: 16, cursor: 'pointer', opacity: isNextIn ? 1 : 0.3 }}>★</span>
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
          position: 'fixed', bottom: 56, left: 0, right: 0,
          display: 'flex', gap: 6, padding: '10px 12px',
          background: 'rgba(8,8,8,0.98)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          zIndex: 100,
        }}>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg, #d32f2f, #9a0007)', color: '#fff', fontSize: 12, padding: '10px 0', boxShadow: '0 2px 12px rgba(211,47,47,0.2)' }}>
            {saving ? '...' : '💾 Save'}
          </button>
          <button onClick={handleShare} style={{ flex: 1, background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', fontSize: 12, padding: '10px 0', boxShadow: '0 2px 10px rgba(37,211,102,0.2)' }}>
            ⚽ Lineup
          </button>
          <button onClick={handleShareSquad} style={{ flex: 1, background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: '#fff', fontSize: 12, padding: '10px 0', boxShadow: '0 2px 10px rgba(21,101,192,0.2)' }}>
            📋 Squad
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
          ⚽ Lineup
        </button>
        <button onClick={handleShareSquad} style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: '#fff', boxShadow: '0 2px 10px rgba(21,101,192,0.3)' }}>
          📋 Squad
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
