import { useEffect, useState } from 'react'

function preferredTheme() {
  const saved = localStorage.getItem('gvinage-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(preferredTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('gvinage-theme', next)
    setTheme(next)
  }
  return <button className="button button--theme" onClick={toggle}>{theme === 'dark' ? '☀ מצב בהיר' : '☾ מצב כהה'}</button>
}
