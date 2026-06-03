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

    const data: Partial<Omit<Player, 'id'>> = { name, shirtName, number: parseInt(number), position }
    if (photoURL) data.photoURL = photoURL

    if (editId) {
      await updateDoc(doc(db, 'players', editId), data)
      setEditId(null)
    } else {
      await addDoc(collection(db, 'players'), data)
    }
    resetForm()
  }

  const resetForm = () => { setName(''); setShirtName(''); setNumber(''); setPosition('CM'); setPhoto(null) }

  const handleEdit = (p: Player) => {
    setEditId(p.id); setName(p.name); setShirtName(p.shirtName); setNumber(String(p.number)); setPosition(p.position)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this player?')) deleteDoc(doc(db, 'players', id))
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Squad</h2>

      <form onSubmit={handleSubmit} style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28,
        background: 'linear-gradient(135deg, #151515, #1c1c1c)', padding: 16, borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="Shirt name" value={shirtName} onChange={e => setShirtName(e.target.value)} required />
        <input placeholder="Number" type="number" value={number} onChange={e => setNumber(e.target.value)} required />
        <select value={position} onChange={e => setPosition(e.target.value)}>
          {['GK','CB','LB','RB','LWB','RWB','CM','LM','RM','LW','RW','ST'].map(p => <option key={p}>{p}</option>)}
        </select>
        <label style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '8px 0' }}>
          📷 {photo ? photo.name.slice(0, 15) + '...' : 'Add photo'}
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ display: 'none' }} />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ background: '#d32f2f', color: '#fff', flex: 1 }}>
            {editId ? '✓ Update' : '+ Add'}
          </button>
          {editId && <button type="button" onClick={() => { setEditId(null); resetForm() }} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>}
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {players.sort((a, b) => a.number - b.number).map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(135deg, #141414, #1a1a1a)',
            padding: '12px 16px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {p.photoURL ? (
              <img src={p.photoURL} alt={p.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(211,47,47,0.3)' }} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, color: '#fff',
              }}>
                {p.number}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#666' }}>#{p.number} · {p.shirtName} · {p.position}</div>
            </div>
            <button onClick={() => handleEdit(p)} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', padding: '6px 10px', fontSize: 11, border: '1px solid rgba(255,255,255,0.08)' }}>✏️</button>
            <button onClick={() => handleDelete(p.id)} style={{ background: 'rgba(255,255,255,0.05)', color: '#d32f2f', padding: '6px 10px', fontSize: 11, border: '1px solid rgba(255,255,255,0.08)' }}>✕</button>
          </div>
        ))}
        {players.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: 20 }}>No players added yet.</p>}
      </div>

      <CoachesSection />
    </div>
  )
}

function CoachesSection() {
  const [coaches, setCoaches] = useState<{ id: string; name: string; photoURL?: string }[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)

  useEffect(() => {
    return onSnapshot(collection(db, 'coaches'), (snap) => {
      setCoaches(snap.docs.map(d => ({ id: d.id, ...d.data() } as { id: string; name: string; photoURL?: string })))
    })
  }, [])

  const handleEdit = (c: { id: string; name: string }) => {
    setEditId(c.id); setName(c.name)
  }

  const handleSave = async () => {
    if (!editId) return
    let photoURL: string | undefined
    if (photo) {
      const storageRef = ref(storage, `coaches/${Date.now()}_${photo.name}`)
      await uploadBytes(storageRef, photo)
      photoURL = await getDownloadURL(storageRef)
    }
    await updateDoc(doc(db, 'coaches', editId), { name, ...(photoURL && { photoURL }) })
    setEditId(null); setName(''); setPhoto(null)
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Coaches</h2>

      {editId && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center',
          background: 'linear-gradient(135deg, #151515, #1c1c1c)', padding: 14, borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ flex: 1 }} />
          <label style={{ fontSize: 12, color: '#888', cursor: 'pointer' }}>
            📷 {photo ? '✓' : ''}
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          </label>
          <button onClick={handleSave} style={{ background: '#d32f2f', color: '#fff' }}>Save</button>
          <button onClick={() => { setEditId(null); setName('') }} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {coaches.map(c => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(135deg, #141414, #1a1a1a)',
            padding: '12px 16px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {c.photoURL ? (
              <img src={c.photoURL} alt={c.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(100,100,100,0.3)' }} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #444, #333)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>👔</div>
            )}
            <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{c.name}</div>
            <button onClick={() => handleEdit(c)} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', padding: '6px 10px', fontSize: 11, border: '1px solid rgba(255,255,255,0.08)' }}>✏️</button>
          </div>
        ))}
      </div>
    </div>
  )
}
