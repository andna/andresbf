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

  // Desktop (landscape): the hero's parallax circle becomes the theme toggle, drawn as the
  // sun/moon icon. On mobile the circle is the menu button, so it's left alone there.
  useEffect(() => {
    const desktop = window.matchMedia('(orientation: landscape)')
    const circle = document.querySelector('.header-circle')
    const label = () => {
      if (!(circle instanceof HTMLElement)) return
      // Desktop CSS draws the circle as this icon instead of a disc.
      circle.style.setProperty('--theme-icon', `url("/icons/${next === 'dark' ? 'moon' : 'sun'}.svg")`)
      if (desktop.matches) {
        circle.setAttribute('aria-hidden', 'false')
        circle.setAttribute('aria-label', next === 'dark' ? 'Switch to dark theme' : 'Switch to light theme')
      } else if (!document.documentElement.dataset.mobileHeader) {
        circle.setAttribute('aria-hidden', 'true')
        circle.removeAttribute('aria-label')
      }
    }
    const onClick = (event) => {
      if (!desktop.matches) return
      if (!(event.target instanceof Element) || !event.target.closest('.header-circle')) return
      setLocked(true)
      setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
    }
    label()
    document.addEventListener('click', onClick)
    desktop.addEventListener('change', label)
    return () => {
      document.removeEventListener('click', onClick)
      desktop.removeEventListener('change', label)
    }
  }, [next])

  return (
    <button
      type="button"
      className="theme-toggle-button chrome-button"
      aria-label={next === 'dark' ? 'Switch to dark theme' : 'Switch to light theme'}
      title={next === 'dark' ? 'Dark' : 'Light'}
      onClick={() => {
        setLocked(true)
        setTheme(next)
      }}
    >
      <span
        className="theme-toggle-icon"
        aria-hidden="true"
        style={{ '--theme-icon': `url("/icons/${next === 'dark' ? 'moon' : 'sun'}.svg")` }}
      />
    </button>
  )
}
