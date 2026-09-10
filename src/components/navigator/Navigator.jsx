import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import CanvasScene from './CanvasScene.jsx'
import { helixPlaneY } from './Helix.jsx'
import { hexToRgb, rgbToHex, readThemeColors } from '../../theme.js'
import './navigator.css'

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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < window.innerHeight)
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
  const heroOffsetYFrac = 0.04
  const restOffsetYFrac = 0.055
  const heroTextBack = { skewX: -0.61, skewY: -0.07, rotDeg: 57 }
  const targetScaleFit = selectedIndex === 0 ? scaleFit : restScaleFit
  const targetScreenRotDeg = selectedIndex === 0 ? screenRotDeg : restScreenRotDeg
  const targetOffsetX = selectedIndex === 0 ? 0 : -Math.round(view.w * restOffsetXFrac)
  const targetOffsetY = Math.round(view.h * (selectedIndex === 0 ? heroOffsetYFrac : restOffsetYFrac))
  const targetContentRot = selectedIndex === 0 ? -20 : 0
  const targetContentY = selectedIndex === 0 ? 3 : 0
  const targetTextBack = selectedIndex === 0 ? heroTextBack : textBack
  const [liveScaleFit, setLiveScaleFit] = useState(scaleFit)
  const [liveScreenRotDeg, setLiveScreenRotDeg] = useState(screenRotDeg)
  const [liveOffsetX, setLiveOffsetX] = useState(0)
  const [liveOffsetY, setLiveOffsetY] = useState(() => Math.round(window.innerHeight * heroOffsetYFrac))
  const [liveTextBack, setLiveTextBack] = useState(heroTextBack)
  const livePoseRef = useRef({
    scaleFit: 0.67,
    screenRotDeg: 50,
    offsetX: 0,
    offsetY: Math.round(window.innerHeight * heroOffsetYFrac),
    contentRot: -20,
    contentY: 3,
    textBack: { ...heroTextBack },
  })
  const canvasRef = useRef(null)
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
  const bandClip = isMobile
    ? undefined
    : diagonalBandClip(view.w, view.h, liveScreenRotDeg, hitBoxNarrowness)
  const contentLeft = (window.innerWidth - view.w) / 2
    + view.w / 2
    + Math.min(view.w, view.h) * hitBoxNarrowness

  const secondaryColor = rgbToHex(secondaryRgb)

  useEffect(() => {
    document.documentElement.style.setProperty('--secondary-color', secondaryColor)
  }, [secondaryColor])

  useEffect(() => {
    const sync = () => {
      document.documentElement.style.removeProperty('--secondary-color')
      setSecondaryRgb(hexToRgb(readThemeColors().secondary))
    }
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const applyLayoutPose = (offsetX, offsetY, contentRot, contentY) => {
    const stage = document.querySelector('.stage')
    const content = document.querySelector('.content')
    if (!(stage instanceof HTMLElement) || !(content instanceof HTMLElement)) return
    if (isMobile) {
      stage.style.removeProperty('transform')
      stage.style.removeProperty('--content-left')
      content.style.removeProperty('transform')
      return
    }
    stage.style.transform = `translate(${offsetX}px, ${offsetY}px)`
    stage.style.setProperty('--content-left', `${contentLeft}px`)
    content.style.transform = `rotate(${contentRot}deg) translateY(${contentY}vh)`
  }

  useEffect(() => {
    let rafId = 0
    const step = () => {
      const cur = livePoseRef.current
      const nextScale = cur.scaleFit + (targetScaleFit - cur.scaleFit) * 0.06
      const nextRot = cur.screenRotDeg + (targetScreenRotDeg - cur.screenRotDeg) * 0.06
      const nextOffsetX = cur.offsetX + (targetOffsetX - cur.offsetX) * 0.06
      const nextOffsetY = cur.offsetY + (targetOffsetY - cur.offsetY) * 0.06
      const nextContentRot = cur.contentRot + (targetContentRot - cur.contentRot) * 0.06
      const nextContentY = cur.contentY + (targetContentY - cur.contentY) * 0.06
      const nextTextBack = {
        skewX: cur.textBack.skewX + (targetTextBack.skewX - cur.textBack.skewX) * 0.06,
        skewY: cur.textBack.skewY + (targetTextBack.skewY - cur.textBack.skewY) * 0.06,
        rotDeg: cur.textBack.rotDeg + (targetTextBack.rotDeg - cur.textBack.rotDeg) * 0.06,
      }
      const done =
        Math.abs(targetScaleFit - nextScale) < 0.0004 &&
        Math.abs(targetScreenRotDeg - nextRot) < 0.0004 &&
        Math.abs(targetOffsetX - nextOffsetX) < 0.2 &&
        Math.abs(targetOffsetY - nextOffsetY) < 0.2 &&
        Math.abs(targetContentRot - nextContentRot) < 0.0004 &&
        Math.abs(targetContentY - nextContentY) < 0.0004 &&
        Math.abs(targetTextBack.skewX - nextTextBack.skewX) < 0.0004 &&
        Math.abs(targetTextBack.skewY - nextTextBack.skewY) < 0.0004 &&
        Math.abs(targetTextBack.rotDeg - nextTextBack.rotDeg) < 0.0004
      const scaleFitOut = done ? targetScaleFit : nextScale
      const screenRotOut = done ? targetScreenRotDeg : nextRot
      const offsetXOut = done ? targetOffsetX : nextOffsetX
      const offsetYOut = done ? targetOffsetY : nextOffsetY
      const contentRotOut = done ? targetContentRot : nextContentRot
      const contentYOut = done ? targetContentY : nextContentY
      const textBackOut = done ? { ...targetTextBack } : nextTextBack
      livePoseRef.current = {
        scaleFit: scaleFitOut,
        screenRotDeg: screenRotOut,
        offsetX: offsetXOut,
        offsetY: offsetYOut,
        contentRot: contentRotOut,
        contentY: contentYOut,
        textBack: textBackOut,
      }
      setLiveScaleFit(scaleFitOut)
      setLiveScreenRotDeg(screenRotOut)
      setLiveOffsetX(offsetXOut)
      setLiveOffsetY(offsetYOut)
      setLiveTextBack(textBackOut)
      applyLayoutPose(offsetXOut, offsetYOut, contentRotOut, contentYOut)
      if (!done) rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [
    targetScaleFit,
    targetScreenRotDeg,
    targetOffsetX,
    targetOffsetY,
    targetContentRot,
    targetContentY,
    targetTextBack.skewX,
    targetTextBack.skewY,
    targetTextBack.rotDeg,
    contentLeft,
    isMobile,
  ])

  useEffect(() => {
    const cur = livePoseRef.current
    applyLayoutPose(cur.offsetX, cur.offsetY, cur.contentRot, cur.contentY)
    return () => {
      const stage = document.querySelector('.stage')
      const content = document.querySelector('.content')
      if (stage instanceof HTMLElement) {
        stage.style.removeProperty('transform')
        stage.style.removeProperty('--content-left')
      }
      if (content instanceof HTMLElement) content.style.removeProperty('transform')
    }
  }, [isMobile, contentLeft])

  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (event.key === 'd' || event.key === 'D') setShowDebug((prev) => !prev)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < window.innerHeight)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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
  const setSelectedIndexAndScroll = (index) => {
    setSelectedIndex(index)
    const id = helixSections[index]?.id
    if (!id) return
    const section = document.getElementById(id)
    const content = document.querySelector('.content')
    if (!section) return
    if (content instanceof HTMLElement && !isMobile) {
      content.scrollTo({ top: section.offsetTop, behavior: 'smooth' })
      return
    }
    section.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={`navigator${isMobile ? ' is-mobile' : ' is-desktop'}`}>
      <div
        className="canvas"
        ref={canvasRef}
        style={bandClip ? { clipPath: bandClip } : undefined}
      >
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
              setHoveredPlaneIdx={setHoveredPlaneIdx}
              screenRoll={screenRoll}
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
                onPointerEnter={() => setHoveredPlaneIdx(helixIndex)}
                onPointerLeave={() => setHoveredPlaneIdx(-1)}
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
