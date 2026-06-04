import { useNavigate } from 'react-router-dom'

const items = [
  { path: '/stats', icon: '📊', title: 'Playing Time Stats', desc: 'Minutes played per match' },
  { path: '/attendance', icon: '📋', title: 'Attendance', desc: 'Track training & match attendance' },
  { path: '/compare', icon: '⚖️', title: 'Compare Lineups', desc: 'Compare two match setups' },
  { path: '/templates', icon: '💬', title: 'Message Templates', desc: 'Quick WhatsApp messages (SV)' },
]

export default function More() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: 20, paddingBottom: 80, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>More</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <div key={item.path} onClick={() => navigate(item.path)} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px', borderRadius: 16, cursor: 'pointer',
            background: 'var(--card)', border: '1px solid var(--card-border)',
            boxShadow: 'var(--card-shadow)',
          }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{item.desc}</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--text3)' }}>▸</span>
          </div>
        ))}
      </div>
    </div>
  )
}
