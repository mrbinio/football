import { useEffect, useState } from 'react'

interface Props {
  onFinish: () => void
}

export default function Intro({ onFinish }: Props) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200)
    const t2 = setTimeout(() => setPhase(2), 1400)
    const t3 = setTimeout(() => setPhase(3), 4000)
    const t4 = setTimeout(onFinish, 5000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onFinish])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase >= 3 ? 0 : 1, transition: 'opacity 1s ease-out',
      background: 'radial-gradient(circle at 50% 40%, #1a1808 0%, #0a0e08 70%)',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes logo-enter {
          0% { transform: scale(0.4) translateY(20px); opacity: 0; filter: blur(12px); }
          60% { transform: scale(1.05) translateY(-4px); opacity: 1; filter: blur(0); }
          100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 50px rgba(213,191,147,0.15), 0 0 100px rgba(213,191,147,0.05), 0 30px 60px rgba(0,0,0,0.6); }
          50% { box-shadow: 0 0 80px rgba(213,191,147,0.25), 0 0 140px rgba(213,191,147,0.1), 0 30px 60px rgba(0,0,0,0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Ambient light effect */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(213,191,147,0.08) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <img
        src="/bp-logo.jpg"
        alt="BP"
        style={{
          width: 280,
          height: 'auto',
          borderRadius: 18,
          opacity: phase >= 1 ? 1 : 0,
          animation: phase >= 1 ? 'logo-enter 1s cubic-bezier(0.16, 1, 0.3, 1) forwards, glow-pulse 3s ease-in-out 1s infinite' : 'none',
        }}
      />

      {/* Shimmer line */}
      <div style={{
        width: 80, height: 2, marginTop: 28,
        borderRadius: 1,
        opacity: phase >= 2 ? 1 : 0,
        background: phase >= 2 ? 'linear-gradient(90deg, transparent, #998561, #D5BF93, #998561, transparent)' : 'transparent',
        backgroundSize: '200% 100%',
        animation: phase >= 2 ? 'shimmer 2s linear infinite, fade-up 0.5s ease-out forwards' : 'none',
      }} />

      {/* P18-8 */}
      <p style={{
        fontSize: 18, color: '#fff', marginTop: 18,
        opacity: phase >= 2 ? 1 : 0,
        animation: phase >= 2 ? 'fade-up 0.6s ease-out 0.2s forwards' : 'none',
        textTransform: 'uppercase',
        fontWeight: 700,
        letterSpacing: 6,
      }}>
        P18-8
      </p>
    </div>
  )
}
