import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleGoogle = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(e => setError(e.message))
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8, color: '#d32f2f' }}>⚽ BP Football Lineup</h1>
      <p style={{ color: '#aaa', marginBottom: 32 }}>BrommaPojkarna Coach Tool</p>

      <button onClick={handleGoogle} style={{ background: '#fff', color: '#333', padding: '12px 24px', fontSize: 16, marginBottom: 20 }}>
        Sign in with Google
      </button>

      <div style={{ color: '#666', marginBottom: 20 }}>— or —</div>

      <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{ background: '#d32f2f', color: '#fff' }}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'transparent', color: '#d32f2f', marginTop: 12 }}>
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </button>

      {error && <p style={{ color: '#f44', marginTop: 12, fontSize: 13 }}>{error}</p>}
    </div>
  )
}
