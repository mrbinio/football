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
    fontSize: 13,
    fontWeight: location.pathname === path ? 600 : 400,
  })

  return (
    <nav style={{
      display: 'flex', gap: 12, padding: '12px 16px',
      background: '#111', alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky', top: 0, zIndex: 100,
      flexWrap: 'wrap',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
        <img src="/bp-logo.jpg" alt="BP" style={{ width: 24, height: 24, borderRadius: 5, objectFit: 'cover' }} />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>BP</span>
      </Link>
      <Link to="/" style={linkStyle('/')}>Editor</Link>
      <Link to="/players" style={linkStyle('/players')}>Players</Link>
      <Link to="/lineups" style={linkStyle('/lineups')}>Saved</Link>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 11, color: '#666' }}>{name}</span>
      <button onClick={() => signOut(auth)} style={{ background: 'rgba(255,255,255,0.05)', color: '#666', padding: '5px 10px', fontSize: 11, border: '1px solid rgba(255,255,255,0.08)' }}>
        ✕
      </button>
    </nav>
  )
}
