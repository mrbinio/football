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
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: fade ? 0 : 1, transition: 'opacity 1s ease-out',
      background: 'radial-gradient(ellipse at center, #1a0a0a 0%, #0a0a0a 70%)',
    }}>
      <style>{`
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.01); }
        }
        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(211, 47, 47, 0.2), 0 0 60px rgba(211, 47, 47, 0.1); }
          50% { box-shadow: 0 0 50px rgba(211, 47, 47, 0.4), 0 0 100px rgba(211, 47, 47, 0.2); }
        }
        @keyframes textSlide {
          0% { opacity: 0; transform: translateY(16px); letter-spacing: 10px; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 5px; }
        }
        @keyframes lineExpand {
          0% { width: 0; opacity: 0; }
          100% { width: 120px; opacity: 1; }
        }
        @keyframes subtitleIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 0.8; transform: translateY(0); }
        }
      `}</style>

      <img
        src="/bp-logo.jpg"
        alt="BP"
        style={{
          width: 260,
          height: 'auto',
          borderRadius: 16,
          animation: 'logoFloat 3s ease-in-out infinite, logoGlow 3s ease-in-out infinite',
        }}
      />

      <h1 style={{
        fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 32,
        animation: 'textSlide 1s ease-out 0.8s both',
        textTransform: 'uppercase',
      }}>
        Brommapojkarna
      </h1>

      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, #d32f2f, transparent)',
        marginTop: 16, borderRadius: 2,
        animation: 'lineExpand 0.8s ease-out 1.4s both',
      }} />

      <p style={{
        fontSize: 12, color: '#ccc', marginTop: 16,
        animation: 'subtitleIn 0.8s ease-out 2s both',
        letterSpacing: 3, textTransform: 'uppercase',
      }}>
        Coaching Lineup P18-8
      </p>
    </div>
  )
}
