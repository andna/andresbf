import { Suspense, useEffect, useMemo, useRef, useState, useCallback, memo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Edges, OrbitControls, OrthographicCamera, Stars, Html } from '@react-three/drei'
import { useBreakpoint } from '../BreakpointContext'

const colors = {
  selected: '#ffffff',
  hovered: '#555555',
  default: '#1e1d1e',
  line: '#fff'
}

const sections = ['Welcome', 'I\'m', 'Portfolio', 'Contact', 'Blog', 'Resume']
// --- keep your imports ---

/* NEW: isolate every R3F hook inside this component */
function CanvasScene({
  orthoZoom,
  scale,
  offsetPx,
  sections,
  planesPerCycle,
  skewValue,
  selectedIndex,
  setSelectedIndex,
  isMobile
}) {
  const helixScale = 0.6
  const totalPlanes = sections.length

  // --- helix math/geometry (pure THREE OK inside too) ---
  const planeWidth = 1
  const baseRotation = useMemo(() => (Math.PI * 2) / planesPerCycle, [planesPerCycle])
  const radius = useMemo(() => planeWidth / (2 * Math.tan(Math.PI / planesPerCycle)), [planesPerCycle])

  const { skewedPlaneGeometry } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(1, 0.5)
    const m = new THREE.Matrix4()
    m.makeShear(skewValue, 0, 0, 0, 0, 0)
    geometry.applyMatrix4(m)
    geometry.computeVertexNormals()
    return { skewedPlaneGeometry: geometry }
  }, [skewValue])

  useEffect(() => () => skewedPlaneGeometry.dispose(), [skewedPlaneGeometry])

  // --- list metrics (for Html list line-height) ---
  const calculated = useMemo(() => {
    const skewAngle = Math.atan(Math.abs(skewValue))
    const RAD2DEG = 180 / Math.PI
    const skewYDeg = skewAngle * RAD2DEG * 0.88
    const stepWorld = Math.sin(skewAngle) + Math.pow(Math.abs(skewValue), 2.5) * 0.1
    const unitToPx = orthoZoom * helixScale
    const lineHeightPx = unitToPx * stepWorld * 1.85
    return { skewYDeg, lineHeightPx }
  }, [skewValue, planesPerCycle, orthoZoom])

  // --- camera + controls (R3F hooks live here) ---
  const camRef = useRef()
  const controlsRef = useRef()
  const helixPivot = useRef()
  const { size } = useThree()
  const tmpTarget = useRef(new THREE.Vector3())
  const userRotatingRef = useRef(false)
  const currentIndexRef = useRef(0)
  const targetAngleRef = useRef(0)

  // selectedIndex → target camera angle (shortest path)
  useEffect(() => {
    if (userRotatingRef.current) return
    const current = ((currentIndexRef.current % planesPerCycle) + planesPerCycle) % planesPerCycle
    const target = ((selectedIndex % planesPerCycle) + planesPerCycle) % planesPerCycle
    let delta = target - current
    const half = planesPerCycle / 2
    if (delta > half) delta -= planesPerCycle
    if (delta < -half) delta += planesPerCycle
    currentIndexRef.current += delta
    targetAngleRef.current = currentIndexRef.current * baseRotation
  }, [selectedIndex, planesPerCycle, baseRotation])

  // Keep OrbitControls target pinned
  useFrame(() => {
    const pivot = helixPivot.current
    const controls = controlsRef.current
    if (!pivot || !controls) return
    pivot.getWorldPosition(tmpTarget.current)
    controls.target.copy(tmpTarget.current)
    controls.update()
  })

  // Auto-rotate + screen-space pan
  useFrame(() => {
    const cam = camRef.current
    const pivot = helixPivot.current
    if (!cam || !pivot) return
    pivot.getWorldPosition(tmpTarget.current)

    if (!userRotatingRef.current) {
      cam.userData.angle ??= targetAngleRef.current
      cam.userData.angle += (targetAngleRef.current - cam.userData.angle) * 0.06
      const a = cam.userData.angle
      const basePos = tmpTarget.current.clone().add(new THREE.Vector3(Math.sin(a) * 10, 0, Math.cos(a) * 10))
      cam.position.copy(basePos)
      cam.lookAt(tmpTarget.current)
    }

    const [ox, oy] = offsetPx
    if ((ox | oy) !== 0) cam.setViewOffset(size.width, size.height, -ox, -oy, size.width, size.height)
    else cam.clearViewOffset()
    cam.updateProjectionMatrix()
  })

  const onControlStart = () => { userRotatingRef.current = true }
  const onControlEnd = () => {
    userRotatingRef.current = false
    const cam = camRef.current
    const pivot = helixPivot.current
    if (!cam || !pivot) return
    pivot.getWorldPosition(tmpTarget.current)
    const dx = cam.position.x - tmpTarget.current.x
    const dz = cam.position.z - tmpTarget.current.z
    const azimuth = Math.atan2(dx, dz)
    cam.userData.angle = azimuth
    targetAngleRef.current = azimuth
    currentIndexRef.current = azimuth / baseRotation
  }

  // local hover state (kept inside Canvas subtree)
  const [hoveredPlaneIdx, setHoveredPlaneIdx] = useState(-1)

  // compute the CSS transform for the Html list using the incoming `scale`
  const navigatorListStyle = useMemo(() => {
    const lerp = (a, b, t) => a + (b - a) * t

    // normalize scale into [0,1] between 0.4 → 0.6
    const t = Math.min(1, Math.max(0, (scale - 0.4) / (0.6 - 0.4)))

    const tx = lerp(-30, -5, t)  // -30% → -5%
    const ty = lerp(-10, -7, t)  // -10% → -7%

    return {
      lineHeight: `${calculated.lineHeightPx}px`,
      transform: `skewY(${calculated.skewYDeg}deg) scale(${scale}) translate(${tx}%, ${ty}%)`
    }
  }, [calculated.lineHeightPx, calculated.skewYDeg, scale])

  return (
    <>
    {!isMobile && (
      <Stars radius={1} depth={20} rayleigh={2} count={3000} factor={1} saturation={3} fade speed={0} color="blue" />
    )}

      <group ref={helixPivot} position={[0, 0, 0]} scale={scale}>
        {Array.from({ length: totalPlanes }).map((_, index) => {
          const skewAngle = Math.atan(Math.abs(skewValue))
          const distance = 1
          const baseY = -index * distance * Math.sin(skewAngle)
          const normalizedSkew = Math.abs(skewValue)
          const scalingFactor = Math.pow(normalizedSkew, 1.5) * 0.29
          const skewCompensationY = skewValue * (index === 0 ? 0.5 : 0.5 + scalingFactor * index)
          const y = baseY + skewCompensationY
          const planeRotation = baseRotation * index
          const x = radius * Math.sin(planeRotation)
          const z = radius * Math.cos(planeRotation)

          const isSel = selectedIndex === index
          const isHover = hoveredPlaneIdx === index

          return (
            <group
              key={index}
              rotation={[0, planeRotation, 0]}
              position={[x, y, z]}
              onPointerOver={(e) => { setHoveredPlaneIdx(index); e.stopPropagation() }}
              onPointerOut={() => setHoveredPlaneIdx(-1)}
            >
              <mesh
                geometry={skewedPlaneGeometry}
                onClick={(e) => { setSelectedIndex(index); e.stopPropagation() }}
              >
                <meshBasicMaterial
                  color={isSel ? '#ffffff' : (isHover ? '#555555' : '#1e1d1e')}
                  toneMapped={false}
                  side={THREE.DoubleSide}
                  polygonOffset
                  polygonOffsetFactor={1}
                  polygonOffsetUnits={1}
                  depthTest
                  depthWrite
                />
              </mesh>
              <mesh geometry={skewedPlaneGeometry} frustumCulled>
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                <Edges color="#fff" />
              </mesh>
            </group>
          )
        })}

        {/* HTML overlay stays inside Canvas via <Html /> */}
        <Html>
          <ul className="navigator-list" style={navigatorListStyle}>
            {sections.map((name, index) => (
              <li key={index}>
                <span
                  className={`${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => setSelectedIndex(index)}
                  onMouseEnter={() => setHoveredPlaneIdx(index)}
                  onMouseLeave={() => setHoveredPlaneIdx(-1)}
                >
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </Html>
      </group>

      <OrthographicCamera ref={camRef} makeDefault zoom={orthoZoom} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.9}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        onStart={onControlStart}
        onEnd={onControlEnd}
      />
    </>
  )
}
/* Your outer component stays R3F-hook free */
export default function Navigator() {
    // DOM/state stuff (no useThree/useFrame here)
    const [skewValue] = useState(-0.65)
    const [planesPerCycle] = useState(3)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const { isMobile, isMid } = useBreakpoint()

    const orthoZoom = 200

    // --- renamed + third pose -----------------------------
    const helixCenter = { scale: 0.6, offsetPx: [0,   -350] }
    const helixRight  = { scale: 0.4, offsetPx: [420, -280] }
    const helixLeft   = { scale: 0.4, offsetPx: [-450, 100] } // new pose
    const helixMobile = { scale: 0.4, offsetPx: [0,   -200] }
    // ------------------------------------------------------

    // reactive values lerped toward targets
    const [scale, setScale] = useState(helixCenter.scale)
    const [offsetPx, setOffsetPx] = useState(helixCenter.offsetPx)
    const targetScaleRef = useRef(helixCenter.scale)
    const targetOffsetPxRef = useRef(helixCenter.offsetPx)
    const lerp = (a,b,t)=>a+(b-a)*t
  useEffect(() => {
    // helper: clamp
    const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);

    // --- MOBILE: force pose, no scroll listener ---
    if (isMobile) {
      const applyMobile = () => {
        targetScaleRef.current = helixMobile.scale;
        targetOffsetPxRef.current = [...helixMobile.offsetPx];

        // If you tween current -> target elsewhere and want ZERO blend:
        // currentScaleRef.current = helixMobile.scale;
        // currentOffsetPxRef.current = [...helixMobile.offsetPx];
      };

      applyMobile();

      // Keep it in mobile pose on rotate/resize
      window.addEventListener('resize', applyMobile);
      return () => window.removeEventListener('resize', applyMobile);
    }

    // --- DESKTOP: rAF-batched scroll handling ---
    let rafId = 0;
    let lastY = window.scrollY;
    let vh = window.innerHeight;

    const recomputeVh = () => { vh = Math.max(1, window.innerHeight); };

    const tick = () => {
      rafId = 0;

      const ratio = lastY / vh; // 1 == 100% viewport height, 2 == 200%


      const targetHelix = isMid ? helixLeft : helixRight;
      const p = clamp01(ratio);

      targetScaleRef.current = lerp(helixCenter.scale, targetHelix.scale, p);
      targetOffsetPxRef.current = [
        lerp(helixCenter.offsetPx[0], targetHelix.offsetPx[0], p),
        lerp(helixCenter.offsetPx[1], targetHelix.offsetPx[1], p),
      ];
    };

    const onScroll = () => {
      lastY = window.scrollY;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const onResize = () => {
      recomputeVh();
      // re-run tick so targets match new viewport immediately
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    // initial compute
    recomputeVh();
    tick();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [isMobile, isMid, helixCenter, helixLeft, helixRight, helixMobile, lerp, targetScaleRef, targetOffsetPxRef]);


    useEffect(() => {
      let raf
      const tick = () => {
        setScale(s => lerp(s, targetScaleRef.current, 0.15))
        setOffsetPx(o => [
          lerp(o[0], targetOffsetPxRef.current[0], 0.15),
          lerp(o[1], targetOffsetPxRef.current[1], 0.15),
        ])
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }, [])

    return (
      <div className="navigator">
        <div style={{ position: 'relative' }}>
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
