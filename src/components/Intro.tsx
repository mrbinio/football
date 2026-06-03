import { useEffect, useState } from 'react'

interface Props {
  onFinish: () => void
}

export default function Intro({ onFinish }: Props) {
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFade(true), 5000)
    const endTimer = setTimeout(onFinish, 6000)
    return () => { clearTimeout(fadeTimer); clearTimeout(endTimer) }
  }, [onFinish])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: fade ? 0 : 1, transition: 'opacity 1s ease-out',
    }}>
      <style>{`
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(211, 47, 47, 0.3)); }
          50% { filter: drop-shadow(0 0 40px rgba(211, 47, 47, 0.6)); }
        }
        @keyframes textSlide {
          0% { opacity: 0; transform: translateY(20px); letter-spacing: 8px; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 4px; }
        }
        @keyframes lineExpand {
          0% { width: 0; }
          100% { width: 80px; }
        }
        @keyframes subtitleIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      <img
        src="/bp-logo.jpg"
        alt="BP"
        style={{
          width: 180,
          height: 'auto',
          borderRadius: 12,
          animation: 'logoFloat 3s ease-in-out infinite, logoGlow 3s ease-in-out infinite',
        }}
      />

      <h1 style={{
        fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 28,
        animation: 'textSlide 1s ease-out 0.8s both',
        textTransform: 'uppercase',
      }}>
        Brommapojkarna
      </h1>

      <div style={{
        height: 2, background: 'linear-gradient(90deg, transparent, #d32f2f, transparent)',
        marginTop: 12, borderRadius: 2,
        animation: 'lineExpand 0.8s ease-out 1.4s both',
      }} />

      <p style={{
        fontSize: 13, color: '#ccc', marginTop: 14,
        animation: 'subtitleIn 0.8s ease-out 1.8s both',
        letterSpacing: 3, textTransform: 'uppercase',
      }}>
        Coaching Lineup P18-8
      </p>
    </div>
  )
}
