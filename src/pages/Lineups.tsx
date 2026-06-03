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
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 20 }}>Saved Lineups</h2>
      {lineups.length === 0 && <p style={{ color: '#aaa' }}>No lineups saved yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lineups.map(l => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#16213e', padding: 14, borderRadius: 8 }}>
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/lineup/${l.id}`)}>
              <div style={{ fontWeight: 600 }}>{l.matchDate} vs {l.opponent || '?'}</div>
              <div style={{ fontSize: 12, color: '#aaa' }}>{l.formation} · by {l.createdBy}</div>
            </div>
            <button onClick={() => handleDelete(l.id)} style={{ background: '#c0392b', color: '#fff', padding: '6px 12px', fontSize: 12 }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
