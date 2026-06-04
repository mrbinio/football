import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Player } from '../types'

interface Session {
  id: string
  date: string
  type: 'Training' | 'Match'
  present: string[]
  createdAt: number
}

export default function Attendance() {
  const [players, setPlayers] = useState<Player[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newType, setNewType] = useState<'Training' | 'Match'>('Training')

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'players'), s => setPlayers(s.docs.map(d => ({ id: d.id, ...d.data() } as Player))))
    const u2 = onSnapshot(collection(db, 'attendance'), s => setSessions(s.docs.map(d => ({ id: d.id, ...d.data() } as Session)).sort((a, b) => b.createdAt - a.createdAt)))
    return () => { u1(); u2() }
  }, [])

  const addSession = async () => {
    await addDoc(collection(db, 'attendance'), { date: newDate, type: newType, present: [], createdAt: Date.now() })
  }

  const togglePresent = async (sessionId: string, playerId: string, currentPresent: string[]) => {
    const updated = currentPresent.includes(playerId) ? currentPresent.filter(id => id !== playerId) : [...currentPresent, playerId]
    await updateDoc(doc(db, 'attendance', sessionId), { present: updated })
  }

  const deleteSession = (id: string) => {
    if (window.confirm('Delete this session?')) deleteDoc(doc(db, 'attendance', id))
  }

  // Stats
  const playerStats = players.map(p => {
    const attended = sessions.filter(s => s.present.includes(p.id)).length
    return { player: p, attended, total: sessions.length, pct: sessions.length > 0 ? Math.round((attended / sessions.length) * 100) : 0 }
  }).sort((a, b) => b.pct - a.pct)

  return (
    <div style={{ padding: 20, paddingBottom: 80, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Attendance</h2>

      {/* Add session */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ flex: 1 }} />
        <select value={newType} onChange={e => setNewType(e.target.value as 'Training' | 'Match')}>
          <option value="Training">Training</option>
          <option value="Match">Match</option>
        </select>
        <button onClick={addSession} style={{ background: '#4C522E', color: '#fff' }}>+ Add</button>
      </div>

      {/* Sessions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
        {sessions.map(s => (
          <div key={s.id}>
            <div onClick={() => setExpanded(expanded === s.id ? null : s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--card)', padding: '12px 14px', borderRadius: 16,
              border: expanded === s.id ? '1px solid var(--accent, #4C522E)' : '1px solid var(--card-border)',
              cursor: 'pointer', boxShadow: 'var(--card-shadow)',
            }}>
              <span style={{ fontSize: 14 }}>{s.type === 'Match' ? '⚽' : '🏃'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.date} · {s.type}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.present.length}/{players.length} present</div>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteSession(s.id) }} style={{ background: 'none', color: 'var(--text3)', fontSize: 11, padding: '4px 8px', border: '1px solid var(--card-border)' }}>✕</button>
              <span style={{ color: 'var(--text3)' }}>{expanded === s.id ? '▾' : '▸'}</span>
            </div>
            {expanded === s.id && (
              <div style={{ marginTop: 4, padding: '8px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 4 }}>
                {players.sort((a, b) => a.number - b.number).map(p => {
                  const isPresent = s.present.includes(p.id)
                  return (
                    <div key={p.id} onClick={() => togglePresent(s.id, p.id, s.present)} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
                      background: isPresent ? 'rgba(76,82,46,0.1)' : 'var(--card)',
                      border: isPresent ? '1px solid rgba(76,82,46,0.3)' : '1px solid var(--card-border)',
                    }}>
                      <span style={{ fontSize: 14 }}>{isPresent ? '✅' : '⬜'}</span>
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)' }}>{p.shirtName}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {sessions.length > 0 && (
        <>
          <h3 style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Attendance Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {playerStats.map(({ player: p, attended, total, pct }) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 16, background: 'var(--card)', border: '1px solid var(--card-border)',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{p.shirtName}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{attended}/{total}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 75 ? '#4C522E' : pct >= 50 ? '#998561' : '#d32f2f' }}>{pct}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
