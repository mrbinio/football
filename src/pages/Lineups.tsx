import { useState, useEffect } from 'react'
import { collection, onSnapshot, deleteDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { Lineup } from '../types'
import { useNavigate } from 'react-router-dom'

export default function Lineups() {
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [opponent, setOpponent] = useState('')
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState('')
  const [scorers, setScorers] = useState('')
  const [rating, setRating] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    return onSnapshot(collection(db, 'lineups'), (snap) => {
      setLineups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lineup)).sort((a, b) => b.createdAt - a.createdAt))
    })
  }, [])

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    e.preventDefault()
    const yes = window.confirm('Delete this lineup?')
    if (yes) {
      deleteDoc(doc(db, 'lineups', id))
    }
  }

  const openEdit = (e: React.MouseEvent, l: Lineup) => {
    e.stopPropagation()
    setEditId(l.id)
    setTitle(l.title || '')
    setOpponent(l.opponent || '')
    setNotes(l.notes || '')
    setResult(l.result || '')
    setScorers(l.scorers || '')
    setRating(l.rating || 0)
  }

  const saveEdit = async () => {
    if (!editId) return
    await updateDoc(doc(db, 'lineups', editId), { title, opponent, notes, result, scorers, rating })
    setEditId(null)
  }

  return (
    <div style={{ padding: 24, paddingBottom: 80, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, letterSpacing: -0.5 }}>Matches</h2>

      {/* Edit modal */}
      {editId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setEditId(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--card)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400,
            border: '1px solid var(--card-border)',
          }}>
            <h3 style={{ marginBottom: 16 }}>Edit Lineup</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Title (e.g. Cup Round 2)" value={title} onChange={e => setTitle(e.target.value)} />
              <input placeholder="Opponent" value={opponent} onChange={e => setOpponent(e.target.value)} />
              <input placeholder="Result (e.g. 3-1 W)" value={result} onChange={e => setResult(e.target.value)} />
              <input placeholder="Scorers (e.g. Biniarz x2, Hasani)" value={scorers} onChange={e => setScorers(e.target.value)} />
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Match Rating</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setRating(n)} style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: n <= rating ? '#d32f2f' : 'rgba(255,255,255,0.05)',
                      color: n <= rating ? '#fff' : '#555', fontSize: 14,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>★</button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Notes (how we played, what to improve...)"
                value={notes} onChange={e => setNotes(e.target.value)}
                rows={4}
                style={{
                  padding: 12, borderRadius: 10, border: '1px solid var(--card-border)',
                  background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 13, resize: 'vertical',
                }}
              />
              <button onClick={saveEdit} style={{ background: '#d32f2f', color: '#fff' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {lineups.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: 40 }}>No lineups saved yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lineups.map(l => (
          <div key={l.id} style={{
            background: 'var(--card)',
            padding: '14px 16px', borderRadius: 16,
            border: '1px solid var(--card-border)', cursor: 'pointer',
            transition: 'border-color 0.2s',
          }} onClick={() => navigate(`/lineup/${l.id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
              }}>⚽</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {l.title || `vs ${l.opponent || 'TBD'}`}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {l.matchDate} · {l.formation} · {l.createdByName || l.createdBy}
                </div>
                {l.result && <div style={{ fontSize: 11, color: '#d32f2f', marginTop: 2 }}>Result: {l.result}</div>}
                {l.rating > 0 && <div style={{ fontSize: 12, marginTop: 2 }}>{'★'.repeat(l.rating)}{'☆'.repeat(5 - l.rating)}</div>}
              </div>
              <button onClick={e => openEdit(e, l)} onTouchEnd={e => { e.stopPropagation(); openEdit(e as unknown as React.MouseEvent, l) }} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text2)', padding: '8px 12px', fontSize: 12, border: '1px solid var(--card-border)', minWidth: 36 }}>✏️</button>
              <button onClick={e => handleDelete(e, l.id)} onTouchEnd={e => { e.stopPropagation(); handleDelete(e as unknown as React.MouseEvent, l.id) }} style={{ background: 'rgba(255,255,255,0.05)', color: '#d32f2f', padding: '8px 12px', fontSize: 12, border: '1px solid var(--card-border)', minWidth: 36 }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
