import { useState, useEffect } from 'react'
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { Player, Lineup } from '../types'

export default function Stats() {
  const [players, setPlayers] = useState<Player[]>([])
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'players'), (snap) => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Player)))
    })
    const unsub2 = onSnapshot(collection(db, 'lineups'), (snap) => {
      setLineups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lineup)).sort((a, b) => b.createdAt - a.createdAt))
    })
    return () => { unsub1(); unsub2() }
  }, [])

  const formatTime = (s: number) => {
    if (!s) return '—'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `0:${sec.toString().padStart(2, '0')}`
  }

  // Total stats
  const totals = players.map(p => {
    let totalSeconds = 0
    let matches = 0
    lineups.forEach(l => {
      const seconds = l.playerSeconds?.[p.id]
      if (seconds && seconds > 0) {
        totalSeconds += seconds
        matches++
      }
    })
    return { player: p, totalSeconds, matches }
  }).filter(s => s.matches > 0).sort((a, b) => b.totalSeconds - a.totalSeconds)

  const matchesWithTime = lineups.filter(l => l.playerSeconds && Object.keys(l.playerSeconds).length > 0)

  return (
    <div style={{ padding: 20, paddingBottom: 80, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, letterSpacing: -0.5 }}>Stats</h2>

      {/* Per match stats */}
      <h3 style={{ fontSize: 12, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Per Match</h3>

      {matchesWithTime.length === 0 && (
        <p style={{ color: '#555', textAlign: 'center', padding: 20, fontSize: 13 }}>
          No time data yet. Start the timer during a match and save.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
        {matchesWithTime.map(l => {
          const isExpanded = expandedMatch === l.id
          const matchPlayers = Object.entries(l.playerSeconds || {})
            .filter(([, s]) => s > 0)
            .sort(([, a], [, b]) => b - a)

          return (
            <div key={l.id}>
              <div onClick={() => setExpandedMatch(isExpanded ? null : l.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 12,
                border: isExpanded ? '1px solid rgba(211,47,47,0.3)' : '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
                }}>⚽</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{l.title || `vs ${l.opponent || 'TBD'}`}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>{l.matchDate} · {matchPlayers.length} players tracked</div>
                </div>
                <span style={{ fontSize: 14, color: '#666' }}>{isExpanded ? '▾' : '▸'}</span>
              </div>

              {isExpanded && (
                <div style={{
                  marginTop: 4, marginLeft: 12, borderLeft: '2px solid rgba(211,47,47,0.2)',
                  paddingLeft: 12, paddingTop: 6, paddingBottom: 6,
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  {matchPlayers.map(([pId, seconds]) => {
                    const p = players.find(pl => pl.id === pId)
                    if (!p) return null
                    const maxInMatch = matchPlayers[0][1]
                    const pct = (seconds / maxInMatch) * 100
                    const isLow = pct < 40
                    return (
                      <div key={pId} style={{
                        padding: '6px 10px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.02)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          {p.photoURL ? (
                            <img src={p.photoURL} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 700, color: '#fff',
                            }}>{p.number}</div>
                          )}
                          <span style={{ fontSize: 12, flex: 1 }}>{p.shirtName || p.name}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: isLow ? '#FFC107' : '#4CAF50' }}>{formatTime(seconds)}</span>
                        </div>
                        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{
                            height: '100%', borderRadius: 2, width: `${pct}%`,
                            background: isLow ? 'linear-gradient(90deg, #FFC107, #FF9800)' : 'linear-gradient(90deg, #4CAF50, #2E7D32)',
                          }} />
                        </div>
                      </div>
                    )
                  })}
                  <button onClick={() => {
                    if (window.confirm('Clear time stats for this match?')) {
                      updateDoc(doc(db, 'lineups', l.id), { playerSeconds: {} })
                    }
                  }} style={{
                    marginTop: 6, background: 'rgba(255,255,255,0.03)', color: '#888',
                    fontSize: 10, padding: '5px 10px', border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    🗑 Clear match stats
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Total */}
      {totals.length > 0 && (
        <>
          <h3 style={{ fontSize: 12, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Total Playing Time</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {totals.map(({ player: p, totalSeconds, matches }) => {
              const maxSec = totals[0].totalSeconds || 1
              const pct = (totalSeconds / maxSec) * 100
              const isLow = pct < 40
              return (
                <div key={p.id} style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 14px',
                  border: isLow ? '1px solid rgba(255,193,7,0.2)' : '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    {p.photoURL ? (
                      <img src={p.photoURL} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: '#fff',
                      }}>{p.number}</div>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{p.shirtName || p.name}</span>
                    <span style={{ fontSize: 10, color: '#666' }}>{matches}m</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isLow ? '#FFC107' : '#4CAF50' }}>{formatTime(totalSeconds)}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{
                      height: '100%', borderRadius: 2, width: `${pct}%`,
                      background: isLow ? 'linear-gradient(90deg, #FFC107, #FF9800)' : 'linear-gradient(90deg, #4CAF50, #2E7D32)',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Reset all - hidden at bottom */}
      {matchesWithTime.length > 0 && (
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <button onClick={() => {
            if (window.confirm('Reset ALL time stats from all matches? This cannot be undone.')) {
              matchesWithTime.forEach(l => updateDoc(doc(db, 'lineups', l.id), { playerSeconds: {} }))
            }
          }} style={{
            background: 'transparent', color: '#555', fontSize: 11, padding: '8px 16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            Reset all stats
          </button>
        </div>
      )}
    </div>
  )
}
