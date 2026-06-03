import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { Player } from '../types'

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [shirtName, setShirtName] = useState('')
  const [number, setNumber] = useState('')
  const [position, setPosition] = useState('CM')
  const [photo, setPhoto] = useState<File | null>(null)
  const [currentPhotoURL, setCurrentPhotoURL] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    return onSnapshot(collection(db, 'players'), (snap) => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Player)))
    })
  }, [])

  const openAdd = () => {
    setEditId(null); setName(''); setShirtName(''); setNumber(''); setPosition('CM')
    setPhoto(null); setCurrentPhotoURL(null); setRemovePhoto(false); setShowModal(true)
  }

  const openEdit = (p: Player) => {
    setEditId(p.id); setName(p.name); setShirtName(p.shirtName); setNumber(String(p.number)); setPosition(p.position)
    setCurrentPhotoURL(p.photoURL || null); setPhoto(null); setRemovePhoto(false); setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    try {
      let photoURL: string | undefined | null = undefined

      if (photo) {
        const storageRef = ref(storage, `players/${Date.now()}_${photo.name}`)
        const snapshot = await uploadBytes(storageRef, photo)
        photoURL = await getDownloadURL(snapshot.ref)
      } else if (removePhoto) {
        photoURL = null
      }

      const data: { [key: string]: string | number } = { name, shirtName, number: parseInt(number), position }
      if (photoURL !== undefined) data.photoURL = photoURL || ''

      if (editId) {
        await updateDoc(doc(db, 'players', editId), data)
      } else {
        await addDoc(collection(db, 'players'), data)
      }
      setShowModal(false)
    } catch (err) {
      console.error(err)
      alert('Error saving player.')
    }
    setUploading(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this player?')) deleteDoc(doc(db, 'players', id))
  }

  return (
    <div style={{ padding: 20, paddingBottom: 80, maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, flex: 1 }}>Squad</h2>
        <button onClick={openAdd} style={{ background: '#d32f2f', color: '#fff' }}>+ Add Player</button>
      </div>

      {/* Player modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setShowModal(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleSubmit} style={{
            background: '#1a1a1a', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360,
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <h3 style={{ marginBottom: 4 }}>{editId ? 'Edit Player' : 'Add Player'}</h3>

            {/* Current photo preview */}
            {(currentPhotoURL && !removePhoto) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={currentPhotoURL} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                <button type="button" onClick={() => setRemovePhoto(true)} style={{ background: 'rgba(255,255,255,0.05)', color: '#d32f2f', fontSize: 11, border: '1px solid rgba(255,255,255,0.1)' }}>
                  Remove photo
                </button>
              </div>
            )}

            <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
            <input placeholder="Shirt name" value={shirtName} onChange={e => setShirtName(e.target.value)} required />
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="#" type="number" value={number} onChange={e => setNumber(e.target.value)} required style={{ width: 70 }} />
              <select value={position} onChange={e => setPosition(e.target.value)} style={{ flex: 1 }}>
                {['GK','CB','LB','RB','LWB','RWB','CM','LM','RM','LW','RW','ST'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <label style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 0' }}>
              📷 {photo ? <span style={{ color: '#4CAF50' }}>{photo.name.slice(0, 20)}</span> : (removePhoto ? 'Add new photo' : 'Change photo')}
              <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button type="submit" disabled={uploading} style={{ background: '#d32f2f', color: '#fff', flex: 1 }}>
                {uploading ? 'Saving...' : editId ? '✓ Update' : '+ Add'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Players list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {players.sort((a, b) => a.number - b.number).map(p => (
          <div key={p.id} onClick={() => openEdit(p)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, #141414, #1a1a1a)',
            padding: '10px 14px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
          }}>
            {p.photoURL ? (
              <img src={p.photoURL} alt={p.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(211,47,47,0.3)', flexShrink: 0 }} />
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
            <button onClick={e => { e.stopPropagation(); handleDelete(p.id) }} style={{ background: 'rgba(255,255,255,0.05)', color: '#d32f2f', padding: '5px 8px', fontSize: 11, border: '1px solid rgba(255,255,255,0.08)' }}>✕</button>
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
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [currentPhotoURL, setCurrentPhotoURL] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    return onSnapshot(collection(db, 'coaches'), (snap) => {
      setCoaches(snap.docs.map(d => ({ id: d.id, ...d.data() } as { id: string; name: string; photoURL?: string })))
    })
  }, [])

  const openEdit = (c: { id: string; name: string; photoURL?: string }) => {
    setEditId(c.id); setName(c.name); setCurrentPhotoURL(c.photoURL || null)
    setPhoto(null); setRemovePhoto(false); setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    setUploading(true)
    try {
      let photoURL: string | undefined | null = undefined
      if (photo) {
        const storageRef = ref(storage, `coaches/${Date.now()}_${photo.name}`)
        const snapshot = await uploadBytes(storageRef, photo)
        photoURL = await getDownloadURL(snapshot.ref)
      } else if (removePhoto) {
        photoURL = null
      }
      const data: { [key: string]: string | number } = { name }
      if (photoURL !== undefined) data.photoURL = photoURL || ''
      await updateDoc(doc(db, 'coaches', editId), data)
      setShowModal(false)
    } catch (err) {
      console.error(err)
      alert('Error saving.')
    }
    setUploading(false)
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Coaches</h2>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setShowModal(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleSave} style={{
            background: '#1a1a1a', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360,
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <h3>Edit Coach</h3>

            {(currentPhotoURL && !removePhoto) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={currentPhotoURL} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                <button type="button" onClick={() => setRemovePhoto(true)} style={{ background: 'rgba(255,255,255,0.05)', color: '#d32f2f', fontSize: 11, border: '1px solid rgba(255,255,255,0.1)' }}>
                  Remove photo
                </button>
              </div>
            )}

            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <label style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              📷 {photo ? <span style={{ color: '#4CAF50' }}>{photo.name.slice(0, 20)}</span> : 'Change photo'}
              <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={uploading} style={{ background: '#d32f2f', color: '#fff', flex: 1 }}>
                {uploading ? 'Saving...' : '✓ Save'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {coaches.map(c => (
          <div key={c.id} onClick={() => openEdit(c)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(135deg, #141414, #1a1a1a)',
            padding: '10px 14px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
          }}>
            {c.photoURL ? (
              <img src={c.photoURL} alt={c.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #444, #333)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>👔</div>
            )}
            <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{c.name}</div>
            <span style={{ fontSize: 11, color: '#555' }}>✏️</span>
          </div>
        ))}
      </div>
    </div>
  )
}
