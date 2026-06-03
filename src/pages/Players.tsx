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
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    return onSnapshot(collection(db, 'players'), (snap) => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Player)))
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    try {
      let photoURL: string | undefined

      if (photo) {
        const storageRef = ref(storage, `players/${Date.now()}_${photo.name}`)
        const snapshot = await uploadBytes(storageRef, photo)
        photoURL = await getDownloadURL(snapshot.ref)
      }

      const data: Record<string, unknown> = { name, shirtName, number: parseInt(number), position }
      if (photoURL) data.photoURL = photoURL

      if (editId) {
        await updateDoc(doc(db, 'players', editId), data)
        setEditId(null)
      } else {
        await addDoc(collection(db, 'players'), data)
      }
      resetForm()
    } catch (err) {
      console.error('Upload error:', err)
      alert('Error saving player. Check that Firebase Storage is enabled.')
    }
    setUploading(false)
  }

  const resetForm = () => { setName(''); setShirtName(''); setNumber(''); setPosition('CM'); setPhoto(null) }

  const handleEdit = (p: Player) => {
    setEditId(p.id); setName(p.name); setShirtName(p.shirtName); setNumber(String(p.number)); setPosition(p.position)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this player?')) deleteDoc(doc(db, 'players', id))
  }

  return (
    <div style={{ padding: 20, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Squad</h2>

      <form onSubmit={handleSubmit} style={{
        display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24,
        background: 'linear-gradient(135deg, #151515, #1c1c1c)', padding: 16, borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required style={{ flex: 1 }} />
          <input placeholder="Shirt name" value={shirtName} onChange={e => setShirtName(e.target.value)} required style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="#" type="number" value={number} onChange={e => setNumber(e.target.value)} required style={{ width: 60 }} />
          <select value={position} onChange={e => setPosition(e.target.value)} style={{ width: 70 }}>
            {['GK','CB','LB','RB','LWB','RWB','CM','LM','RM','LW','RW','ST'].map(p => <option key={p}>{p}</option>)}
          </select>
          <label style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flex: 1 }}>
            📷 {photo ? <span style={{ color: '#4CAF50' }}>Photo ready</span> : 'Add photo'}
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={uploading} style={{ background: '#d32f2f', color: '#fff', flex: 1 }}>
            {uploading ? 'Uploading...' : editId ? '✓ Update' : '+ Add Player'}
          </button>
          {editId && <button type="button" onClick={() => { setEditId(null); resetForm() }} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>}
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {players.sort((a, b) => a.number - b.number).map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, #141414, #1a1a1a)',
            padding: '10px 14px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {p.photoURL ? (
              <img src={p.photoURL} alt={p.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(211,47,47,0.3)' }} />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 12, color: '#fff', flexShrink: 0,
              }}>
                {p.number}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#666' }}>#{p.number} · {p.shirtName} · {p.position}</div>
            </div>
            <button onClick={() => handleEdit(p)} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', padding: '5px 8px', fontSize: 11, border: '1px solid rgba(255,255,255,0.08)' }}>✏️</button>
            <button onClick={() => handleDelete(p.id)} style={{ background: 'rgba(255,255,255,0.05)', color: '#d32f2f', padding: '5px 8px', fontSize: 11, border: '1px solid rgba(255,255,255,0.08)' }}>✕</button>
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
  const [uploading, setUploading] = useState(false)

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
    setUploading(true)
    try {
      let photoURL: string | undefined
      if (photo) {
        const storageRef = ref(storage, `coaches/${Date.now()}_${photo.name}`)
        const snapshot = await uploadBytes(storageRef, photo)
        photoURL = await getDownloadURL(snapshot.ref)
      }
      const data: Record<string, unknown> = { name }
      if (photoURL) data.photoURL = photoURL
      await updateDoc(doc(db, 'coaches', editId), data)
    } catch (err) {
      console.error(err)
      alert('Error saving. Check Firebase Storage rules.')
    }
    setEditId(null); setName(''); setPhoto(null); setUploading(false)
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Coaches</h2>

      {editId && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14,
          background: 'linear-gradient(135deg, #151515, #1c1c1c)', padding: 14, borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: '#888', cursor: 'pointer', flex: 1 }}>
              📷 {photo ? <span style={{ color: '#4CAF50' }}>Photo ready</span> : 'Add photo'}
              <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>
            <button onClick={handleSave} disabled={uploading} style={{ background: '#d32f2f', color: '#fff' }}>{uploading ? '...' : 'Save'}</button>
            <button onClick={() => { setEditId(null); setName('') }} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {coaches.map(c => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(135deg, #141414, #1a1a1a)',
            padding: '10px 14px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {c.photoURL ? (
              <img src={c.photoURL} alt={c.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #444, #333)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}>👔</div>
            )}
            <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{c.name}</div>
            <button onClick={() => handleEdit(c)} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', padding: '5px 8px', fontSize: 11, border: '1px solid rgba(255,255,255,0.08)' }}>✏️</button>
          </div>
        ))}
      </div>
    </div>
  )
}
