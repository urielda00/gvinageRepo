import { AuthProvider, useAuth } from './auth/AuthProvider'
import { hasSupabaseConfig } from './lib/supabaseClient'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LoadingState from './components/LoadingState'
import ErrorNotice from './components/ErrorNotice'

function AppContent() {
  const { session, loading } = useAuth()
  if (!hasSupabaseConfig) return <main className="config-page"><ErrorNotice>חסרים פרטי חיבור ל-Supabase. הוסיפו לקובץ <code>.env</code> כתובת URL ומפתח anon.</ErrorNotice></main>
  if (loading) return <main className="center-page"><LoadingState label="בודק הרשאת התחברות…" /></main>
  return session ? <DashboardPage /> : <LoginPage />
}
export default function App() { return <AuthProvider><AppContent /></AuthProvider> }
