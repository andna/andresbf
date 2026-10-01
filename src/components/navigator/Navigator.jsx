import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import CanvasScene from './CanvasScene.jsx'
import { helixPlaneY } from './Helix.jsx'
import { hexToRgb, rgbToHex, readThemeColors } from '../../theme.js'
import './navigator.css'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

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

export default function Navigator({ sections }) {
  const helixSections = sections
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

  useEffect(() => {
    const onMove = () => {
      tipsArmedRef.current = true
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
    if (selectedIndex !== 0 && hoveredRef.current === selectedIndex) {
      tipsArmedRef.current = true
      setShowTips(true)
      return
    }
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
  const selectedIndexRef = useRef(0)
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
    title1: null,
    start: 0,
    max: 0,
    parentAbs: 0,
    last: null,
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
  const expandedHeaderRef = useRef(0)
  const expandedRowRef = useRef(0)
  const compactHeaderRef = useRef(0)
  const syncHeaderHeightRef = useRef(() => {})
  const applyMobileHeaderPoseRef = useRef(() => {})
  const orbitModeRef = useRef('scroll')
  const clickAnimRef = useRef(null)
  const clickPoseDuration = 0.85
  const poseRange = () => {
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
  const planeWidth = 0.5
  const worldSpan =
    Math.abs(
      helixPlaneY(Math.max(0, helixSections.length - 1), valueSkew, planeWidth, planeHeight) -
      helixPlaneY(0, valueSkew, planeWidth, planeHeight)
    ) + planeHeight
  const diagonal = Math.hypot(view.w, view.h)
  const scale = isMobile ? pose.scale : (diagonal * liveScaleFit) / (worldSpan * orthoZoom)
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
    mobileScale: helixMobile.scale,
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

  const applyMobileHeaderPose = (scrollY) => {
    if (!isMobile) return
    if (mobileHeaderRef.current === 'menu') return
    const t = Math.min(1, Math.max(0, scrollY / poseRange()))
    mobileHeaderTRef.current = t
    const root = document.documentElement
    root.style.setProperty('--mobile-header-t', `${t}`)
    const start = expandedHeaderRef.current
    const end = compactHeaderRef.current
    if (start > 0 && end > 0) {
      root.style.setProperty('--mobile-header-bg', `${start + (end - start) * t}px`)
    }
    setMobileHeaderMode(t <= 0 ? 'origin' : t >= 1 ? 'scrolled' : 'tween')
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
      document.documentElement.style.removeProperty('--chrome-item-rot')
      if (canvasRef.current) canvasRef.current.style.removeProperty('clip-path')
      const track = document.querySelector('.content-track')
      if (track instanceof HTMLElement) track.style.removeProperty('transform')
      return
    }
    const left = poseParamsRef.current?.contentLeft ?? contentLeft
    stage.style.transform = `translate3d(${offsetX}px, 0, 0)`
    stage.style.setProperty('--content-left', `${left}px`)
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
    if (!p.isMobile) {
      document.documentElement.style.setProperty(
        '--chrome-item-rot',
        `${-p.screenRotDeg * (1 - clamped)}deg`
      )
    }
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
    const title1 = document.querySelector('#portfolio-1 > h1')
    const title4 = document.querySelector('#portfolio-4 > h1')
    cache.title1 = title1 instanceof HTMLElement ? title1 : null
    if (!(title1 instanceof HTMLElement) || !(title4 instanceof HTMLElement)) {
      cache.start = 0
      cache.max = 0
      return
    }
    cache.start = title1.offsetTop
    cache.max = Math.max(0, title4.offsetTop - title1.offsetTop)
    cache.last = null
    const parent = title1.offsetParent
    cache.parentAbs = parent instanceof HTMLElement
      ? parent.getBoundingClientRect().top + window.scrollY
      : 0
  }

  const applyPortfolioTitlePin = (contentY) => {
    const cache = portfolioPinRef.current
    if (!cache.title1) measurePortfolioPin()
    const { title1, start, max, parentAbs } = cache
    if (!(title1 instanceof HTMLElement)) return
    const next = isMobile
      ? Math.min(Math.max(0, window.scrollY - parentAbs - start), max)
      : Math.min(Math.max(0, contentY - start), max)
    if (next === cache.last) return
    cache.last = next
    title1.style.transform = next ? `translate3d(0, ${next}px, 0)` : ''
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

  const applyScrollVisuals = (scrollY, poseOverride) => {
    const headerPx = isMobile
      ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chrome-header')) || 0
      : 0
    const contentY = isMobile ? scrollY + headerPx : scrollY * scrollSpeed
    if (!isMobile) {
      const track = document.querySelector('.content-track')
      if (track instanceof HTMLElement) {
        track.style.transform = `translate3d(0, ${-scrollY * scrollSpeed}px, 0)`
      }
    }
    let index = 0
    let nextTop = Infinity
    for (let i = 0; i < helixSections.length; i += 1) {
      const section = document.getElementById(helixSections[i].id)
      if (!(section instanceof HTMLElement)) continue
      const top = section.offsetTop
      if (top <= contentY) index = i
      else if (nextTop === Infinity) nextTop = top
    }
    const current = document.getElementById(helixSections[index]?.id)
    const start = current instanceof HTMLElement ? current.offsetTop : 0
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
    }
    if (content instanceof HTMLElement) content.style.removeProperty('transform')
    const title1 = document.querySelector('#portfolio-1 > h1')
    if (title1 instanceof HTMLElement) title1.style.removeProperty('transform')
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
    if (chrome instanceof HTMLElement && shell instanceof HTMLElement && stage instanceof HTMLElement && chrome.parentElement !== shell) {
      shell.insertBefore(chrome, stage)
    }
    if (helix instanceof HTMLElement && stage instanceof HTMLElement && helix.parentElement !== stage) {
      const main = stage.querySelector('.content')
      if (main instanceof HTMLElement) stage.insertBefore(helix, main)
      else stage.prepend(helix)
    }
    const title1 = document.querySelector('#portfolio-1 > h1')
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
      }
      if (content instanceof HTMLElement) content.style.removeProperty('transform')
      if (track instanceof HTMLElement) track.style.removeProperty('transform')
      if (canvasRef.current) canvasRef.current.style.removeProperty('clip-path')
      if (title1 instanceof HTMLElement) title1.style.removeProperty('transform')
      if (parallax instanceof HTMLElement) parallax.style.removeProperty('transform')
      portfolioPinRef.current.last = null
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
      if (mode === 'menu' && expandedHeaderRef.current > 0) {
        root.style.setProperty('--mobile-header-bg', `${expandedHeaderRef.current}px`)
      } else {
        const start = expandedHeaderRef.current
        const end = compactHeaderRef.current
        const bg = start > 0 && end > 0 ? start + (end - start) * t : start || end
        root.style.setProperty('--mobile-header-bg', `${bg}px`)
      }
      root.style.setProperty('--mobile-chrome-h', `${chromeH}px`)
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
  }, [selectedIndex])

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
      const headerPx = isMobile
        ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chrome-header')) || 0
        : 0
      const probe = isMobile
        ? scrollY + headerPx
        : scrollY * scrollSpeed + viewport * 0.33
      let best = 0
      let bestTop = -Infinity
      for (let i = 0; i < helixSections.length; i += 1) {
        const section = document.getElementById(helixSections[i].id)
        if (!(section instanceof HTMLElement)) continue
        if (section.offsetTop <= probe && section.offsetTop >= bestTop) {
          bestTop = section.offsetTop
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
        const target = scrollTargetRef.current
        if (target != null && Math.abs(scrollY - target) < 4) unlockScroll()
        return
      }
      const next = indexFromScroll(scrollY)
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
            visualRafRef.current = 0
            unlockScroll()
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
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      const interrupt = orbitModeRef.current === 'click' || clickAnimRef.current
      orbitModeRef.current = 'scroll'
      clickAnimRef.current = null
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

    const onUserScrollIntent = () => {
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
    window.addEventListener('touchmove', onUserScrollIntent, { passive: true })
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
      spacer.style.removeProperty('height')
    }
  }, [isMobile, helixSections])

  const setSelectedIndexAndScroll = (index) => {
    orbitModeRef.current = 'click'
    selectedIndexRef.current = index
    setSelectedIndex(index)
    const id = helixSections[index]?.id
    if (!id) return
    const section = document.getElementById(id)
    if (!section) return
    if (!isMobile) {
      const top = clampScrollRef.current(section.offsetTop / scrollSpeed)
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
    const headerPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chrome-header')) || 0
    const top = Math.max(0, section.offsetTop - headerPx)
    scrollLockRef.current = true
    scrollTargetRef.current = top
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <div
      className={`navigator${isMobile ? ' is-mobile' : ' is-desktop'}`}
      data-selected-index={selectedIndex}
    >
      <div className="canvas" ref={canvasRef}>
        <Canvas
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
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
              textFront={textFrontRad}
              textBack={textBackRad}
              gizmoScale={gizmoScale}
              gizmoOpacity={gizmoOpacity}
              contactCloseOpacity={contactCloseOpacity}
              contactFarOpacity={contactFarOpacity}
              secondaryColor={secondaryColor}
            />
          </Suspense>
        </Canvas>
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
        <ul className="navigator-list">
          {sections.filter((section) => !section.blank).map((section) => {
            const helixIndex = sections.findIndex((entry) => entry.id === section.id)
            return (
            <li key={section.id}>
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
                {section.label}
              </button>
            </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
