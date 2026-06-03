import { Player } from '../types'

interface Props {
  players: Player[]
  calledUpIds: string[]
  matchDate: string
  opponent: string
  title: string
  coachName: string
}

export default function SquadCard({ players, calledUpIds, matchDate, opponent, title, coachName }: Props) {
  const calledUp = players.filter(p => calledUpIds.includes(p.id)).sort((a, b) => a.number - b.number)

  return (
    <div style={{
      width: 400, padding: 24, borderRadius: 16,
      background: 'linear-gradient(160deg, #1a0a0a 0%, #0f0f0f 50%, #1a0a0a 100%)',
      border: '1px solid rgba(211,47,47,0.3)',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
          padding: '6px 16px', borderRadius: 20, marginBottom: 12,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 2, textTransform: 'uppercase' }}>Matchday Squad</span>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '8px 0 4px' }}>
          {title || `vs ${opponent || 'TBD'}`}
        </h2>
        <p style={{ fontSize: 12, color: '#888' }}>{matchDate}</p>
      </div>

      {/* Players grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        marginBottom: 20,
      }}>
        {calledUp.map(p => (
          <div key={p.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 4px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {p.photoURL ? (
              <img src={p.photoURL} alt={p.name} style={{
                width: 40, height: 40, borderRadius: '50%', objectFit: 'cover',
                border: '2px solid rgba(211,47,47,0.4)',
                marginBottom: 6,
              }} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: '#fff',
                marginBottom: 6,
              }}>{p.number}</div>
            )}
            <span style={{ fontSize: 10, fontWeight: 600, color: '#eee', textAlign: 'center' }}>
              {p.shirtName || p.name.split(' ').pop()}
            </span>
            <span style={{ fontSize: 9, color: '#666' }}>#{p.number}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
        <p style={{ fontSize: 10, color: '#666' }}>Coach: {coachName}</p>
        <p style={{ fontSize: 9, color: '#444', marginTop: 4 }}>BP · BrommaPojkarna P18-8</p>
      </div>
    </div>
  )
}
