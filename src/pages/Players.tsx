import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { Player } from '../types'

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([])
  const [name, setName] = useState('')
  const [shirtName, setShirtName] = useState('')
  const [number, setNumber] = useState('')
  const [position, setPosition] = useState('CM')
  const [editId, setEditId] = useState<string | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)

  useEffect(() => {
    return onSnapshot(collection(db, 'players'), (snap) => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Player)))
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let photoURL: string | undefined

    if (photo) {
      const storageRef = ref(storage, `players/${Date.now()}_${photo.name}`)
      await uploadBytes(storageRef, photo)
      photoURL = await getDownloadURL(storageRef)
    }

    const data: Omit<Player, 'id'> = { name, shirtName, number: parseInt(number), position, ...(photoURL && { photoURL }) }

    if (editId) {
      await updateDoc(doc(db, 'players', editId), data)
      setEditId(null)
    } else {
      await addDoc(collection(db, 'players'), data)
    }
    setName(''); setShirtName(''); setNumber(''); setPosition('CM'); setPhoto(null)
  }

  const handleEdit = (p: Player) => {
    setEditId(p.id); setName(p.name); setShirtName(p.shirtName); setNumber(String(p.number)); setPosition(p.position)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this player?')) deleteDoc(doc(db, 'players', id))
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Squad Management</h2>

      <form onSubmit={handleSubmit} style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28,
        background: '#141414', padding: 16, borderRadius: 12, border: '1px solid #2a2a2a',
      }}>
        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required style={{ flex: 1, minWidth: 130 }} />
        <input placeholder="Shirt name" value={shirtName} onChange={e => setShirtName(e.target.value)} required style={{ flex: 1, minWidth: 100 }} />
        <input placeholder="#" type="number" value={number} onChange={e => setNumber(e.target.value)} required style={{ width: 60 }} />
        <select value={position} onChange={e => setPosition(e.target.value)}>
          {['GK','CB','LB','RB','LWB','RWB','CM','LM','RM','LW','RW','ST'].map(p => <option key={p}>{p}</option>)}
        </select>
        <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ fontSize: 12 }} />
        <button type="submit" style={{ background: '#d32f2f', color: '#fff' }}>
          {editId ? 'Update' : '+ Add'}
        </button>
        {editId && <button type="button" onClick={() => { setEditId(null); setName(''); setShirtName(''); setNumber('') }} style={{ background: '#333', color: '#999' }}>Cancel</button>}
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {players.sort((a, b) => a.number - b.number).map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#141414', padding: '12px 16px', borderRadius: 10,
            border: '1px solid #1f1f1f', transition: 'border-color 0.2s',
          }}>
            {p.photoURL ? (
              <img src={p.photoURL} alt={p.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13,
              }}>
                {p.number}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>#{p.number} · {p.shirtName} · {p.position}</div>
            </div>
            <button onClick={() => handleEdit(p)} style={{ background: '#1a1a1a', color: '#999', padding: '6px 12px', fontSize: 12, border: '1px solid #2a2a2a' }}>Edit</button>
            <button onClick={() => handleDelete(p.id)} style={{ background: '#1a1a1a', color: '#d32f2f', padding: '6px 12px', fontSize: 12, border: '1px solid #2a2a2a' }}>✕</button>
          </div>
        ))}
        {players.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: 20 }}>No players added yet. Add your first player above.</p>}
      </div>
    </div>
  )
}
