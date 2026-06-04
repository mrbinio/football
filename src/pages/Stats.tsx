import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { Player, Lineup } from '../types'

export default function Stats() {
  const [players, setPlayers] = useState<Player[]>([])
  const [lineups, setLineups] = useState<Lineup[]>([])

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'players'), (snap) => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Player)))
    })
    const unsub2 = onSnapshot(collection(db, 'lineups'), (snap) => {
      setLineups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lineup)))
    })
    return () => { unsub1(); unsub2() }
  }, [])

  // Calculate stats per player
  const stats = players.map(p => {
    let totalSeconds = 0
    let matches = 0
    lineups.forEach(l => {
      const seconds = l.playerSeconds?.[p.id]
      if (seconds && seconds > 0) {
        totalSeconds += seconds
        matches++
      }
    })
    return {
      player: p,
      totalSeconds,
      matches,
      avgSeconds: matches > 0 ? Math.round(totalSeconds / matches) : 0,
    }
  }).filter(s => s.matches > 0).sort((a, b) => b.totalSeconds - a.totalSeconds)

  const maxSeconds = stats.length > 0 ? stats[0].totalSeconds : 1
  const minSeconds = stats.length > 0 ? stats[stats.length - 1].totalSeconds : 0

  const formatMin = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  return (
    <div style={{ padding: 20, paddingBottom: 80, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, letterSpacing: -0.5 }}>Playing Time Stats</h2>
      <p style={{ fontSize: 12, color: '#666', marginBottom: 20 }}>Total minutes tracked across saved matches</p>

      {stats.length === 0 && (
        <p style={{ color: '#555', textAlign: 'center', padding: 40 }}>
          No time data yet. Start the match timer and save lineups to track playing time.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {stats.map(({ player: p, totalSeconds, matches, avgSeconds }) => {
          const pct = (totalSeconds / maxSeconds) * 100
          const isLow = totalSeconds <= minSeconds + (maxSeconds - minSeconds) * 0.3
          return (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 12, padding: '12px 14px',
              border: isLow ? '1px solid rgba(255,193,7,0.25)' : '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                {p.photoURL ? (
                  <img src={p.photoURL} alt={p.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                  }}>{p.number}</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.shirtName || p.name}</div>
                  <div style={{ fontSize: 10, color: '#666' }}>#{p.number} · {matches} match{matches > 1 ? 'es' : ''} · avg {formatMin(avgSeconds)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isLow ? '#FFC107' : '#4CAF50' }}>{formatMin(totalSeconds)}</div>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  height: '100%', borderRadius: 2, width: `${pct}%`,
                  background: isLow ? 'linear-gradient(90deg, #FFC107, #FF9800)' : 'linear-gradient(90deg, #4CAF50, #2E7D32)',
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
