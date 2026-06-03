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
        @keyframes shieldIn {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.1) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes textIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes stripeGlow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* BP Shield */}
      <div style={{ animation: 'shieldIn 1.2s ease-out forwards' }}>
        <svg viewBox="0 0 120 140" width="120" height="140">
          {/* Shield shape */}
          <path d="M60 5 L110 25 L105 95 L60 135 L15 95 L10 25 Z" fill="#1a0a0a" stroke="#d32f2f" strokeWidth="3" />
          {/* Red and black stripes inside shield */}
          <clipPath id="shield-clip">
            <path d="M60 5 L110 25 L105 95 L60 135 L15 95 L10 25 Z" />
          </clipPath>
          <g clipPath="url(#shield-clip)">
            <rect x="10" y="0" width="16" height="140" fill="#d32f2f" style={{ animation: 'stripeGlow 2s ease-in-out infinite' }} />
            <rect x="26" y="0" width="16" height="140" fill="#111" />
            <rect x="42" y="0" width="16" height="140" fill="#d32f2f" style={{ animation: 'stripeGlow 2s ease-in-out infinite 0.3s' }} />
            <rect x="58" y="0" width="16" height="140" fill="#111" />
            <rect x="74" y="0" width="16" height="140" fill="#d32f2f" style={{ animation: 'stripeGlow 2s ease-in-out infinite 0.6s' }} />
            <rect x="90" y="0" width="16" height="140" fill="#111" />
            <rect x="106" y="0" width="16" height="140" fill="#d32f2f" />
          </g>
          {/* Football icon */}
          <circle cx="60" cy="70" r="18" fill="#fff" opacity="0.95" />
          <path d="M60 52 L66 60 L60 64 L54 60 Z M72 64 L74 72 L68 76 L64 70 Z M48 64 L52 70 L46 76 L44 72 Z M54 80 L60 76 L66 80 L64 88 L56 88 Z" fill="#222" />
        </svg>
      </div>

      {/* Team name */}
      <h1 style={{
        fontSize: 26, fontWeight: 800, color: '#fff', marginTop: 24,
        animation: 'textIn 0.8s ease-out 0.8s both', letterSpacing: 2,
      }}>
        BROMMAPOJKARNA
      </h1>

      <p style={{
        fontSize: 14, color: '#d32f2f', marginTop: 8,
        animation: 'textIn 0.8s ease-out 1.2s both', letterSpacing: 4, textTransform: 'uppercase',
      }}>
        Coach Lineup Tool
      </p>

      <div style={{
        width: 40, height: 3, background: '#d32f2f', marginTop: 20, borderRadius: 2,
        animation: 'textIn 0.8s ease-out 1.6s both',
      }} />
    </div>
  )
}
