import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import CanvasScene from './CanvasScene.jsx'
import { helixPlaneY } from './Helix.jsx'
import { hexToRgb, rgbToHex, readThemeColors } from '../../theme.js'
import './navigator.css'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { mobileHelixLabel, mobileLogoLabel } from '../../data/sections.js'

const valueSkewDesktop = -0.67
const valueSkewMobile = -1.3
const planesPerCycleDesktop = 6
const planesPerCycleMobile = 3
const planeHeightDesktop = 0.5
const planeHeightMobile = 0.75

const diagonalBandClip = (w, h, rotDeg, halfFrac) => {
  const cx = w / 2
  const cy = h / 2
  const alpha = ((90 - rotDeg) * Math.PI) / 180
  const nx = -Math.sin(alpha)
  const ny = Math.cos(alpha)
  const half = Math.min(w, h) * halfFrac
  const corners = [[0, 0], [w, 0], [w, h], [0, h]]
  const inside = (x, y) => Math.abs((x - cx) * nx + (y - cy) * ny) <= half + 0.25
  const raw = []
  for (let i = 0; i < 4; i += 1) {
    const a = corners[i]
    const b = corners[(i + 1) % 4]
    if (inside(a[0], a[1])) raw.push(a)
    const da = (a[0] - cx) * nx + (a[1] - cy) * ny
    const db = (b[0] - cx) * nx + (b[1] - cy) * ny
    const span = db - da
    if (Math.abs(span) < 1e-8) continue
    for (const d of [-half, half]) {
      const t = (d - da) / span
      if (t >= -1e-6 && t <= 1 + 1e-6) {
        raw.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])])
      }
    }
  }
  const pts = raw.filter((p, i) => (
    raw.findIndex((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.6) === i
  ))
  pts.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx))
  if (pts.length < 3) return ''
  return `polygon(${pts.map(([x, y]) => `${((x / w) * 100).toFixed(3)}% ${((y / h) * 100).toFixed(3)}%`).join(', ')})`
}

const helixCenter = { scale: 0.95, offsetPx: [0, 0] }
const helixMobile = { scale: 0.25, offsetPx: [0, 0] }

// Canvas resolution is the main cost on machines without a GPU, so the cap is
// lower there and the monitor below steps the resolution up or down at runtime.
const DPR_MAX = 1.5
const DPR_MAX_SOFTWARE = 1
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|software|softpipe/i

// Software WebGL (SwiftShader, llvmpipe) is detected once, before the Canvas
// is created, because `gl` props are only applied at creation time.
function detectSoftwareGL() {
  if (typeof document === 'undefined') return false
  try {
    const probe = document.createElement('canvas')
    const gl = probe.getContext('webgl')
    if (!gl) return false
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return SOFTWARE_RENDERER.test(renderer)
  } catch {
    return false
  }
}

