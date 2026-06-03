import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './firebase'
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
    return onAuthStateChanged(auth, (u) => {
      if (u && !user) setShowIntro(true)
      setUser(u)
      setLoading(false)
    })
  }, [user])

  const handleIntroFinish = useCallback(() => setShowIntro(false), [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
  if (!user) return <Login />
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
