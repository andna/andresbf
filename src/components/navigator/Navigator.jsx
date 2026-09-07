import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import CanvasScene from './CanvasScene.jsx'
import './navigator.css'

const breakpoints = {
  mobile: 58 * 16,
  mid: 64 * 16,
  large: 100 * 16,
  mobileHeight: 800,
}

const getBreakpoint = (width, height) => {
  if (height < breakpoints.mobileHeight) return 'mobile'
  if (width < breakpoints.mid) return 'mobile'
  if (width < breakpoints.large) return 'mid'
  return 'large'
}

const helixCenter = { scale: 0.6, offsetPx: [0, -350] }
const helixMobile = { scale: 0.4, offsetPx: [0, -200] }

export default function Navigator({ sections }) {
  const [skewValue] = useState(-0.65)
  const [planesPerCycle] = useState(3)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [breakpoint, setBreakpoint] = useState(() =>
    getBreakpoint(window.innerWidth, window.innerHeight)
  )

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint((prev) => {
        const next = getBreakpoint(window.innerWidth, window.innerHeight)
        return next === prev ? prev : next
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = breakpoint === 'mobile'
  const orthoZoom = 200
  const pose = isMobile ? helixMobile : helixCenter
  const scale = pose.scale
  const offsetPx = pose.offsetPx

  return (
    <div className="navigator">
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div className="canvas">
          <Canvas>
            <Suspense fallback={null}>
              <CanvasScene
                orthoZoom={orthoZoom}
                scale={scale}
                offsetPx={offsetPx}
                sections={sections}
                planesPerCycle={planesPerCycle}
                skewValue={skewValue}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                isMobile={isMobile}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  )
}
