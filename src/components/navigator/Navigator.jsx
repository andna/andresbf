import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import CanvasScene from './CanvasScene.jsx'
import './navigator.css'

const valueSkewDesktop = -0.67
const valueSkewMobile = -1.3
const planesPerCycleDesktop = 6
const planesPerCycleMobile = 3
const planeHeightDesktop = 0.5
const planeHeightMobile = 0.75

const breakpoints = {
  mid: 64 * 16,
  large: 100 * 16,
}

const getBreakpoint = (width) => {
  if (width < breakpoints.mid) return 'mobile'
  if (width < breakpoints.large) return 'mid'
  return 'large'
}

const helixCenter = { scale: 0.95, offsetPx: [0, 0] }
const helixMobile = { scale: 0.25, offsetPx: [0, 0] }

export default function Navigator({ sections }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [hoveredPlaneIdx, setHoveredPlaneIdx] = useState(-1)
  const [breakpoint, setBreakpoint] = useState(() =>
    getBreakpoint(window.innerWidth)
  )

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint((prev) => {
        const next = getBreakpoint(window.innerWidth)
        return next === prev ? prev : next
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = breakpoint === 'mobile'
  const valueSkew = isMobile ? valueSkewMobile : valueSkewDesktop
  const planesPerCycle = isMobile ? planesPerCycleMobile : planesPerCycleDesktop
  const planeHeight = isMobile ? planeHeightMobile : planeHeightDesktop
  const orthoZoom = 200
  const pose = isMobile ? helixMobile : helixCenter
  const scale = pose.scale
  const offsetPx = pose.offsetPx
  const setSelectedIndexAndScroll = (index) => {
    setSelectedIndex(index)
    const id = sections[index]?.id
    if (!id) return
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={`navigator${isMobile ? ' is-mobile' : ''}`}>
      <div className="canvas">
        <Canvas
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <CanvasScene
              orthoZoom={orthoZoom}
              scale={scale}
              offsetPx={offsetPx}
              sections={sections}
              planesPerCycle={planesPerCycle}
              planeHeight={planeHeight}
              skewValue={valueSkew}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndexAndScroll}
              isMobile={isMobile}
              hoveredPlaneIdx={hoveredPlaneIdx}
              setHoveredPlaneIdx={setHoveredPlaneIdx}
            />
          </Suspense>
        </Canvas>
      </div>
      {isMobile && (
        <ul className="navigator-list">
          {sections.map((section, index) => (
            <li key={`${section.id}-${index}`}>
              <button
                type="button"
                className={[
                  selectedIndex === index ? 'selected' : '',
                  hoveredPlaneIdx === index ? 'hovered' : '',
                ].filter(Boolean).join(' ')}
                onPointerEnter={() => setHoveredPlaneIdx(index)}
                onPointerLeave={() => setHoveredPlaneIdx(-1)}
                onClick={() => setSelectedIndexAndScroll(index)}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
