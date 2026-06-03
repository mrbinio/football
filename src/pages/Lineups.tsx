import { useState, useEffect } from 'react'
import { collection, onSnapshot, deleteDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { Lineup } from '../types'
import { useNavigate } from 'react-router-dom'

export default function Lineups() {
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [editNotes, setEditNotes] = useState<string | null>(null)
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
    if (confirm('Delete this lineup?')) deleteDoc(doc(db, 'lineups', id))
  }

  const openNotes = (e: React.MouseEvent, l: Lineup) => {
    e.stopPropagation()
    setEditNotes(l.id)
    setNotes(l.notes || '')
    setResult(l.result || '')
    setScorers(l.scorers || '')
    setRating(l.rating || 0)
  }

  const saveNotes = async () => {
    if (!editNotes) return
    await updateDoc(doc(db, 'lineups', editNotes), { notes, result, scorers, rating })
    setEditNotes(null)
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Saved Lineups</h2>

      {/* Notes modal */}
      {editNotes && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setEditNotes(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1a1a1a', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400,
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <h3 style={{ marginBottom: 16 }}>Match Notes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Result (e.g. 3-1 W)" value={result} onChange={e => setResult(e.target.value)} />
              <input placeholder="Scorers (e.g. Biniarz x2, Hasani)" value={scorers} onChange={e => setScorers(e.target.value)} />
              <div>
                <label style={{ fontSize: 12, color: '#888', marginBottom: 4, display: 'block' }}>Match Rating</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setRating(n)} style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: n <= rating ? '#d32f2f' : 'rgba(255,255,255,0.05)',
                      color: n <= rating ? '#fff' : '#666', fontSize: 14,
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
                  padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 13, resize: 'vertical',
                }}
              />
              <button onClick={saveNotes} style={{ background: '#d32f2f', color: '#fff' }}>Save Notes</button>
            </div>
          </div>
        </div>
      )}

      {lineups.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: 40 }}>No lineups saved yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lineups.map(l => (
          <div key={l.id} style={{
            background: '#141414', padding: '14px 16px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'border-color 0.2s',
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
                <div style={{ fontSize: 12, color: '#666' }}>
                  {l.matchDate} · {l.formation} · {l.createdByName || l.createdBy}
                </div>
                {l.result && <div style={{ fontSize: 11, color: '#d32f2f', marginTop: 2 }}>Result: {l.result} {l.rating ? '★'.repeat(l.rating) : ''}</div>}
              </div>
              <button onClick={e => openNotes(e, l)} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', padding: '6px 10px', fontSize: 11, border: '1px solid rgba(255,255,255,0.08)' }}>📝</button>
              <button onClick={e => handleDelete(e, l.id)} style={{ background: 'rgba(255,255,255,0.05)', color: '#d32f2f', padding: '6px 10px', fontSize: 11, border: '1px solid rgba(255,255,255,0.08)' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
