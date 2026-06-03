import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, User, signOut, getRedirectResult } from 'firebase/auth'
import { auth } from './firebase'
import { seedPlayers } from './seed'
import { isAuthorized } from './coaches'
import Login from './pages/Login'
import LineupEditor from './pages/LineupEditor'
import Players from './pages/Players'
import Lineups from './pages/Lineups'
import Nav from './components/Nav'
import Intro from './components/Intro'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    getRedirectResult(auth).catch(() => {})
    return onAuthStateChanged(auth, (u) => {
      if (u && !user) {
        setShowIntro(true)
        seedPlayers()
      }
      setUser(u)
      setLoading(false)
    })
  }, [user])

  const handleIntroFinish = useCallback(() => setShowIntro(false), [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
  if (!user) return <Login />

  // Check authorization
  if (!isAuthorized(user.email || '')) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>Access Denied</h2>
        <p style={{ color: '#888', marginBottom: 20 }}>Your email ({user.email}) is not authorized.</p>
        <button onClick={() => signOut(auth)} style={{ background: '#d32f2f', color: '#fff' }}>Sign Out</button>
      </div>
    )
  }

  if (showIntro) return <Intro onFinish={handleIntroFinish} />

  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<LineupEditor />} />
        <Route path="/players" element={<Players />} />
        <Route path="/lineups" element={<Lineups />} />
        <Route path="/lineup/:id" element={<LineupEditor />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
