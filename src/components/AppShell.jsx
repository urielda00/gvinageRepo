import ThemeToggle from './ThemeToggle'

export default function AppShell({ onRefresh, onLogout, refreshing, activeTab, onTabChange, children }) {
  return <div className="app-shell">
    <header className="topbar">
      <div className="topbar__title"><p className="eyebrow">מערכת אוטומציית הזמנות</p><h1>לוח בקרה להזמנות</h1></div>
      <div className="header-brand"><img src="/gvinage-logo-transparent.png" alt="GVINAAGE" /></div>
      <div className="header-actions">
        <button className="button button--refresh" onClick={onRefresh} disabled={refreshing}>{refreshing ? 'מרענן…' : '↻ רענון'}</button>
        <ThemeToggle />
        <button className="button button--logout" onClick={onLogout}>התנתקות</button>
      </div>
    </header>
    <nav className="tabs" aria-label="תצוגות ראשיות">
      <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => onTabChange('orders')}>הזמנות</button>
      <button className={activeTab === 'errors' ? 'active' : ''} onClick={() => onTabChange('errors')}>שגיאות אוטומציה</button>
    </nav>
    <main>{children}</main>
  </div>
}
