import { useEffect, useState } from 'react'

interface Props {
  onFinish: () => void
}

export default function Intro({ onFinish }: Props) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(() => setPhase(3), 2200)
    const t4 = setTimeout(() => setPhase(4), 4500)
    const t5 = setTimeout(onFinish, 5500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [onFinish])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase >= 4 ? 0 : 1, transition: 'opacity 1s ease-out',
      background: '#050505',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes logo-enter {
          0% { transform: scale(0.5) rotate(-5deg); opacity: 0; filter: blur(10px); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; filter: blur(0); }
        }
        @keyframes title-enter {
          0% { opacity: 0; transform: translateY(20px); clip-path: inset(100% 0 0 0); }
          100% { opacity: 1; transform: translateY(0); clip-path: inset(0 0 0 0); }
        }
        @keyframes subtitle-enter {
          0% { opacity: 0; letter-spacing: 12px; }
          100% { opacity: 0.7; letter-spacing: 6px; }
        }
        @keyframes line-grow {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>

      {/* Background pulse rings */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(211,47,47,0.2)', animation: 'pulse-ring 3s ease-out infinite' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(211,47,47,0.15)', animation: 'pulse-ring 3s ease-out 1s infinite' }} />
      </div>

      {/* Logo */}
      <img
        src="/bp-logo.jpg"
        alt="BP"
        style={{
          width: 140,
          height: 'auto',
          borderRadius: 14,
          opacity: phase >= 1 ? 1 : 0,
          animation: phase >= 1 ? 'logo-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
          boxShadow: '0 0 60px rgba(211,47,47,0.2), 0 20px 40px rgba(0,0,0,0.5)',
        }}
      />

      {/* Title */}
      <h1 style={{
        fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 28,
        opacity: phase >= 2 ? 1 : 0,
        animation: phase >= 2 ? 'title-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
        textTransform: 'uppercase',
        letterSpacing: 3,
      }}>
        BP
      </h1>

      {/* Divider */}
      <div style={{
        width: 60, height: 2, marginTop: 14,
        background: 'linear-gradient(90deg, #d32f2f, #ff5252)',
        borderRadius: 1,
        opacity: phase >= 2 ? 1 : 0,
        animation: phase >= 2 ? 'line-grow 0.5s ease-out 0.3s forwards' : 'none',
        transformOrigin: 'center',
        transform: phase >= 2 ? 'scaleX(1)' : 'scaleX(0)',
      }} />

      {/* Subtitle */}
      <p style={{
        fontSize: 11, color: '#999', marginTop: 16,
        opacity: phase >= 3 ? 0.7 : 0,
        animation: phase >= 3 ? 'subtitle-enter 0.8s ease-out forwards' : 'none',
        textTransform: 'uppercase',
        fontWeight: 500,
      }}>
        P18-8 · Matchday
      </p>
    </div>
  )
}
