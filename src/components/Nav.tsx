import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Nav() {
  return (
    <nav style={{ display: 'flex', gap: 16, padding: '12px 20px', background: '#2a1010', alignItems: 'center', borderBottom: '2px solid #d32f2f' }}>
      <Link to="/" style={{ color: '#d32f2f', textDecoration: 'none', fontWeight: 700 }}>⚽ Lineup</Link>
      <Link to="/players" style={{ color: '#fff', textDecoration: 'none' }}>Players</Link>
      <Link to="/lineups" style={{ color: '#fff', textDecoration: 'none' }}>Saved</Link>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 12, color: '#aaa' }}>{auth.currentUser?.email}</span>
      <button onClick={() => signOut(auth)} style={{ background: '#333', color: '#fff', padding: '6px 12px', fontSize: 12 }}>Logout</button>
    </nav>
  )
}
