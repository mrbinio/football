import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { getCoachName } from '../coaches'

export default function Nav() {
  const location = useLocation()
  const name = getCoachName(auth.currentUser?.email || '')
  const isMobile = window.innerWidth < 768

  if (isMobile) {
    return (
      <>
        {/* Top bar - minimal */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '10px 16px',
          background: 'rgba(17,17,17,0.95)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <img src="/bp-logo.jpg" alt="BP" style={{ width: 22, height: 22, borderRadius: 5, objectFit: 'cover' }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginLeft: 8 }}>BP</span>
          <span style={{ fontSize: 10, color: '#444', marginLeft: 6 }}>P18-8</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: '#555' }}>{name}</span>
          <button onClick={() => signOut(auth)} style={{ background: 'none', color: '#555', padding: '4px 8px', fontSize: 10, marginLeft: 8, border: 'none' }}>
            Logout
          </button>
        </div>

        {/* Bottom tab bar */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          display: 'flex', zIndex: 99,
          background: 'rgba(13,13,13,0.97)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          <TabLink to="/" icon="⚽" label="Editor" active={location.pathname === '/'} />
          <TabLink to="/players" icon="👥" label="Squad" active={location.pathname === '/players'} />
          <TabLink to="/lineups" icon="📋" label="Matches" active={location.pathname === '/lineups'} />
        </nav>
      </>
    )
  }

  // Desktop nav
  return (
    <nav style={{
      display: 'flex', gap: 20, padding: '14px 28px',
      background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(20px)',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <img src="/bp-logo.jpg" alt="BP" style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'cover' }} />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>BP</span>
        <span style={{ fontSize: 10, color: '#444', fontWeight: 500 }}>P18-8</span>
      </Link>
      <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)' }} />
      <NavLink to="/" label="Editor" active={location.pathname === '/'} />
      <NavLink to="/players" label="Squad" active={location.pathname === '/players'} />
      <NavLink to="/lineups" label="Matches" active={location.pathname === '/lineups'} />
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 12, color: '#555' }}>{name}</span>
      <button onClick={() => signOut(auth)} style={{
        background: 'rgba(255,255,255,0.04)', color: '#666', padding: '6px 12px', fontSize: 11,
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
      }}>
        Logout
      </button>
    </nav>
  )
}

function TabLink({ to, icon, label, active }: { to: string; icon: string; label: string; active: boolean }) {
  return (
    <Link to={to} style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 0 8px', textDecoration: 'none',
      color: active ? '#d32f2f' : '#555',
      transition: 'color 0.2s',
    }}>
      <span style={{ fontSize: 18, marginBottom: 2 }}>{icon}</span>
      <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, letterSpacing: 0.5 }}>{label}</span>
    </Link>
  )
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link to={to} style={{
      textDecoration: 'none',
      fontSize: 13, fontWeight: active ? 600 : 400,
      color: active ? '#fff' : '#666',
      padding: '6px 12px',
      borderRadius: 8,
      background: active ? 'rgba(211,47,47,0.1)' : 'transparent',
      transition: 'all 0.2s',
    }}>
      {label}
    </Link>
  )
}
