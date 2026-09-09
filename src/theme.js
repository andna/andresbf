export const THEME_KEY = 'theme'

export function getStoredTheme() {
  const pref = localStorage.getItem(THEME_KEY)
  if (pref === 'light' || pref === 'dark') return pref
  return null
}

export function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
}

const toRgb = (value) => {
  const v = value.trim()
  if (v.startsWith('#')) {
    const raw = v.slice(1)
    const hex = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
    const n = parseInt(hex, 16)
    return [n >> 16, (n >> 8) & 255, n & 255]
  }
  const m = v.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])]
  return [0, 0, 0]
}

const toHex = ([r, g, b]) =>
  `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')}`

export function mixHex(a, b, amountB) {
  const [ar, ag, ab] = toRgb(a)
  const [br, bg, bb] = toRgb(b)
  const t = amountB
  return toHex([
    ar * (1 - t) + br * t,
    ag * (1 - t) + bg * t,
    ab * (1 - t) + bb * t,
  ])
}

export function readThemeColors() {
  const styles = getComputedStyle(document.documentElement)
  const accent = styles.getPropertyValue('--accent-color').trim() || '#1a5564'
  const bg = styles.getPropertyValue('--bg-color').trim() || '#ebebe5'
  return {
    accent,
    bg,
    hover: mixHex(accent, bg, 0.8),
  }
}
