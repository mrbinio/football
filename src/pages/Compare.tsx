import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { Lineup } from '../types'

export default function Compare() {
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    return onSnapshot(collection(db, 'lineups'), s => {
      setLineups(s.docs.map(d => ({ id: d.id, ...d.data() } as Lineup)).sort((a, b) => b.createdAt - a.createdAt))
    })
  }, [])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const a = lineups.find(l => l.id === selected[0])
  const b = lineups.find(l => l.id === selected[1])

  return (
    <div style={{ padding: 20, paddingBottom: 80, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Compare Lineups</h2>
      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Select two matches to compare</p>

      {/* Comparison */}
      {a && b && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <CompareCard lineup={a} />
          <CompareCard lineup={b} />
        </div>
      )}

      {/* Match list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {lineups.map(l => (
          <div key={l.id} onClick={() => toggleSelect(l.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
            background: selected.includes(l.id) ? 'rgba(76,82,46,0.1)' : 'var(--card)',
            border: selected.includes(l.id) ? '1px solid rgba(76,82,46,0.4)' : '1px solid var(--card-border)',
            boxShadow: 'var(--card-shadow)',
          }}>
            <span style={{ fontSize: 14 }}>{selected.includes(l.id) ? '✓' : '○'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{l.title || `vs ${l.opponent || 'TBD'}`}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{l.matchDate} · {l.formation}</div>
            </div>
            {l.rating > 0 && <span style={{ fontSize: 12 }}>{'★'.repeat(l.rating)}{'☆'.repeat(5 - l.rating)}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function CompareCard({ lineup: l }: { lineup: Lineup }) {
  return (
    <div style={{
      background: 'var(--card)', borderRadius: 16, padding: 14,
      border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{l.title || `vs ${l.opponent || 'TBD'}`}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{l.matchDate}</div>
      <div style={{ fontSize: 12, marginBottom: 4 }}>Formation: <strong>{l.formation}</strong></div>
      {l.result && <div style={{ fontSize: 12, color: '#4C522E', fontWeight: 600 }}>Result: {l.result}</div>}
      {l.rating > 0 && <div style={{ fontSize: 14, marginTop: 4 }}>{'★'.repeat(l.rating)}{'☆'.repeat(5 - l.rating)}</div>}
      {l.scorers && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>⚽ {l.scorers}</div>}
    </div>
  )
}
