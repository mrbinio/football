import { useState } from 'react'

const templates = [
  {
    title: 'Match inställd',
    icon: '🚫',
    message: 'Hej alla! Tyvärr är matchen den [datum] inställd. Vi återkommer med ny information. Tack för förståelsen! /Tränarna',
  },
  {
    title: 'Ändrad tid',
    icon: '🕐',
    message: 'Hej! Observera ändrad tid för [match/träning] den [datum]. Ny tid: [tid]. Plats: [plats]. Hör av er om ni har frågor! /Tränarna',
  },
  {
    title: 'Turnering',
    icon: '🏆',
    message: 'Hej! Vi är anmälda till turnering den [datum] på [plats]. Samling kl [tid]. Ta med: Dricka, mellanmål, hela matställ + extra strumpor. Meddela om ert barn INTE kan delta. /Tränarna',
  },
  {
    title: 'Påminnelse match',
    icon: '⚽',
    message: 'Hej! Påminnelse om morgondagens match.\n\n📅 [datum]\n⏰ Samling: [tid]\n📍 Plats: [plats]\n👕 Hela matställ + benskydd\n\nKom i tid! Ses där! /Tränarna',
  },
  {
    title: 'Samling & info',
    icon: '📍',
    message: 'Hej! Info inför [match/träning]:\n\nSamling: [tid] vid [plats]\nAvfärd: [tid]\nHemma ca: [tid]\n\nMeddela om ert barn inte kan komma. /Tränarna',
  },
  {
    title: 'Träning inställd',
    icon: '❄️',
    message: 'Hej! Träningen [datum] är tyvärr inställd pga [anledning]. Nästa träning är [datum] som vanligt. /Tränarna',
  },
  {
    title: 'Bra jobbat!',
    icon: '🌟',
    message: 'Hej alla! Stort tack till alla spelare för en fantastisk insats idag! Resultatet blev [resultat] men viktigast är att alla kämpade och hade kul. Bra jobbat! ⚽💪 /Tränarna',
  },
]

export default function Templates() {
  const [expanded, setExpanded] = useState<number | null>(null)

  const sendWhatsApp = (message: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  const copyToClipboard = (message: string) => {
    navigator.clipboard.writeText(message)
    alert('Kopierat!')
  }

  return (
    <div style={{ padding: 20, paddingBottom: 80, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Message Templates</h2>
      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Tap to preview, then send via WhatsApp</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {templates.map((t, i) => (
          <div key={i}>
            <div onClick={() => setExpanded(expanded === i ? null : i)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 14px', borderRadius: 16, cursor: 'pointer',
              background: expanded === i ? 'rgba(76,82,46,0.08)' : 'var(--card)',
              border: expanded === i ? '1px solid rgba(76,82,46,0.3)' : '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{t.title}</span>
              <span style={{ color: 'var(--text3)', fontSize: 12 }}>{expanded === i ? '▾' : '▸'}</span>
            </div>

            {expanded === i && (
              <div style={{
                marginTop: 4, padding: 14, borderRadius: 16,
                background: 'var(--card)', border: '1px solid var(--card-border)',
              }}>
                <pre style={{
                  fontSize: 12, color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                  fontFamily: 'inherit', marginBottom: 12,
                }}>{t.message}</pre>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => sendWhatsApp(t.message)} style={{ flex: 1, background: '#25D366', color: '#fff', fontSize: 12 }}>
                    📱 WhatsApp
                  </button>
                  <button onClick={() => copyToClipboard(t.message)} style={{ flex: 1, background: 'var(--card)', color: 'var(--text2)', border: '1px solid var(--card-border)', fontSize: 12 }}>
                    📋 Kopiera
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
