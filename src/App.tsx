import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './firebase'
import Login from './pages/Login'
import LineupEditor from './pages/LineupEditor'
import Players from './pages/Players'
import Lineups from './pages/Lineups'
import Nav from './components/Nav'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
  if (!user) return <Login />

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
