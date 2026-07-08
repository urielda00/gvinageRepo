import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ErrorNotice from '../components/ErrorNotice'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault(); setLoading(true); setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) setError('פרטי ההתחברות לא נכונים או שאין הרשאה למשתמש הזה.')
    setLoading(false)
  }
  return <main className="login-page"><section className="login-card">
    <img className="login-logo" src="/gvinage-logo-transparent.png" alt="GVINAAGE" />
    <h1>ברוכים הבאים</h1><p>התחברו כדי לצפות בהזמנות ובמצב האוטומציה</p>
    <form onSubmit={submit}>
      <label htmlFor="email">כתובת מייל</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" dir="ltr" />
      <label htmlFor="password">סיסמה</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" dir="ltr" />
      {error && <ErrorNotice>{error}</ErrorNotice>}
      <button className="button button--primary button--wide" disabled={loading}>{loading ? 'מתחבר…' : 'התחברות'}</button>
    </form>
  </section></main>
}
