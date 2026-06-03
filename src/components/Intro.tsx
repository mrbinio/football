import { useEffect, useState } from 'react'

interface Props {
  onFinish: () => void
}

export default function Intro({ onFinish }: Props) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 1500)
    const t3 = setTimeout(() => setPhase(3), 4000)
    const t4 = setTimeout(onFinish, 5000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onFinish])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase >= 3 ? 0 : 1, transition: 'opacity 1s ease-out',
      background: '#050505',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes logo-enter {
          0% { transform: scale(0.6); opacity: 0; filter: blur(8px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 40px rgba(211,47,47,0.15), 0 20px 50px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 70px rgba(211,47,47,0.25), 0 20px 50px rgba(0,0,0,0.5); }
        }
        @keyframes line-grow {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes text-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 0.6; transform: translateY(0); }
        }
      `}</style>

      {/* Logo */}
      <img
        src="/bp-logo.jpg"
        alt="BP"
        style={{
          width: 220,
          height: 'auto',
          borderRadius: 16,
          opacity: phase >= 1 ? 1 : 0,
          animation: phase >= 1 ? 'logo-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, glow 3s ease-in-out infinite' : 'none',
        }}
      />

      {/* Divider */}
      <div style={{
        width: 50, height: 2, marginTop: 24,
        background: 'linear-gradient(90deg, #d32f2f, #ff5252)',
        borderRadius: 1,
        opacity: phase >= 2 ? 1 : 0,
        animation: phase >= 2 ? 'line-grow 0.5s ease-out forwards' : 'none',
        transformOrigin: 'center',
      }} />

      {/* Subtitle */}
      <p style={{
        fontSize: 11, color: '#888', marginTop: 14,
        opacity: phase >= 2 ? 1 : 0,
        animation: phase >= 2 ? 'text-in 0.6s ease-out 0.2s forwards' : 'none',
        textTransform: 'uppercase',
        fontWeight: 500,
        letterSpacing: 4,
      }}>
        P18-8
      </p>
    </div>
  )
}
