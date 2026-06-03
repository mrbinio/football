import { useState, useEffect } from 'react'
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { Lineup } from '../types'
import { useNavigate } from 'react-router-dom'

export default function Lineups() {
  const [lineups, setLineups] = useState<Lineup[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    return onSnapshot(collection(db, 'lineups'), (snap) => {
      setLineups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lineup)).sort((a, b) => b.createdAt - a.createdAt))
    })
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Delete this lineup?')) deleteDoc(doc(db, 'lineups', id))
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Saved Lineups</h2>
      {lineups.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: 40 }}>No lineups saved yet. Create one in the Editor.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {lineups.map(l => (
          <div key={l.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#141414', padding: '14px 16px', borderRadius: 10,
            border: '1px solid #1f1f1f', cursor: 'pointer', transition: 'border-color 0.2s',
          }} onClick={() => navigate(`/lineup/${l.id}`)}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>⚽</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>vs {l.opponent || 'TBD'}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{l.matchDate} · {l.formation} · {l.createdBy}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); handleDelete(l.id) }} style={{ background: '#1a1a1a', color: '#d32f2f', padding: '6px 12px', fontSize: 12, border: '1px solid #2a2a2a' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
