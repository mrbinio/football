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
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 20 }}>Players</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required style={{ flex: 1, minWidth: 120 }} />
        <input placeholder="Shirt name" value={shirtName} onChange={e => setShirtName(e.target.value)} required style={{ flex: 1, minWidth: 100 }} />
        <input placeholder="#" type="number" value={number} onChange={e => setNumber(e.target.value)} required style={{ width: 60 }} />
        <select value={position} onChange={e => setPosition(e.target.value)}>
          {['GK','CB','LB','RB','LWB','RWB','CM','LM','RM','LW','RW','ST'].map(p => <option key={p}>{p}</option>)}
        </select>
        <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ fontSize: 12 }} />
        <button type="submit" style={{ background: '#d32f2f', color: '#fff' }}>
          {editId ? 'Update' : 'Add'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {players.sort((a, b) => a.number - b.number).map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#2a1010', padding: 12, borderRadius: 8 }}>
            {p.photoURL ? (
              <img src={p.photoURL} alt={p.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {p.number}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#aaa' }}>#{p.number} · {p.shirtName} · {p.position}</div>
            </div>
            <button onClick={() => handleEdit(p)} style={{ background: '#333', color: '#fff', padding: '6px 12px', fontSize: 12 }}>Edit</button>
            <button onClick={() => handleDelete(p.id)} style={{ background: '#8b0000', color: '#fff', padding: '6px 12px', fontSize: 12 }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
