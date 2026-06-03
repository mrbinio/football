import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { getCoachName } from '../coaches'

export default function Nav() {
  const location = useLocation()
  const name = getCoachName(auth.currentUser?.email || '')

  const linkStyle = (path: string): React.CSSProperties => ({
    color: location.pathname === path ? '#d32f2f' : '#999',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: location.pathname === path ? 600 : 400,
    transition: 'color 0.2s',
  })

  return (
    <nav style={{
      display: 'flex', gap: 24, padding: '14px 24px',
      background: '#111', alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <img src="/bp-logo.jpg" alt="BP" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>BP Lineup</span>
      </Link>
      <div style={{ width: 1, height: 20, background: '#222' }} />
      <Link to="/" style={linkStyle('/')}>Editor</Link>
      <Link to="/players" style={linkStyle('/players')}>Players</Link>
      <Link to="/lineups" style={linkStyle('/lineups')}>Saved</Link>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{name}</span>
      <button onClick={() => signOut(auth)} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', padding: '7px 12px', fontSize: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
        Logout
      </button>
    </nav>
  )
}
