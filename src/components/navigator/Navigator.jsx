import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import CanvasScene from './CanvasScene.jsx'
import { helixPlaneY } from './Helix.jsx'
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
  const helixSections = useMemo(() => [
    { id: 'header', label: '', blank: true },
    ...sections,
    { id: 'footer', label: '', blank: true },
  ], [sections])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [hoveredPlaneIdx, setHoveredPlaneIdx] = useState(-1)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < window.innerHeight)
  const [view, setView] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }))
  const [textFront, setTextFront] = useState({ skewX: -0.07, skewY: -0.17, rotDeg: 8 })
  const [textBack, setTextBack] = useState({ skewX: -0.18, skewY: 0.05, rotDeg: 85 })
  const [scaleFit, setScaleFit] = useState(0.6)
  const [screenRotDeg, setScreenRotDeg] = useState(45)
  const [gizmoScale, setGizmoScale] = useState(0.5)
  const [showDebug, setShowDebug] = useState(false)
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
  const scale = isMobile ? pose.scale : (diagonal * scaleFit) / (worldSpan * orthoZoom)
  const screenRoll = (screenRotDeg * Math.PI) / 180
  const textFrontRad = {
    skewX: textFront.skewX,
    skewY: textFront.skewY,
    rot: (textFront.rotDeg * Math.PI) / 180,
  }
  const textBackRad = {
    skewX: textBack.skewX,
    skewY: textBack.skewY,
    rot: (textBack.rotDeg * Math.PI) / 180,
  }
  const offsetPx = pose.offsetPx
  const hitBoxNarrowness = 0.28
  const bandClip = isMobile
    ? undefined
    : diagonalBandClip(view.w, view.h, screenRotDeg, hitBoxNarrowness)

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
    if (!id || helixSections[index]?.blank) return
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={`navigator${isMobile ? ' is-mobile' : ' is-desktop'}`}>
      <div className="canvas" ref={canvasRef} style={bandClip ? { clipPath: bandClip } : undefined}>
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
        </div>
      </aside>
      {isMobile && (
        <ul className="navigator-list">
          {sections.map((section, index) => {
            const helixIndex = index + 1
            return (
            <li key={`${section.id}-${index}`}>
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
