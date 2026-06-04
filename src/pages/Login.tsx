import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, browserPopupRedirectResolver } from 'firebase/auth'
import { auth } from '../firebase'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const handleGoogle = () => {
    setError('')
    signInWithPopup(auth, new GoogleAuthProvider(), browserPopupRedirectResolver).catch(e => {
      setError(e.message)
    })
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setMessage('')
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setMessage('Password reset email sent! Check your inbox.')
      setTimeout(() => { setShowReset(false); setMessage('') }, 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  if (showReset) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 360, border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Reset Password</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>Enter your email and we'll send you a reset link.</p>
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="email" placeholder="Email address" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
            <button type="submit" style={{ background: '#d32f2f', color: '#fff' }}>Send Reset Link</button>
          </form>
          <button onClick={() => { setShowReset(false); setError('') }} style={{ background: 'transparent', color: 'var(--text2)', marginTop: 16, fontSize: 13 }}>
            ← Back to login
          </button>
          {message && <p style={{ color: '#4CAF50', marginTop: 12, fontSize: 13 }}>{message}</p>}
          {error && <p style={{ color: '#f44', marginTop: 12, fontSize: 13 }}>{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 360, border: '1px solid var(--card-border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/bp-logo.jpg" alt="BP" style={{ width: 56, height: 56, borderRadius: 12, marginBottom: 12, objectFit: 'cover' }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>BP Lineup</h1>
          <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4 }}>Coaching tool · P18-8</p>
        </div>

        <button onClick={handleGoogle} style={{
          background: '#fff', color: '#333', width: '100%', padding: '13px',
          fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Sign in with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
          <span style={{ color: '#555', fontSize: 11 }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
        </div>

        <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" style={{ background: '#d32f2f', color: '#fff', width: '100%' }}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
          <button onClick={() => setShowReset(true)} style={{ background: 'transparent', color: 'var(--text3)', padding: 0, fontSize: 12 }}>
            Forgot password?
          </button>
          <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'transparent', color: '#d32f2f', padding: 0, fontSize: 12 }}>
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {error && <p style={{ color: '#f44', marginTop: 12, fontSize: 13 }}>{error}</p>}
      </div>
    </div>
  )
}