export default function Navigator({ sections }) {
  const helixSections = sections
  const [softwareGL] = useState(detectSoftwareGL)
  const dprMax = softwareGL ? DPR_MAX_SOFTWARE : DPR_MAX
  const [dpr, setDpr] = useState(dprMax)
  const glProps = useMemo(() => ({ alpha: true, antialias: !softwareGL }), [softwareGL])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [hoveredPlaneIdx, setHoveredPlaneIdx] = useState(-1)
  const [showTips, setShowTips] = useState(false)
  const tipsArmedRef = useRef(false)
  const hoveredRef = useRef(-1)
  const setHoveredPlane = (index, from = index) => {
    if (index < 0 && hoveredRef.current !== from) return false
    hoveredRef.current = index
    setHoveredPlaneIdx(index)
    if (index < 0 || !tipsArmedRef.current) {
      setShowTips(false)
      return true
    }
    setShowTips(true)
    return true
  }
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(orientation: portrait)').matches)
  const labelListRef = useRef(null)
  const portfolioWordRef = useRef(null)

  useLayoutEffect(() => {
    if (!isMobile) return undefined
    const place = () => {
      const list = labelListRef.current
      const word = portfolioWordRef.current
      if (!(list instanceof HTMLElement) || !(word instanceof HTMLElement)) return
      const items = [...list.querySelectorAll(':scope > li.is-portfolio')]
      const first = items[0]
      const last = items[items.length - 1]
      if (!(first instanceof HTMLElement) || !(last instanceof HTMLElement)) return
      const wrap = word.parentElement
      if (!(wrap instanceof HTMLElement)) return
      const glyphBox = (el) => {
        const node = el.querySelector('button') || el
        const range = document.createRange()
        range.selectNodeContents(node)
        return range.getBoundingClientRect()
      }
      const before = first.previousElementSibling
      const after = last.nextElementSibling
      if (!(before instanceof HTMLElement) || !(after instanceof HTMLElement)) return
      const wrapRect = wrap.getBoundingClientRect()
      const beforeBox = glyphBox(before)
      const afterBox = glyphBox(after)
      const under = Math.max(...items.map((item) => glyphBox(item).bottom))
      const firstBox = glyphBox(first)
      const lastBox = glyphBox(last)
      const spanCenter = (firstBox.left + firstBox.right + lastBox.left + lastBox.right) / 4 - wrapRect.left
      const width = Math.max(0, afterBox.left - beforeBox.right)
      const glyphs = () => {
        const range = document.createRange()
        range.selectNodeContents(word)
        return range.getBoundingClientRect()
      }
      word.style.top = `${under - wrapRect.top + 8}px`
      word.style.letterSpacing = '0px'
      word.style.width = 'max-content'
      word.style.left = '0px'
      const natural = glyphs().width
      const gaps = Math.max(1, (word.textContent || '').length - 1)
      word.style.letterSpacing = `${natural > 0 ? Math.max(0, (width - natural) / gaps) * 0.3 : 0}px`
      const placed = glyphs()
      word.style.left = `${spanCenter - (placed.left + placed.right) / 2 + wrapRect.left + 14}px`
    }
    place()
    document.fonts?.ready.then(place)
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [isMobile])

  useEffect(() => {
    const onMove = () => {
      tipsArmedRef.current = true
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
    tipsArmedRef.current = false
    setShowTips(false)
  }, [selectedIndex])
  const [view, setView] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }))
  const [textFront, setTextFront] = useState({ skewX: -0.07, skewY: -0.17, rotDeg: 8 })
  const [textBack, setTextBack] = useState({ skewX: 0.01, skewY: 0.08, rotDeg: 13 })
  const [scaleFit, setScaleFit] = useState(0.67)
  const [screenRotDeg, setScreenRotDeg] = useState(50)
  const [gizmoScale, setGizmoScale] = useState(0.6)
  const [gizmoOpacity, setGizmoOpacity] = useState(0.75)
  const [contactCloseOpacity, setContactCloseOpacity] = useState(0.6)
  const [contactFarOpacity, setContactFarOpacity] = useState(0.7)
  const [secondaryRgb, setSecondaryRgb] = useState(() => hexToRgb(readThemeColors().secondary))
  const [showDebug, setShowDebug] = useState(false)
  const restScaleFit = 0.42
  const restScreenRotDeg = 0.5
  const restOffsetXFrac = 0.3
  const scrollSpeed = 1.5
  const heroTextBack = { skewX: -0.61, skewY: -0.07, rotDeg: 57 }
  const [scrollPoseT, setScrollPoseT] = useState(0)
  const canvasRef = useRef(null)
  const mobileFitRef = useRef(1)
  const [mobileFit, setMobileFit] = useState(1)
  const selectedIndexRef = useRef(0)
  const pendingSelectRef = useRef(0)
  const selectTimerRef = useRef(0)
  const scrollLockRef = useRef(false)
  const scrollTargetRef = useRef(null)
  const poseRef = useRef({
    t: 0,
    scale: 0.01,
    screenRoll: (50 * Math.PI) / 180,
    textBack: { skewX: -0.61, skewY: -0.07, rot: (57 * Math.PI) / 180 },
  })
  const poseParamsRef = useRef(null)
  const poseBucketRef = useRef(0)
  const applyVisualPoseRef = useRef(() => {})
  const applyScrollVisualsRef = useRef(() => {})
  const applyPortfolioTitlePinRef = useRef(() => {})
  const applyHeaderParallaxRef = useRef(() => {})
  const measurePortfolioPinRef = useRef(() => {})
  const portfolioPinRef = useRef({
    block: null,
    cards: [],
  })
  const kickVisualLerpRef = useRef(() => {})
  const clampScrollRef = useRef((y) => Math.max(0, y))
  const lenisRef = useRef(null)
  const visualScrollRef = useRef(0)
  const targetScrollRef = useRef(0)
  const visualRafRef = useRef(0)
  const visualLastTsRef = useRef(0)
  const scrollIndexRef = useRef(0)
  const sectionAnimRef = useRef('')
  const headerParallaxRef = useRef({ el: null, last: null })
  const mobileHeaderRef = useRef('origin')
  const mobileHeaderTRef = useRef(0)
  const mobileHeaderTargetRef = useRef(0)
  const mobileHeaderRafRef = useRef(0)
  const mobileFontRef = useRef(0)
  const mobileViewRef = useRef(0)
  const mobileScrollbarRef = useRef(0)
  const mobileNudgeRef = useRef(Number.NaN)
  const mobileSpanRef = useRef(Number.NaN)
  const mobileFitTimerRef = useRef(0)
  const mobilePinClearedRef = useRef(false)
  const mobileAnchorsRef = useRef({ key: '', at: 0, tops: null, range: 0 })
  const expandedHeaderRef = useRef(0)
  const expandedRowRef = useRef(0)
  const compactHeaderRef = useRef(0)
  const mobileIndexAtRef = useRef(() => ({ index: 0, start: 0, nextTop: Infinity }))
  const syncHeaderHeightRef = useRef(() => {})
  const applyMobileHeaderPoseRef = useRef(() => {})
  const orbitModeRef = useRef('scroll')
  const wheelAtRef = useRef(0)
  const clickAnimRef = useRef(null)
  const portfolioTabHoldRef = useRef(null)
  const clickPoseDuration = 0.85
  const poseRange = () => {
    const cached = mobileAnchorsRef.current.range
    if (isMobile && cached > 0) return cached
    const first = document.getElementById(helixSections[0]?.id)
    const height = first instanceof HTMLElement ? first.offsetHeight : 0
    return Math.max(1, height || window.innerHeight)
  }
  const poseT = isMobile ? 0 : Math.min(1, Math.max(0, scrollPoseT))
  const liveScaleFit = scaleFit + (restScaleFit - scaleFit) * poseT
  const liveScreenRotDeg = screenRotDeg + (restScreenRotDeg - screenRotDeg) * poseT
  const liveOffsetX = -Math.round(view.w * restOffsetXFrac) * poseT
  const liveContentRot = -screenRotDeg * (1 - poseT)
  const liveContentY = 3 * (1 - poseT)
  const liveTextBack = {
    skewX: heroTextBack.skewX + (textBack.skewX - heroTextBack.skewX) * poseT,
    skewY: heroTextBack.skewY + (textBack.skewY - heroTextBack.skewY) * poseT,
    rotDeg: heroTextBack.rotDeg + (textBack.rotDeg - heroTextBack.rotDeg) * poseT,
  }
  const valueSkew = isMobile ? valueSkewMobile : valueSkewDesktop
  const planesPerCycle = isMobile ? planesPerCycleMobile : planesPerCycleDesktop
  const planeHeight = isMobile ? planeHeightMobile : planeHeightDesktop
  const orthoZoom = 200
  const pose = isMobile ? helixMobile : helixCenter
  const mobileScale = pose.scale * (isMobile ? mobileFit : 1)
  const planeWidth = 0.5
  const worldSpan =
    Math.abs(
      helixPlaneY(Math.max(0, helixSections.length - 1), valueSkew, planeWidth, planeHeight) -
      helixPlaneY(0, valueSkew, planeWidth, planeHeight)
    ) + planeHeight
  const diagonal = Math.hypot(view.w, view.h)
  const scale = isMobile ? mobileScale : (diagonal * liveScaleFit) / (worldSpan * orthoZoom)
  const screenRoll = (liveScreenRotDeg * Math.PI) / 180
  const textFrontRad = {
    skewX: textFront.skewX,
    skewY: textFront.skewY,
    rot: (textFront.rotDeg * Math.PI) / 180,
  }
  const textBackRad = {
    skewX: liveTextBack.skewX,
    skewY: liveTextBack.skewY,
    rot: (liveTextBack.rotDeg * Math.PI) / 180,
  }
  const offsetPx = pose.offsetPx
  const hitBoxNarrowness = 0.28
  const layoutW = document.documentElement.clientWidth
  const layoutH = document.documentElement.clientHeight
  const contentLeft = layoutW / 2 + Math.min(layoutW, layoutH) * hitBoxNarrowness

  poseParamsRef.current = {
    isMobile,
    view: { w: layoutW, h: layoutH },
    scaleFit,
    restScaleFit,
    screenRotDeg,
    restScreenRotDeg,
    restOffsetXFrac,
    contentLeft,
    hitBoxNarrowness,
    worldSpan,
    orthoZoom,
    diagonal,
    mobileScale,
    heroTextBack,
    restTextBack: textBack,
  }

  const secondaryColor = rgbToHex(secondaryRgb)

  useEffect(() => {
    document.documentElement.style.setProperty('--secondary-color', secondaryColor)
  }, [secondaryColor])

  useEffect(() => {
    const heroWidth = Math.hypot(view.w, view.h) * scaleFit * Math.sin((screenRotDeg * Math.PI) / 180) * 0.9
    document.documentElement.style.setProperty('--helix-hero-width', `${heroWidth}px`)
  }, [view.w, view.h, scaleFit, screenRotDeg])

  useEffect(() => {
    const sync = () => {
      document.documentElement.style.removeProperty('--secondary-color')
      setSecondaryRgb(hexToRgb(readThemeColors().secondary))
    }
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const setMobileHeaderMode = (mode) => {
    const root = document.documentElement
    if (!isMobile) {
      if (root.dataset.mobileHeader) delete root.dataset.mobileHeader
      document.body.style.removeProperty('overflow')
      mobileHeaderRef.current = 'origin'
      return
    }
    if (mobileHeaderRef.current === mode && root.dataset.mobileHeader === mode) return
    mobileHeaderRef.current = mode
    root.dataset.mobileHeader = mode
    const circle = document.querySelector('.header-circle')
    if (circle instanceof HTMLElement) {
      const isMenuBtn = mode === 'scrolled' || mode === 'menu'
      circle.setAttribute('aria-hidden', isMenuBtn ? 'false' : 'true')
      if (isMenuBtn) {
        circle.setAttribute('aria-expanded', mode === 'menu' ? 'true' : 'false')
        circle.setAttribute('aria-label', mode === 'menu' ? 'Close menu' : 'Open menu')
      } else {
        circle.removeAttribute('aria-expanded')
        circle.removeAttribute('aria-label')
      }
    }
    if (mode === 'menu') {
      if (mobileHeaderRafRef.current) {
        cancelAnimationFrame(mobileHeaderRafRef.current)
        mobileHeaderRafRef.current = 0
      }
      document.body.style.overflow = 'hidden'
      root.style.setProperty('--mobile-header-t', '0')
      mobileHeaderTRef.current = 0
      if (expandedHeaderRef.current > 0) {
        root.style.setProperty('--mobile-header-bg', `${expandedHeaderRef.current}px`)
      }
    } else {
      document.body.style.removeProperty('overflow')
    }
    requestAnimationFrame(() => syncHeaderHeightRef.current())
  }

  const stepMobileHeaderRef = useRef(() => {})
  stepMobileHeaderRef.current = () => {
    mobileHeaderRafRef.current = 0
    if (!isMobile || mobileHeaderRef.current === 'menu') return
    const target = mobileHeaderTargetRef.current
    const current = mobileHeaderTRef.current
    const next = Math.abs(target - current) < 0.004 ? target : current + (target - current) * 0.2
    mobileHeaderTRef.current = next
    const root = document.documentElement
    root.style.setProperty('--mobile-header-t', `${next}`)
    const start = expandedHeaderRef.current
    const end = compactHeaderRef.current
    if (start > 0 && end > 0) {
      root.style.setProperty('--mobile-header-bg', `${start + (end - start) * next}px`)
    }
    setMobileHeaderMode(next <= 0.001 ? 'origin' : next >= 0.999 ? 'scrolled' : 'tween')
    if (next !== target) mobileHeaderRafRef.current = requestAnimationFrame(() => stepMobileHeaderRef.current())
  }

  const applyMobileHeaderPose = (scrollY) => {
    if (!isMobile) return
    if (mobileHeaderRef.current === 'menu') return
    mobileHeaderTargetRef.current = Math.min(1, Math.max(0, scrollY / poseRange()))
    if (!mobileHeaderRafRef.current) {
      mobileHeaderRafRef.current = requestAnimationFrame(() => stepMobileHeaderRef.current())
    }
  }

  applyMobileHeaderPoseRef.current = applyMobileHeaderPose

  const applyLayoutPose = (offsetX, contentRot, contentY) => {
    const stage = document.querySelector('.stage')
    const content = document.querySelector('.content')
    if (!(stage instanceof HTMLElement) || !(content instanceof HTMLElement)) return
    if (isMobile) {
      stage.style.removeProperty('transform')
      stage.style.removeProperty('--content-left')
      content.style.removeProperty('transform')
      content.style.removeProperty('width')
      content.style.removeProperty('right')
      document.documentElement.style.removeProperty('--chrome-item-rot')
      if (canvasRef.current) canvasRef.current.style.removeProperty('clip-path')
      const track = document.querySelector('.content-track')
      if (track instanceof HTMLElement) track.style.removeProperty('transform')
      return
    }
    const left = poseParamsRef.current?.contentLeft ?? contentLeft
    const viewW = poseParamsRef.current?.view.w ?? document.documentElement.clientWidth
    const theta = (contentRot * Math.PI) / 180
    const cos = Math.cos(theta)
    const cover = (viewW - (offsetX + left)) / (cos > 0.2 ? cos : 1)
    stage.style.transform = `translate3d(${offsetX}px, 0, 0)`
    stage.style.setProperty('--content-left', `${left}px`)
    content.style.right = 'auto'
    content.style.width = `${Math.ceil(Math.max(viewW - left, cover))}px`
    content.style.transform = `rotate(${contentRot}deg) translate3d(0, ${contentY}vh, 0)`
  }

  const applyVisualPose = (t) => {
    const p = poseParamsRef.current
    if (!p) return
    const clamped = Math.min(1, Math.max(0, t))
    const liveScaleFitNow = p.scaleFit + (p.restScaleFit - p.scaleFit) * clamped
    const liveScreenRotNow = p.screenRotDeg + (p.restScreenRotDeg - p.screenRotDeg) * clamped
    const offsetX = -p.view.w * p.restOffsetXFrac * clamped
    applyLayoutPose(offsetX, -p.screenRotDeg * (1 - clamped), 3 * (1 - clamped))
    poseRef.current.t = clamped
    poseRef.current.scale = p.isMobile
      ? p.mobileScale
      : (p.diagonal * liveScaleFitNow) / (p.worldSpan * p.orthoZoom)
    poseRef.current.screenRoll = (liveScreenRotNow * Math.PI) / 180
    const heroBack = p.heroTextBack
    const restBack = p.restTextBack
    if (heroBack && restBack) {
      const tb = poseRef.current.textBack
      tb.skewX = heroBack.skewX + (restBack.skewX - heroBack.skewX) * clamped
      tb.skewY = heroBack.skewY + (restBack.skewY - heroBack.skewY) * clamped
      tb.rot = ((heroBack.rotDeg + (restBack.rotDeg - heroBack.rotDeg) * clamped) * Math.PI) / 180
    }
    if (canvasRef.current && !p.isMobile) {
      canvasRef.current.style.clipPath = diagonalBandClip(
        p.view.w,
        p.view.h,
        liveScreenRotNow,
        p.hitBoxNarrowness
      )
    }
  }

  const measurePortfolioPin = () => {
    const cache = portfolioPinRef.current
    const block = document.querySelector('.portfolio-block')
    cache.block = block instanceof HTMLElement ? block : null
    cache.chrome = cache.block?.querySelector(':scope > .portfolio-chrome')
    cache.cards = cache.block
      ? [...cache.block.querySelectorAll(':scope > section')]
      : []
    cache.tabs = cache.chrome instanceof HTMLElement
      ? [...cache.chrome.querySelectorAll('.portfolio-tab')]
      : []
    if (cache.chrome instanceof HTMLElement) cache.chrome.style.removeProperty('transform')
    cache.cards.forEach((card) => {
      card.style.removeProperty('transform')
      card.style.removeProperty('height')
      card.style.removeProperty('min-height')
      card.style.removeProperty('margin-top')
      card.style.removeProperty('z-index')
    })
    if (cache.block instanceof HTMLElement) cache.block.style.removeProperty('padding-bottom')
  }

  const applyPortfolioTitlePin = (contentY) => {
    if (isMobile && mobilePinClearedRef.current) return
    const cache = portfolioPinRef.current
    if (!cache.block) measurePortfolioPin()
    const { block, cards, chrome, tabs } = cache
    if (!(block instanceof HTMLElement) || !cards.length) return
    const y = isMobile ? window.scrollY : contentY
    if (isMobile) {
      if (chrome instanceof HTMLElement) {
        if (chrome.style.transform) chrome.style.removeProperty('transform')
        const stick = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-header-bg')) || 0
        const chromeBox = chrome.getBoundingClientRect()
        const stuck = chromeBox.top <= stick + 1 && chromeBox.bottom > stick
        chrome.classList.toggle('is-stuck', stuck)
        const probe = chromeBox.bottom
        // Read every card first, then write classes: toggling a class between reads
        // forces a synchronous layout per card on every scroll frame.
        const tops = cards.map((card) => card.getBoundingClientRect().top)
        let front = -1
        tops.forEach((top, index) => {
          if (top <= probe + 1) front = index
        })
        cards.forEach((card, index) => card.classList.toggle('is-clipped', tops[index] < probe))
        const hold = portfolioTabHoldRef.current
        const current = hold != null ? hold : stuck ? front : -1
        cards.forEach((card, index) => {
          card.classList.toggle('is-current', index === current)
        })
        tabs.forEach((item, index) => {
          if (item instanceof HTMLElement) item.classList.toggle('is-active', hold != null ? index === hold : stuck && index === front)
        })
      }
      return
    }
    mobilePinClearedRef.current = false
    const stick = 0
    const origin = (el) => contentBoxTop(el instanceof HTMLElement ? el : block)
    cards.forEach((card) => {
      if (card.style.height) card.style.removeProperty('height')
      if (card.style.minHeight) card.style.removeProperty('min-height')
      if (card.style.marginTop) card.style.removeProperty('margin-top')
      if (card.style.transform) card.style.removeProperty('transform')
      if (card.style.zIndex) card.style.removeProperty('z-index')
    })
    if (block.style.paddingBottom) block.style.paddingBottom = ''
    if (chrome instanceof HTMLElement) {
      const chromeH = chrome.offsetHeight
      const pin = Math.max(0, stick - (origin(block) - y))
      const end = origin(block) + block.offsetHeight - chromeH - stick
      const release = Math.max(0, y - end)
      const dy = pin - release
      const next = dy ? `translate3d(0, ${dy}px, 0)` : ''
      if (chrome.style.transform !== next) chrome.style.transform = next
      chrome.classList.toggle('is-stuck', dy > 0.5 || (y >= origin(block) - 1 && y <= end))
      const stuck = chrome.classList.contains('is-stuck')
      const probe = stick + chromeH
      // Same batching as the mobile branch: one layout pass, then class writes.
      const tops = cards.map((card) => origin(card) - y)
      let front = -1
      tops.forEach((top, index) => {
        if (top <= probe + 1) front = index
      })
      cards.forEach((card, index) => card.classList.toggle('is-clipped', tops[index] < probe))
      const hold = portfolioTabHoldRef.current
      const current = hold != null ? hold : stuck ? front : -1
      cards.forEach((card, index) => {
        card.classList.toggle('is-current', index === current)
      })
      tabs.forEach((item, index) => {
        if (item instanceof HTMLElement) item.classList.toggle('is-active', hold != null ? index === hold : stuck && index === front)
      })
    }
  }

  measurePortfolioPinRef.current = measurePortfolioPin
  applyPortfolioTitlePinRef.current = applyPortfolioTitlePin

  const applyHeaderParallax = (travel) => {
    const cache = headerParallaxRef.current
    if (!cache.el) {
      const el = document.querySelector('.header-parallax')
      cache.el = el instanceof HTMLElement ? el : null
    }
    if (!(cache.el instanceof HTMLElement)) return
    if (isMobile) {
      if (cache.last != null) {
        cache.el.style.removeProperty('transform')
        cache.last = null
      }
      return
    }
    const y = Math.min(160, Math.max(0, travel * 0.18))
    if (y === cache.last) return
    cache.last = y
    cache.el.style.transform = y ? `translate3d(0, ${y}px, 0)` : ''
  }

  applyHeaderParallaxRef.current = applyHeaderParallax

  const syncSectionAnimation = (index) => {
    const id = helixSections[index]?.id ?? ''
    const next = id === 'me' || id === 'skills' || id === 'experience' ? id : ''
    if (next === sectionAnimRef.current) return
    if (sectionAnimRef.current) {
      document.getElementById(sectionAnimRef.current)?.classList.remove('is-animated')
    }
    if (next) document.getElementById(next)?.classList.add('is-animated')
    sectionAnimRef.current = next
  }

  const layoutTop = (el) => {
    let y = 0
    let node = el
    while (node instanceof HTMLElement) {
      y += node.offsetTop
      node = node.offsetParent
    }
    return y
  }

  const contentBoxTop = (el) => {
    const content = document.querySelector('.content')
    if (!(el instanceof HTMLElement)) return 0
    if (!(content instanceof HTMLElement)) return el.offsetTop
    return layoutTop(el) - layoutTop(content)
  }

  const mobileSectionAnchor = (section) => {
    if (section.id === 'header') return 0
    const heading = section.querySelector('h1, h2')
    const title = heading instanceof HTMLElement ? heading : section
    const pad = parseFloat(getComputedStyle(section).paddingTop) || 0
    const headerPx = compactHeaderRef.current
      || parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-header-bg'))
      || 0
    let cover = headerPx
    if (section.closest('.portfolio-block')) {
      const chrome = document.querySelector('.portfolio-block > .portfolio-chrome')
      const chromeH = chrome instanceof HTMLElement ? chrome.offsetHeight : 0
      const font = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      const cut = chrome instanceof HTMLElement
        ? parseFloat(getComputedStyle(chrome).getPropertyValue('--octagon-cut')) * font || 12
        : 0
      return Math.max(0, layoutTop(section) - (headerPx + Math.max(0, chromeH - cut)))
    }
    const top = layoutTop(title)
    return Math.max(0, top - cover - pad)
  }

  const mobileIndexAt = (scrollY) => {
    const t = mobileHeaderTRef.current
    const key = t <= 0.001 ? '0' : t >= 0.999 ? '1' : 'm'
    const cache = mobileAnchorsRef.current
    const now = performance.now()
    const fresh = cache.tops && cache.key === key && (key !== 'm' || now - cache.at < 120)
    let tops = cache.tops
    if (!fresh) {
      tops = []
      for (let i = 0; i < helixSections.length; i += 1) {
        const section = document.getElementById(helixSections[i].id)
        tops.push(section instanceof HTMLElement ? mobileSectionAnchor(section) : 0)
      }
      const first = document.getElementById(helixSections[0]?.id)
      const height = first instanceof HTMLElement ? first.offsetHeight : 0
      cache.range = Math.max(1, height || window.innerHeight)
      cache.tops = tops
      cache.key = key
      cache.at = now
    }
    let index = 0
    let start = 0
    let nextTop = Infinity
    for (let i = 0; i < tops.length; i += 1) {
      const top = tops[i]
      if (top <= scrollY + 1) {
        index = i
        start = top
        nextTop = Infinity
      } else if (nextTop === Infinity) {
        nextTop = top
      }
    }
    return { index, start, nextTop }
  }

  mobileIndexAtRef.current = mobileIndexAt

  const applyScrollVisuals = (scrollY, poseOverride) => {
    const contentY = isMobile ? scrollY : scrollY * scrollSpeed
    if (!isMobile) {
      const track = document.querySelector('.content-track')
      if (track instanceof HTMLElement) {
        track.style.transform = `translate3d(0, ${-scrollY * scrollSpeed}px, 0)`
      }
    }
    let index = 0
    let start = 0
    let nextTop = Infinity
    if (isMobile) {
      const at = mobileIndexAt(scrollY)
      index = at.index
      start = at.start
      nextTop = at.nextTop
    } else {
      for (let i = 0; i < helixSections.length; i += 1) {
        const section = document.getElementById(helixSections[i].id)
        if (!(section instanceof HTMLElement)) continue
        const top = contentBoxTop(section)
        if (top <= contentY) index = i
        else if (nextTop === Infinity) nextTop = top
      }
      const current = document.getElementById(helixSections[index]?.id)
      start = current instanceof HTMLElement ? current.offsetTop : 0
    }
    const span = Math.max(1, nextTop - start)
    scrollIndexRef.current = index + Math.min(1, Math.max(0, (contentY - start) / span))
    syncSectionAnimation(index)
    applyPortfolioTitlePin(isMobile ? scrollY : contentY)
    applyHeaderParallax(isMobile ? scrollY : contentY)
    if (isMobile && mobileHeaderRef.current !== 'menu') {
      applyMobileHeaderPose(scrollY)
    }
    if (isMobile) {
      const track = document.querySelector('.content-track')
      if (track instanceof HTMLElement) track.style.removeProperty('transform')
      if (canvasRef.current) canvasRef.current.style.removeProperty('clip-path')
      return
    }
    const t = poseOverride == null
      ? Math.min(1, Math.max(0, contentY / poseRange()))
      : Math.min(1, Math.max(0, poseOverride))
    applyVisualPose(t)
    if ((t <= 0 && poseBucketRef.current !== 0) || (t >= 1 && poseBucketRef.current !== 6)) {
      poseBucketRef.current = t >= 1 ? 6 : 0
      setScrollPoseT(t)
    }
  }

  applyVisualPoseRef.current = applyVisualPose
  applyScrollVisualsRef.current = applyScrollVisuals

  useEffect(() => {
    applyVisualPoseRef.current(poseRef.current.t)
    const lenis = lenisRef.current
    if (lenis) applyScrollVisualsRef.current(lenis.scroll)
  }, [isMobile, contentLeft, scaleFit, screenRotDeg, view.w, view.h])

  useEffect(() => () => {
    const stage = document.querySelector('.stage')
    const content = document.querySelector('.content')
    if (stage instanceof HTMLElement) {
      stage.style.removeProperty('transform')
      stage.style.removeProperty('--content-left')
      stage.style.removeProperty('padding-bottom')
    }
    if (content instanceof HTMLElement) {
      content.style.removeProperty('transform')
      content.style.removeProperty('width')
      content.style.removeProperty('right')
    }
    document.querySelectorAll('.portfolio-block > section').forEach((card) => {
      if (card instanceof HTMLElement) card.style.removeProperty('transform')
    })
    const portfolioChrome = document.querySelector('.portfolio-block > .portfolio-chrome')
    if (portfolioChrome instanceof HTMLElement) portfolioChrome.style.removeProperty('transform')
    const parallax = document.querySelector('.header-parallax')
    if (parallax instanceof HTMLElement) parallax.style.removeProperty('transform')
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const chrome = document.querySelector('.chrome')
    const hero = document.querySelector('.header-hero')
    const helix = document.querySelector('.stage-helix')
    const stage = document.querySelector('.stage')
    const shell = document.querySelector('.shell')
    const content = document.querySelector('.content')
    const track = document.querySelector('.content-track')
    if (!isMobile && chrome instanceof HTMLElement) {
      const titleBox = document.querySelector('.header-title-container')
      if (titleBox instanceof HTMLElement && chrome.parentElement !== titleBox) {
        titleBox.appendChild(chrome)
      }
    } else if (chrome instanceof HTMLElement && shell instanceof HTMLElement && stage instanceof HTMLElement && chrome.parentElement !== shell) {
      shell.insertBefore(chrome, stage)
    }
    if (helix instanceof HTMLElement && stage instanceof HTMLElement && helix.parentElement !== stage) {
      const main = stage.querySelector('.content')
      if (main instanceof HTMLElement) stage.insertBefore(helix, main)
      else stage.prepend(helix)
    }
    const parallax = document.querySelector('.header-parallax')
    const clearModeStyles = () => {
      root.style.removeProperty('--chrome-header')
      root.style.removeProperty('--mobile-chrome-h')
      root.style.removeProperty('--mobile-helix-top')
      root.style.removeProperty('--mobile-header-bg')
      root.style.removeProperty('--mobile-header-t')
      root.style.removeProperty('--mobile-art-h')
      root.style.removeProperty('--chrome-item-rot')
      delete root.dataset.mobileHeader
      document.body.style.removeProperty('overflow')
      mobileHeaderRef.current = 'origin'
      if (stage instanceof HTMLElement) {
        stage.style.removeProperty('transform')
        stage.style.removeProperty('--content-left')
        stage.style.removeProperty('padding-bottom')
      }
      if (content instanceof HTMLElement) {
        content.style.removeProperty('transform')
        content.style.removeProperty('width')
        content.style.removeProperty('right')
      }
      if (track instanceof HTMLElement) track.style.removeProperty('transform')
      if (canvasRef.current) canvasRef.current.style.removeProperty('clip-path')
      document.querySelectorAll('.portfolio-block > section').forEach((card) => {
        if (card instanceof HTMLElement) card.style.removeProperty('transform')
      })
      const portfolioChrome = document.querySelector('.portfolio-block > .portfolio-chrome')
      if (portfolioChrome instanceof HTMLElement) portfolioChrome.style.removeProperty('transform')
      if (parallax instanceof HTMLElement) parallax.style.removeProperty('transform')
      portfolioPinRef.current.block = null
      headerParallaxRef.current.last = null
    }
    if (!isMobile) {
      clearModeStyles()
      return undefined
    }
    const syncHeaderHeight = () => {
      const chromeH = chrome instanceof HTMLElement ? chrome.offsetHeight : 0
      const heroH = hero instanceof HTMLElement ? hero.offsetHeight : 0
      const helixH = helix instanceof HTMLElement ? helix.offsetHeight : 0
      const circleEl = document.querySelector('.header-circle')
      const art = document.querySelector('.header-parallax')
      const circleH = circleEl instanceof HTMLElement ? circleEl.offsetHeight : 0
      const mode = mobileHeaderRef.current
      const t = mobileHeaderTRef.current
      if (mode === 'origin' || mode === 'menu' || t <= 0) {
        const rowH = Math.max(chromeH, heroH)
        expandedRowRef.current = rowH
        expandedHeaderRef.current = rowH + helixH
        root.style.setProperty('--mobile-helix-top', `${rowH}px`)
        root.style.setProperty('--chrome-header', `${rowH + helixH}px`)
        if (art instanceof HTMLElement && art.offsetHeight > 0) {
          root.style.setProperty('--mobile-art-h', `${art.offsetHeight}px`)
        }
      } else if (expandedHeaderRef.current > 0) {
        root.style.setProperty('--chrome-header', `${expandedHeaderRef.current}px`)
        if (expandedRowRef.current > 0) {
          root.style.setProperty('--mobile-helix-top', `${expandedRowRef.current}px`)
        }
      }
      compactHeaderRef.current = circleH + 2
      root.style.setProperty('--mobile-header-compact', `${compactHeaderRef.current}px`)
      if (mode === 'menu' && expandedHeaderRef.current > 0) {
        root.style.setProperty('--mobile-header-bg', `${expandedHeaderRef.current}px`)
      } else {
        const start = expandedHeaderRef.current
        const end = compactHeaderRef.current
        const bg = start > 0 && end > 0 ? start + (end - start) * t : start || end
        root.style.setProperty('--mobile-header-bg', `${bg}px`)
      }
      root.style.setProperty('--mobile-chrome-h', `${chromeH}px`)
      if (stage instanceof HTMLElement && expandedHeaderRef.current > 0 && compactHeaderRef.current > 0) {
        const extra = Math.max(0, Math.round(expandedHeaderRef.current - compactHeaderRef.current))
        stage.style.paddingBottom = extra ? `${extra}px` : ''
      }
    }
    syncHeaderHeightRef.current = syncHeaderHeight
    applyMobileHeaderPose(window.scrollY)
    syncHeaderHeight()
    const ro = new ResizeObserver(syncHeaderHeight)
    if (chrome instanceof HTMLElement) ro.observe(chrome)
    if (hero instanceof HTMLElement) ro.observe(hero)
    if (helix instanceof HTMLElement) ro.observe(helix)
    const circle = document.querySelector('.header-circle')
    const overlay = document.querySelector('.mobile-header-overlay')
    const onCircle = (event) => {
      if (mobileHeaderRef.current === 'origin' || mobileHeaderRef.current === 'tween') return
      event.preventDefault()
      if (mobileHeaderRef.current === 'menu') {
        mobileHeaderRef.current = 'origin'
        document.body.style.removeProperty('overflow')
        applyMobileHeaderPoseRef.current(window.scrollY)
      } else {
        setMobileHeaderMode('menu')
      }
    }
    const onOverlay = () => {
      if (mobileHeaderRef.current !== 'menu') return
      mobileHeaderRef.current = 'origin'
      document.body.style.removeProperty('overflow')
      applyMobileHeaderPoseRef.current(window.scrollY)
    }
    if (circle instanceof HTMLElement) circle.addEventListener('click', onCircle)
    if (overlay instanceof HTMLElement) overlay.addEventListener('click', onOverlay)
    return () => {
      if (mobileHeaderRafRef.current) {
        cancelAnimationFrame(mobileHeaderRafRef.current)
        mobileHeaderRafRef.current = 0
      }
      ro.disconnect()
      syncHeaderHeightRef.current = () => {}
      if (circle instanceof HTMLElement) circle.removeEventListener('click', onCircle)
      if (overlay instanceof HTMLElement) overlay.removeEventListener('click', onOverlay)
      clearModeStyles()
    }
  }, [isMobile])

  useEffect(() => {
    if (!isMobile) return undefined
    const ids = ['me', 'skills', 'experience']
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node) => node instanceof HTMLElement)
    if (!nodes.length) return undefined
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-animated', entry.isIntersecting)
      }
    }, { root: null, rootMargin: '15% 0px', threshold: 0.08 })
    nodes.forEach((node) => io.observe(node))
    return () => {
      io.disconnect()
      nodes.forEach((node) => node.classList.remove('is-animated'))
    }
  }, [isMobile])

  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (event.key === 'd' || event.key === 'D') setShowDebug((prev) => !prev)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const sync = () => {
      setIsMobile(mq.matches)
      setView({ w: window.innerWidth, h: window.innerHeight })
    }
    mq.addEventListener('change', sync)
    window.addEventListener('resize', sync)
    return () => {
      mq.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  useEffect(() => {
    const el = canvasRef.current
    if (!el || isMobile) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setView({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [isMobile])

  useEffect(() => {
    selectedIndexRef.current = selectedIndex
    const label = document.querySelector('.mobile-header-logo-name')
    const kicker = document.querySelector('.mobile-header-logo-kicker')
    const logo = document.querySelector('.mobile-header-logo')
    if (!(label instanceof HTMLElement) || !(kicker instanceof HTMLElement) || !(logo instanceof HTMLElement)) return
    const section = helixSections[selectedIndex]
    label.textContent = mobileLogoLabel(section)
    kicker.textContent = ''
    logo.classList.toggle('is-contact', section?.title === 'Contact')
  }, [selectedIndex, helixSections])

  useEffect(() => {
    const spacer = document.querySelector('.scroll-spacer')
    const content = document.querySelector('.content')
    const stage = document.querySelector('.stage')
    if (!(spacer instanceof HTMLElement) || !(content instanceof HTMLElement)) return

    const unlockScroll = () => {
      scrollLockRef.current = false
      scrollTargetRef.current = null
      if (orbitModeRef.current === 'click') orbitModeRef.current = 'scroll'
    }

    const indexFromScroll = (scrollY) => {
      const viewport = window.innerHeight
      const maxY = document.documentElement.scrollHeight - viewport
      if (maxY > 0 && scrollY >= maxY - 2) return helixSections.length - 1
      if (isMobile) return mobileIndexAtRef.current(scrollY).index
      const chrome = document.querySelector('.portfolio-chrome')
      const stuck = chrome instanceof HTMLElement && chrome.classList.contains('is-stuck')
      const probe = scrollY * scrollSpeed + (stuck ? chrome.offsetHeight : viewport * 0.33)
      let best = 0
      let bestTop = -Infinity
      for (let i = 0; i < helixSections.length; i += 1) {
        const section = document.getElementById(helixSections[i].id)
        if (!(section instanceof HTMLElement)) continue
        if (contentBoxTop(section) <= probe + 1 && contentBoxTop(section) >= bestTop) {
          bestTop = contentBoxTop(section)
          best = i
        }
      }
      return best
    }

    const scrollLimit = () => {
      const track = document.querySelector('.content-track')
      const trackH = track instanceof HTMLElement ? track.scrollHeight : content.scrollHeight
      const viewport = window.innerHeight
      return Math.max(0, trackH - viewport) / scrollSpeed
    }

    const clampScroll = (y) => Math.min(scrollLimit(), Math.max(0, y))

    const syncSpacer = () => {
      measurePortfolioPinRef.current()
      if (isMobile) {
        spacer.style.removeProperty('height')
        return
      }
      spacer.style.height = `${scrollLimit() + window.innerHeight}px`
    }

    const syncSelection = (scrollY) => {
      if (orbitModeRef.current === 'click' || scrollLockRef.current) {
        // While the click tween runs it unlocks itself when it finishes. Unlocking
        // early (within 4px of the target) handed the last ~100ms to the slower scroll
        // lerp and the scroll-driven camera, which made the end of the move stutter.
        if (clickAnimRef.current) return
        const target = scrollTargetRef.current
        if (target != null && Math.abs(scrollY - target) < 4) unlockScroll()
        return
      }
      const next = indexFromScroll(scrollY)
      if (isMobile) {
        pendingSelectRef.current = next
        if (next === selectedIndexRef.current) {
          if (selectTimerRef.current) {
            window.clearTimeout(selectTimerRef.current)
            selectTimerRef.current = 0
          }
          return
        }
        if (selectTimerRef.current) window.clearTimeout(selectTimerRef.current)
        selectTimerRef.current = window.setTimeout(() => {
          selectTimerRef.current = 0
          const pending = pendingSelectRef.current
          if (pending === selectedIndexRef.current) return
          selectedIndexRef.current = pending
          setSelectedIndex(pending)
        }, 140)
        return
      }
      if (next === selectedIndexRef.current) return
      selectedIndexRef.current = next
      setSelectedIndex(next)
    }

    const kickVisualLerp = () => {
      if (isMobile || visualRafRef.current) return
      visualLastTsRef.current = 0
      const step = (ts) => {
        const anim = clickAnimRef.current
        if (orbitModeRef.current === 'click' && anim) {
          const u = Math.min(1, (ts - anim.start) / (anim.duration * 1000))
          const eased = 1 - (1 - u) ** 3
          const y = clampScroll(anim.scrollFrom + (anim.scrollTo - anim.scrollFrom) * eased)
          const pose = anim.poseFrom + (anim.poseTo - anim.poseFrom) * eased
          visualScrollRef.current = y
          applyScrollVisualsRef.current(y, pose)
          syncSelection(y)
          if (u >= 1) {
            clickAnimRef.current = null
            portfolioTabHoldRef.current = null
            visualRafRef.current = 0
            unlockScroll()
            applyScrollVisualsRef.current(visualScrollRef.current)
            return
          }
          visualRafRef.current = requestAnimationFrame(step)
          return
        }
        const last = visualLastTsRef.current || ts
        const dt = Math.min(0.048, (ts - last) / 1000)
        visualLastTsRef.current = ts
        const target = clampScroll(targetScrollRef.current)
        targetScrollRef.current = target
        const cur = visualScrollRef.current
        const next = cur + (target - cur) * (1 - Math.exp(-5.2 * dt))
        const done = Math.abs(target - next) < 0.2
        const y = done ? target : next
        visualScrollRef.current = y
        applyScrollVisualsRef.current(y)
        syncSelection(y)
        if (done) {
          visualRafRef.current = 0
          return
        }
        visualRafRef.current = requestAnimationFrame(step)
      }
      visualRafRef.current = requestAnimationFrame(step)
    }

    kickVisualLerpRef.current = kickVisualLerp
    clampScrollRef.current = clampScroll

    const onLenisScroll = (lenis) => {
      if (orbitModeRef.current === 'click') {
        kickVisualLerp()
        return
      }
      orbitModeRef.current = 'scroll'
      targetScrollRef.current = clampScroll(lenis.targetScroll)
      kickVisualLerp()
    }

    const takeOverWithWheel = (event) => {
      if (event.ctrlKey) return
      if (document.querySelector('.project-dialog[open]')) {
        event.preventDefault()
        event.stopImmediatePropagation()
        return
      }
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (event.target instanceof Element && event.target.closest('.project-carousel-track') && Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      wheelAtRef.current = performance.now()
      const interrupt = orbitModeRef.current === 'click' || clickAnimRef.current
      orbitModeRef.current = 'scroll'
      clickAnimRef.current = null
      portfolioTabHoldRef.current = null
      scrollLockRef.current = false
      scrollTargetRef.current = null
      if (isMobile) return
      let delta = event.deltaY
      if (event.deltaMode === 1) delta *= 100 / 6
      else if (event.deltaMode === 2) delta *= window.innerHeight
      if (interrupt) targetScrollRef.current = visualScrollRef.current
      targetScrollRef.current = clampScroll(targetScrollRef.current + delta)
      const lenis = lenisRef.current
      if (lenis) lenis.scrollTo(targetScrollRef.current, { programmatic: false, force: true })
      else window.scrollBy(0, delta)
      kickVisualLerp()
      event.preventDefault()
      event.stopImmediatePropagation()
    }

    const onUserScrollIntent = (event) => {
      if (document.querySelector('.project-dialog[open]')) {
        event.preventDefault()
        return
      }
      unlockScroll()
    }

    const onPointerDown = (event) => {
      if (event.target instanceof Element && event.target.closest('.navigator')) return
      if (orbitModeRef.current === 'click') return
      unlockScroll()
    }

    const onKeyedScroll = (event) => {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'PageDown' ||
        event.key === 'PageUp' ||
        event.key === 'Home' ||
        event.key === 'End' ||
        event.key === ' '
      ) {
        if (document.querySelector('.project-dialog[open]')) {
          event.preventDefault()
          return
        }
        orbitModeRef.current = 'scroll'
        unlockScroll()
      }
    }

    syncSpacer()
    const onMobileScroll = () => {
      const y = window.scrollY
      applyScrollVisualsRef.current(y)
      syncSelection(y)
    }
    if (isMobile) {
      window.addEventListener('scroll', onMobileScroll, { passive: true })
      onMobileScroll()
    } else {
      const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.075,
        smoothWheel: true,
      })
      lenisRef.current = lenis
      lenis.on('scroll', onLenisScroll)
      applyScrollVisualsRef.current(lenis.scroll)
    }

    const onResize = () => {
      mobileAnchorsRef.current.tops = null
      mobileAnchorsRef.current.range = 0
      mobileViewRef.current = 0
      syncSpacer()
      lenisRef.current?.resize()
    }

    const onScrollEnd = () => {
      if (orbitModeRef.current === 'click') return
      unlockScroll()
    }

    window.addEventListener('scrollend', onScrollEnd)
    window.addEventListener('resize', onResize)
    window.addEventListener('wheel', takeOverWithWheel, { capture: true, passive: false })
    window.addEventListener('touchmove', onUserScrollIntent, { passive: false })
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyedScroll)
    const ro = new ResizeObserver(syncSpacer)
    const track = document.querySelector('.content-track')
    ro.observe(track instanceof HTMLElement ? track : content)

    return () => {
      window.removeEventListener('scroll', onMobileScroll)
      window.removeEventListener('scrollend', onScrollEnd)
      window.removeEventListener('resize', onResize)
      if (visualRafRef.current) cancelAnimationFrame(visualRafRef.current)
      visualRafRef.current = 0
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      window.removeEventListener('wheel', takeOverWithWheel, { capture: true })
      window.removeEventListener('touchmove', onUserScrollIntent)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyedScroll)
      ro.disconnect()
      if (selectTimerRef.current) {
        window.clearTimeout(selectTimerRef.current)
        selectTimerRef.current = 0
      }
      spacer.style.removeProperty('height')
    }
  }, [isMobile, helixSections])

  const setSelectedIndexAndScroll = (index) => {
    orbitModeRef.current = 'click'
    if (selectTimerRef.current) {
      window.clearTimeout(selectTimerRef.current)
      selectTimerRef.current = 0
    }
    pendingSelectRef.current = index
    selectedIndexRef.current = index
    setSelectedIndex(index)
    const id = helixSections[index]?.id
    if (!id) return
    const tabs = [...document.querySelectorAll('.portfolio-block .portfolio-tab')]
    const tabIndex = tabs.findIndex((tab) => tab.dataset.portfolioTarget === id)
    portfolioTabHoldRef.current = tabIndex >= 0 ? tabIndex : null
    const section = document.getElementById(id)
    if (!section) return
    if (!isMobile) {
      const chrome = document.querySelector('.portfolio-block > .portfolio-chrome')
      const chromeH = section.closest('.portfolio-block') && chrome instanceof HTMLElement
        ? chrome.offsetHeight
        : 0
      const cut = chrome instanceof HTMLElement
        ? parseFloat(getComputedStyle(chrome).getPropertyValue('--octagon-cut')) * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) || 12
        : 0
      const top = clampScrollRef.current((contentBoxTop(section) - Math.max(0, chromeH - cut)) / scrollSpeed)
      scrollLockRef.current = true
      scrollTargetRef.current = top
      targetScrollRef.current = top
      clickAnimRef.current = {
        poseFrom: poseRef.current.t,
        poseTo: index === 0 ? 0 : 1,
        scrollFrom: visualScrollRef.current,
        scrollTo: top,
        start: performance.now(),
        duration: clickPoseDuration,
      }
      kickVisualLerpRef.current()
      const lenis = lenisRef.current
      if (lenis) {
        lenis.scrollTo(top, {
          duration: clickPoseDuration,
          easing: (u) => 1 - (1 - u) ** 3,
        })
        return
      }
      window.scrollTo({ top, behavior: 'smooth' })
      return
    }
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const top = Math.min(maxY, mobileSectionAnchor(section))
    scrollLockRef.current = true
    scrollTargetRef.current = top
    window.scrollTo({ top, behavior: 'smooth' })
  }

  useEffect(() => {
    const onClick = (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const tab = target.closest('.portfolio-tab')
      if (!(tab instanceof HTMLElement)) return
      const id = tab.dataset.portfolioTarget || tab.closest('section')?.id
      if (!id) return
      const index = helixSections.findIndex((entry) => entry.id === id)
      if (index < 0) return
      document.querySelectorAll('.portfolio-block .portfolio-tab').forEach((item) => {
        if (item instanceof HTMLElement) item.classList.toggle('is-active', item === tab)
      })
      tab.blur()
      setSelectedIndexAndScroll(index)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [helixSections, isMobile])

  const reportHelixBounds = (bounds) => {
    if (!isMobile || bounds.width < 1) return
    const vw = window.innerWidth
    if (vw !== mobileViewRef.current) {
      mobileViewRef.current = vw
      mobileScrollbarRef.current = Math.max(0, vw - document.documentElement.clientWidth)
      mobileFontRef.current = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    }
    const font = mobileFontRef.current || 16
    const t = mobileHeaderTRef.current
    const compact = compactHeaderRef.current || 4.75 * font
    const reserved = (0.5 + 0.5 * t) * font + 1.75 * font + (compact - 3.75 * font) * t
    const root = document.documentElement
    if (reserved !== mobileSpanRef.current) {
      mobileSpanRef.current = reserved
      root.style.setProperty('--logo-span', `${reserved}px`)
    }
    const pad = font
    const gap = 2.5 * font
    const tipInset = 0.7 * font * 2 / 12
    const desiredRight = vw - pad - tipInset - gap
    const maxWidth = Math.max(1, desiredRight - reserved - gap)
    const headerRight = vw - mobileScrollbarRef.current - 0.75 * font
    const heroNudge = vw / 2 - (bounds.left + bounds.right) / 2
    const headerNudge = headerRight - bounds.right
    const nudge = heroNudge + (headerNudge - heroNudge) * t
    if (nudge !== mobileNudgeRef.current) {
      mobileNudgeRef.current = nudge
      root.style.setProperty('--helix-nudge', `${nudge}px`)
    }
    const fit = mobileFitRef.current
    const full = bounds.width / fit
    const next = Math.min(1.25, (maxWidth * 1.25) / full)
    if (Math.abs(next - fit) > 0.004) {
      mobileFitRef.current = next
      const fitted = helixMobile.scale * next
      if (poseParamsRef.current) poseParamsRef.current.mobileScale = fitted
      poseRef.current.scale = fitted
      if (!mobileFitTimerRef.current) {
        mobileFitTimerRef.current = window.setTimeout(() => {
          mobileFitTimerRef.current = 0
          setMobileFit(mobileFitRef.current)
        }, 180)
      }
    }
  }

  return (
    <div
      className={`navigator${isMobile ? ' is-mobile' : ' is-desktop'}`}
      data-selected-index={selectedIndex}
    >
      <div className="navigator-helix">
        <div className="canvas" ref={canvasRef}>
        <Canvas
          gl={glProps}
          dpr={dpr}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          {/* TEMP-PM */}
          <Suspense fallback={null}>
            <CanvasScene
              orthoZoom={orthoZoom}
              scale={scale}
              offsetPx={offsetPx}
              sections={helixSections}
              planesPerCycle={planesPerCycle}
              planeHeight={planeHeight}
              skewValue={valueSkew}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndexAndScroll}
              isMobile={isMobile}
              hoveredPlaneIdx={hoveredPlaneIdx}
              setHoveredPlaneIdx={setHoveredPlane}
              showTips={showTips}
              screenRoll={screenRoll}
              poseRef={poseRef}
              scrollIndexRef={scrollIndexRef}
              orbitModeRef={orbitModeRef}
              wheelAtRef={wheelAtRef}
              textFront={textFrontRad}
              textBack={textBackRad}
              gizmoScale={gizmoScale}
              gizmoOpacity={gizmoOpacity}
              contactCloseOpacity={contactCloseOpacity}
              contactFarOpacity={contactFarOpacity}
              secondaryColor={secondaryColor}
              onHelixBounds={reportHelixBounds}
            />
          </Suspense>
        </Canvas>
        </div>
      </div>
      <aside className={`debug-sliders${showDebug ? ' is-open' : ''}`}>
        <div className="debug-group">
          <p>front text</p>
          <label>
            <span>skewX {textFront.skewX.toFixed(2)}</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={textFront.skewX}
              onChange={(event) => setTextFront((prev) => ({ ...prev, skewX: Number(event.target.value) }))}
            />
          </label>
          <label>
            <span>skewY {textFront.skewY.toFixed(2)}</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={textFront.skewY}
              onChange={(event) => setTextFront((prev) => ({ ...prev, skewY: Number(event.target.value) }))}
            />
          </label>
          <label>
            <span>rot {textFront.rotDeg.toFixed(1)}°</span>
            <input
              type="range"
              min="-180"
              max="180"
              step="0.5"
              value={textFront.rotDeg}
              onChange={(event) => setTextFront((prev) => ({ ...prev, rotDeg: Number(event.target.value) }))}
            />
          </label>
        </div>
        <div className="debug-group">
          <p>back text</p>
          <label>
            <span>skewX {textBack.skewX.toFixed(2)}</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={textBack.skewX}
              onChange={(event) => setTextBack((prev) => ({ ...prev, skewX: Number(event.target.value) }))}
            />
          </label>
          <label>
            <span>skewY {textBack.skewY.toFixed(2)}</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={textBack.skewY}
              onChange={(event) => setTextBack((prev) => ({ ...prev, skewY: Number(event.target.value) }))}
            />
          </label>
          <label>
            <span>rot {textBack.rotDeg.toFixed(1)}°</span>
            <input
              type="range"
              min="-180"
              max="180"
              step="0.5"
              value={textBack.rotDeg}
              onChange={(event) => setTextBack((prev) => ({ ...prev, rotDeg: Number(event.target.value) }))}
            />
          </label>
        </div>
        <div className="debug-group">
          <p>helix</p>
          <label>
            <span>screen rot {screenRotDeg.toFixed(1)}°</span>
            <input
              type="range"
              min="-180"
              max="180"
              step="0.5"
              value={screenRotDeg}
              onChange={(event) => setScreenRotDeg(Number(event.target.value))}
            />
          </label>
          <label>
            <span>scale {scaleFit.toFixed(2)}</span>
            <input
              type="range"
              min="0.3"
              max="1.2"
              step="0.01"
              value={scaleFit}
              onChange={(event) => setScaleFit(Number(event.target.value))}
            />
          </label>
          <label>
            <span>gizmo scale {gizmoScale.toFixed(2)}</span>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.01"
              value={gizmoScale}
              onChange={(event) => setGizmoScale(Number(event.target.value))}
            />
          </label>
          <label>
            <span>gizmo opacity {gizmoOpacity.toFixed(2)}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gizmoOpacity}
              onChange={(event) => setGizmoOpacity(Number(event.target.value))}
            />
          </label>
          <label>
            <span>contact close {contactCloseOpacity.toFixed(2)}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={contactCloseOpacity}
              onChange={(event) => setContactCloseOpacity(Number(event.target.value))}
            />
          </label>
          <label>
            <span>contact far {contactFarOpacity.toFixed(2)}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={contactFarOpacity}
              onChange={(event) => setContactFarOpacity(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="debug-group">
          <p>secondary {secondaryColor}</p>
          <label>
            <span>r {secondaryRgb[0]}</span>
            <input
              type="range"
              min="0"
              max="255"
              step="1"
              value={secondaryRgb[0]}
              onChange={(event) => setSecondaryRgb((prev) => [Number(event.target.value), prev[1], prev[2]])}
            />
          </label>
          <label>
            <span>g {secondaryRgb[1]}</span>
            <input
              type="range"
              min="0"
              max="255"
              step="1"
              value={secondaryRgb[1]}
              onChange={(event) => setSecondaryRgb((prev) => [prev[0], Number(event.target.value), prev[2]])}
            />
          </label>
          <label>
            <span>b {secondaryRgb[2]}</span>
            <input
              type="range"
              min="0"
              max="255"
              step="1"
              value={secondaryRgb[2]}
              onChange={(event) => setSecondaryRgb((prev) => [prev[0], prev[1], Number(event.target.value)])}
            />
          </label>
        </div>
      </aside>
      {isMobile && (
        <div className="navigator-labels">
          <span
            className={`navigator-portfolio-word${sections[hoveredPlaneIdx]?.kicker === 'Portfolio' ? ' is-lit' : ''}`}
            ref={portfolioWordRef}
          >
            Portfolio
          </span>
          <ul className="navigator-list" ref={labelListRef}>
            {sections.map((section) => {
              const helixIndex = sections.findIndex((entry) => entry.id === section.id)
              return (
              <li key={section.id} className={section.kicker === 'Portfolio' ? 'is-portfolio' : undefined}>
                <button
                  type="button"
                  className={[
                    selectedIndex === helixIndex ? 'selected' : '',
                    hoveredPlaneIdx === helixIndex ? 'hovered' : '',
                  ].filter(Boolean).join(' ')}
                  onPointerEnter={() => setHoveredPlane(helixIndex)}
                  onPointerLeave={() => setHoveredPlane(-1, helixIndex)}
                  onClick={() => setSelectedIndexAndScroll(helixIndex)}
                >
                  {mobileHelixLabel(section)}
                </button>
              </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
