import { useEffect, useState } from 'react'
import { applyTheme, getStoredTheme, systemTheme, THEME_KEY } from '../../theme.js'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const stored = getStoredTheme()
    setLocked(Boolean(stored))
    setTheme(stored ?? systemTheme())
  }, [])

  useEffect(() => {
    if (!theme) return
    applyTheme(theme)
    if (locked) localStorage.setItem(THEME_KEY, theme)
  }, [theme, locked])

  useEffect(() => {
    if (locked) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setTheme(systemTheme())
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [locked])

  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className="theme-toggle-button"
      onClick={() => {
        setLocked(true)
        setTheme(next)
      }}
    >
      {next === 'dark' ? 'Dark' : 'Light'}
    </button>
  )
}
