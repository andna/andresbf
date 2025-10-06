import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Edges, OrbitControls, OrthographicCamera, Stars } from '@react-three/drei'
import { useBreakpoint } from './BreakpointContext'

// --- keep your imports ---

/* NEW: isolate every R3F hook inside this component */
function CanvasScene({
  orthoZoom,
  scale,
  offsetPx,
  planesPerCycle,
  skewValue,
  selectedIndex,
  setSelectedIndex,
  isMobile
}) {
  const totalPlanes = 12

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



  // --- camera + controls (R3F hooks live here) ---
  const camRef = useRef()
  const controlsRef = useRef()
  const helixPivot = useRef()
  const helixContainerRef = useRef()
  const planeMatsRef = useRef([])
  const edgeMatsRef = useRef([])
  const planeRefs = useRef([])
  const raycasterRef = useRef(new THREE.Raycaster())
  const { size, camera, pointer, gl } = useThree()
  const tmpTarget = useRef(new THREE.Vector3())
  const userRotatingRef = useRef(false)
  const currentIndexRef = useRef(0)
  const targetAngleRef = useRef(0)
  const selectedIndexRef = useRef(selectedIndex)
  const baseAngleRef = useRef(0)
  const scrollOffsetRef = useRef(0)
  const prevScrollYRef = useRef(0)
  const indexAnimatingRef = useRef(false)

  useEffect(() => {
    let vh = Math.max(1, window.innerHeight)
    prevScrollYRef.current = window.scrollY
    const onResize = () => { vh = Math.max(1, window.innerHeight) }
    const onScroll = () => {
      const dy = window.scrollY - prevScrollYRef.current
      prevScrollYRef.current = window.scrollY
      const SCROLL_TO_ROTATE = 0.1
      const perVh = Math.PI * SCROLL_TO_ROTATE
      scrollOffsetRef.current += (dy / vh) * perVh
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // selectedIndex → target camera angle (shortest path)
  useEffect(() => {
    selectedIndexRef.current = selectedIndex
    if (userRotatingRef.current) return
    const current = ((currentIndexRef.current % planesPerCycle) + planesPerCycle) % planesPerCycle
    const target = ((selectedIndex % planesPerCycle) + planesPerCycle) % planesPerCycle
    let delta = target - current
    const half = planesPerCycle / 2
    if (delta > half) delta -= planesPerCycle
    if (delta < -half) delta += planesPerCycle
    currentIndexRef.current += delta
    baseAngleRef.current = currentIndexRef.current * baseRotation
    indexAnimatingRef.current = true
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
    const helixContainer = helixContainerRef.current
    if (!cam || !pivot) return
    pivot.getWorldPosition(tmpTarget.current)

    if (!userRotatingRef.current) {
      targetAngleRef.current = baseAngleRef.current + scrollOffsetRef.current
      cam.userData.angle ??= targetAngleRef.current
      cam.userData.angle += (targetAngleRef.current - cam.userData.angle) * 0.06
      const a = cam.userData.angle
      const basePos = tmpTarget.current.clone().add(new THREE.Vector3(Math.sin(a) * 10, 0, Math.cos(a) * 10))
      cam.position.copy(basePos)
      cam.lookAt(tmpTarget.current)
    }

    if (helixContainer) {
      const distance = 1
      const skewAngle = Math.atan(Math.abs(skewValue))
      const baseY = -selectedIndex * distance * Math.sin(skewAngle)
      const normalizedSkew = Math.abs(skewValue)
      const scalingFactor = Math.pow(normalizedSkew, 1.5) * 0.29
      const skewCompensationY = skewValue * (selectedIndex === 0 ? 0.5 : 0.5 + scalingFactor * selectedIndex)
      const targetY = -(baseY + skewCompensationY)
      helixContainer.position.y += (targetY - helixContainer.position.y) * 0.15
    }

    const [ox, oy] = offsetPx
    if ((ox | oy) !== 0) cam.setViewOffset(size.width, size.height, -ox, -oy, size.width, size.height)
    else cam.clearViewOffset()
    cam.updateProjectionMatrix()

    const leftCount = Math.floor((planesPerCycle - 1) / 2)
    const rightCount = planesPerCycle - 1 - leftCount
    const currentSel = selectedIndexRef.current
    const eligibleMeshes = []
    for (let i = 0; i < totalPlanes; i++) {
      const mat = planeMatsRef.current[i]
      const mesh = planeRefs.current[i]
      const visible = i >= currentSel - leftCount && i <= currentSel + rightCount
      if (mat) {
        const target = visible ? 1 : 0
        mat.opacity += (target - mat.opacity) * 0.15
        mat.transparent = true
        mat.depthWrite = false
      }
      const edgeMat = edgeMatsRef.current[i]
      if (edgeMat) {
        const target = visible ? 1 : 0
        edgeMat.opacity += (target - edgeMat.opacity) * 0.15
        edgeMat.transparent = true
        edgeMat.depthWrite = false
      }
      if (mesh && visible) eligibleMeshes.push(mesh)
    }

    const rc = raycasterRef.current
    rc.setFromCamera(pointer, camera)
    const hits = rc.intersectObjects(eligibleMeshes, false)
    if (hits && hits.length) {
      const idx = hits[0].object.userData.index
      if (hoveredPlaneIdx !== idx) setHoveredPlaneIdx(idx)
    } else {
      if (hoveredPlaneIdx !== -1) setHoveredPlaneIdx(-1)
    }

    const controls = controlsRef.current
    if (controls && cam.userData && typeof cam.userData.angle === 'number') {
      const target = baseAngleRef.current + scrollOffsetRef.current
      const d = target - cam.userData.angle
      const norm = Math.atan2(Math.sin(d), Math.cos(d))
      if (!userRotatingRef.current && indexAnimatingRef.current && Math.abs(norm) < 0.005) indexAnimatingRef.current = false
      controls.enabled = !indexAnimatingRef.current
    }
  })

  const onControlStart = () => {
    userRotatingRef.current = true
    const controls = controlsRef.current
    if (controls) controls.enabled = true
    indexAnimatingRef.current = false
  }
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
    baseAngleRef.current = azimuth
    scrollOffsetRef.current = 0
    currentIndexRef.current = azimuth / baseRotation
    indexAnimatingRef.current = false
  }

  // local hover state (kept inside Canvas subtree)
  const [hoveredPlaneIdx, setHoveredPlaneIdx] = useState(-1)

  useEffect(() => {
    if (!gl) return
    gl.domElement.style.cursor = hoveredPlaneIdx !== -1 ? 'pointer' : 'default'
    return () => { if (gl) gl.domElement.style.cursor = 'default' }
  }, [hoveredPlaneIdx, gl])


  return (
    <>
    {!isMobile && (
      <Stars radius={1} depth={20} rayleigh={2} count={10000} factor={1} saturation={3} fade speed={3} />
    )}

      <group ref={helixPivot} position={[0, 0, 0]} scale={scale}>
        <group ref={helixContainerRef}>
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
          const leftCount = Math.floor((planesPerCycle - 1) / 2)
          const rightCount = planesPerCycle - 1 - leftCount
          const meshRaycast = function(raycaster, intersects) {
            const currentSel = selectedIndexRef.current
            const visible = index >= currentSel - leftCount && index <= currentSel + rightCount
            console.log('raycast:mesh', { index, visible })
            if (!visible) return
            THREE.Mesh.prototype.raycast.call(this, raycaster, intersects)
            if (intersects.length) console.log('raycast:mesh:hit', { index, hits: intersects.length })
          }
          

          return (
            <group
              key={index}
              rotation={[0, planeRotation, 0]}
              position={[x, y, z]}
            >
              <mesh
                geometry={skewedPlaneGeometry}
                onPointerOver={(e) => { console.log('pointerOver', { index }); setHoveredPlaneIdx(index); e.stopPropagation() }}
                onPointerOut={() => { console.log('pointerOut', { index }); setHoveredPlaneIdx(-1) }}
                onClick={(e) => { console.log('click', { index }); setSelectedIndex(index); e.stopPropagation() }}
                raycast={meshRaycast}
                ref={(ref) => { if (ref) { planeRefs.current[index] = ref; ref.userData.index = index } }}
              >
                <meshBasicMaterial
                  color={isSel ? '#ffffff' : (isHover ? '#555555' : '#1e1d1e')}
                  transparent
                  ref={(mat) => {
                    planeMatsRef.current[index] = mat
                    if (mat && !mat.userData._init) {
                      const currentSel = selectedIndexRef.current
                      const visible = index >= currentSel - leftCount && index <= currentSel + rightCount
                      mat.opacity = visible ? 1 : 0
                      mat.transparent = true
                      mat.depthWrite = false
                      mat.userData._init = true
                    }
                  }}
                  toneMapped={false}
                  side={THREE.DoubleSide}
                  polygonOffset
                  polygonOffsetFactor={1}
                  polygonOffsetUnits={1}
                  depthTest
                  depthWrite
                />
              </mesh>
              <mesh geometry={skewedPlaneGeometry} frustumCulled raycast={() => null}>
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                <Edges color="#fff" raycast={() => null} ref={(edges) => {
                  const mat = edges ? edges.material : undefined
                  edgeMatsRef.current[index] = mat
                  if (mat && !mat.userData._init) {
                    mat.transparent = true
                    const currentSel = selectedIndexRef.current
                    const visible = index >= currentSel - leftCount && index <= currentSel + rightCount
                    mat.opacity = visible ? 1 : 0
                    mat.depthWrite = false
                    mat.userData._init = true
                  }
                }} />
              </mesh>
            </group>
          )
        })}
        </group>

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
    const [skewValue] = useState(-0.2)
    const [planesPerCycle] = useState(5)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const { isMobile, isMid } = useBreakpoint()

    const orthoZoom = 200

    const helixRight  = { scale: 0.4, offsetPx: [420, -280] }
    const helixLeft   = { scale: 0.4, offsetPx: [-450, 100] }
    const helixMobile = { scale: 0.4, offsetPx: [0,   -200] }

    const initialPose = isMobile ? helixMobile : (isMid ? helixLeft : helixRight)

    const [scale, setScale] = useState(initialPose.scale)
    const [offsetPx, setOffsetPx] = useState(initialPose.offsetPx)
    const targetScaleRef = useRef(initialPose.scale)
    const targetOffsetPxRef = useRef(initialPose.offsetPx)
    const lerp = (a,b,t)=>a+(b-a)*t
  useEffect(() => {
    const pose = isMobile ? helixMobile : (isMid ? helixLeft : helixRight)
    targetScaleRef.current = pose.scale
    targetOffsetPxRef.current = [...pose.offsetPx]
  }, [isMobile, isMid])


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
