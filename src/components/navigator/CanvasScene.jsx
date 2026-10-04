import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import Helix, { helixPlaneY } from './Helix.jsx'

const cornerScratch = new THREE.Vector3()
const screenPts = [
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
]
const localSlots = [
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
]

function pointInPoly(pts, count, x, y) {
  let inside = false
  for (let i = 0, j = count - 1; i < count; j = i++) {
    const yi = pts[i].y
    const yj = pts[j].y
    if ((yi > y) === (yj > y)) continue
    const xi = pts[i].x
    const xj = pts[j].x
    if (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function orderScreen(pts, count) {
  let cx = 0
  let cy = 0
  for (let i = 0; i < count; i += 1) {
    cx += pts[i].x
    cy += pts[i].y
  }
  cx /= count
  cy /= count
  const ranked = []
  for (let i = 0; i < count; i += 1) ranked.push(pts[i])
  ranked.sort((p, q) => Math.atan2(p.y - cy, p.x - cx) - Math.atan2(q.y - cy, q.x - cx))
  for (let i = 0; i < count; i += 1) pts[i] = ranked[i]
}

function faceOf(obj) {
  if (!obj.isMesh || obj.material?.map || obj.material?.side !== THREE.FrontSide) return null
  const count = obj.geometry?.attributes?.position?.count ?? 0
  if (count < 3 || count > 6 || Math.abs(obj.position.z) > 1e-3) return null
  const group = obj.parent
  if (!group || Math.hypot(group.position.x, group.position.z) < 0.2) return null
  return group
}

function idleHoverIndex({
  cam,
  pivot,
  pointer,
  width,
  height,
  baseRotation,
  sections,
  selectedIndex,
  hovered,
}) {
  if (width < 1 || height < 1) return hovered
  pivot.updateMatrixWorld(true)
  cam.updateMatrixWorld()
  const px = pointer.x
  const py = pointer.y
  let best = -1
  let bestZ = Infinity
  pivot.traverse((obj) => {
    const group = faceOf(obj)
    if (!group) return
    const index = Math.round(group.rotation.y / baseRotation)
    if (sections[index]?.blank && index === selectedIndex) return
    const pos = obj.geometry.attributes.position
    let n = 0
    for (let i = 0; i < pos.count && n < 4; i += 1) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      let dup = false
      for (let j = 0; j < n; j += 1) {
        const prev = localSlots[j]
        if (Math.abs(prev.x - x) < 1e-4 && Math.abs(prev.y - y) < 1e-4 && Math.abs(prev.z - z) < 1e-4) {
          dup = true
          break
        }
      }
      if (dup) continue
      localSlots[n].set(x, y, z)
      n += 1
    }
    for (let i = 0; i < n; i += 1) {
      cornerScratch.copy(localSlots[i]).applyMatrix4(obj.matrixWorld).project(cam)
      const slot = screenPts[i]
      slot.x = ((cornerScratch.x + 1) * 0.5) * width
      slot.y = ((1 - cornerScratch.y) * 0.5) * height
      slot.z = cornerScratch.z
    }
    if (n < 3) return
    orderScreen(screenPts, n)
    if (!pointInPoly(screenPts, n, px, py)) return
    let z = 0
    for (let i = 0; i < n; i += 1) z += screenPts[i].z
    z /= n
    if (z < bestZ) {
      bestZ = z
      best = index
    }
  })
  return best
}

export default function CanvasScene({
  orthoZoom,
  scale,
  offsetPx,
  sections,
  planesPerCycle,
  planeHeight = 0.5,
  skewValue,
  selectedIndex,
  setSelectedIndex,
  isMobile,
  hoveredPlaneIdx,
  setHoveredPlaneIdx,
  showTips,
  screenRoll,
  poseRef,
  scrollIndexRef,
  orbitModeRef,
  wheelAtRef,
  textFront,
  textBack,
  gizmoScale = 0.6,
  gizmoOpacity = 0.75,
  contactCloseOpacity = 0.6,
  contactFarOpacity = 0.7,
  secondaryColor,
}) {
  const totalPlanes = sections.length

  const planeWidth = 0.5
  const baseRotation = useMemo(() => (Math.PI * 2) / planesPerCycle, [planesPerCycle])
  const radius = useMemo(
    () => planeWidth / (2 * Math.tan(Math.PI / planesPerCycle)),
    [planeWidth, planesPerCycle]
  )

  const helixCenterY = useMemo(
    () => (helixPlaneY(0, skewValue, planeWidth, planeHeight) + helixPlaneY(Math.max(0, totalPlanes - 1), skewValue, planeWidth, planeHeight)) / 2,
    [skewValue, totalPlanes, planeWidth, planeHeight]
  )

  const { skewedPlaneGeometry } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
    const m = new THREE.Matrix4()
    m.makeShear(skewValue, 0, 0, 0, 0, 0)
    geometry.applyMatrix4(m)
    geometry.computeVertexNormals()
    return { skewedPlaneGeometry: geometry }
  }, [skewValue, planeWidth, planeHeight])

  useEffect(() => () => skewedPlaneGeometry.dispose(), [skewedPlaneGeometry])

  const camRef = useRef()
  const controlsRef = useRef()
  const helixPivot = useRef()
  const { size, gl } = useThree()
  const tmpTarget = useRef(new THREE.Vector3())
  const userRotatingRef = useRef(false)
  const currentIndexRef = useRef(0)
  const targetAngleRef = useRef(0)
  const orbitOffset = useRef(new THREE.Vector3())
  const orbitRight = useRef(new THREE.Vector3(1, 0, 0))
  const orbitForward = useRef(new THREE.Vector3())
  const autoSpinRef = useRef(false)
  const lastHoverRef = useRef(0)
  const hoveredOnceRef = useRef(false)
  const seenWheelRef = useRef(0)
  const hoveredIdxRef = useRef(hoveredPlaneIdx)
  hoveredIdxRef.current = hoveredPlaneIdx
  const autoSpinSpeed = (Math.PI * 2) / 36
  const aimedIndexRef = useRef(0)
  const spinWasRef = useRef(false)
  const pointerRef = useRef({ x: 0, y: 0, t: 0, inside: false })
  const hoverTrackRef = useRef(false)
  const hoverCheckAngleRef = useRef(null)

  useEffect(() => {
    camRef.current?.up.set(0, 1, 0)
    const el = gl.domElement
    let dragging = false
    let lastX = 0
    let lastY = 0
    const onDown = (event) => {
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      userRotatingRef.current = true
    }
    const onMove = (event) => {
      if (!dragging) return
      if (isMobile) {
        targetAngleRef.current -= (event.clientY - lastY) * 0.01
        lastY = event.clientY
      } else {
        targetAngleRef.current -= (event.clientX - lastX) * 0.01
        lastX = event.clientX
      }
      currentIndexRef.current = targetAngleRef.current / baseRotation
    }
    const onUp = () => {
      dragging = false
      userRotatingRef.current = false
    }
    const onPointer = (event) => {
      const box = pointerRef.current
      box.x = event.offsetX
      box.y = event.offsetY
      box.t = performance.now()
      box.inside = true
    }
    const onPointerLeave = () => {
      pointerRef.current.inside = false
      hoverTrackRef.current = false
      hoverCheckAngleRef.current = null
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onPointer)
    el.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onPointer)
      el.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [isMobile, gl, baseRotation])

  useFrame(() => {
    const pivot = helixPivot.current
    const controls = controlsRef.current
    if (!pivot || !controls) return
    pivot.getWorldPosition(tmpTarget.current)
    controls.target.copy(tmpTarget.current)
  })

  useFrame((_, delta) => {
    const cam = camRef.current
    const pivot = helixPivot.current
    if (!cam || !pivot) return
    pivot.getWorldPosition(tmpTarget.current)

    const now = performance.now()
    const wheelAt = wheelAtRef?.current ?? 0
    if (wheelAt !== seenWheelRef.current) {
      seenWheelRef.current = wheelAt
      autoSpinRef.current = false
      lastHoverRef.current = Math.max(lastHoverRef.current, wheelAt)
    }
    if (hoveredIdxRef.current >= 0) {
      hoveredOnceRef.current = true
      lastHoverRef.current = now
    }
    if (orbitModeRef?.current === 'click') autoSpinRef.current = false
    else if (
      hoveredOnceRef.current &&
      !autoSpinRef.current &&
      hoveredIdxRef.current < 0 &&
      now - lastHoverRef.current >= 3000
    ) autoSpinRef.current = true

    const spinning = autoSpinRef.current && !userRotatingRef.current
    const desired = orbitModeRef?.current === 'click' ? selectedIndex : scrollIndexRef?.current
    if (spinning) {
      const next = (cam.userData.angle ?? targetAngleRef.current) + delta * autoSpinSpeed
      cam.userData.angle = next
      targetAngleRef.current = next
      currentIndexRef.current = next / baseRotation
      spinWasRef.current = true
    } else if (!userRotatingRef.current && typeof desired === 'number') {
      const indexDelta = desired - aimedIndexRef.current
      if (spinWasRef.current) {
        spinWasRef.current = false
        const from = cam.userData.angle ?? targetAngleRef.current
        if (indexDelta === 0) {
          const base = desired * baseRotation
          let turn = (base - from) % (Math.PI * 2)
          if (turn > Math.PI) turn -= Math.PI * 2
          if (turn < -Math.PI) turn += Math.PI * 2
          targetAngleRef.current = from + turn
        } else {
          targetAngleRef.current = from + indexDelta * baseRotation
        }
      } else if (indexDelta !== 0) {
        targetAngleRef.current += indexDelta * baseRotation
      }
      aimedIndexRef.current = desired
      currentIndexRef.current = desired
    }
    cam.userData.angle ??= targetAngleRef.current
    if (userRotatingRef.current) cam.userData.angle = targetAngleRef.current
    else if (!spinning) cam.userData.angle += (targetAngleRef.current - cam.userData.angle) * 0.06
    const a = cam.userData.angle
    if (isMobile) orbitOffset.current.set(0, Math.sin(a) * 10, Math.cos(a) * 10)
    else orbitOffset.current.set(Math.sin(a) * 10, 0, Math.cos(a) * 10)
    cam.position.copy(tmpTarget.current).add(orbitOffset.current)
    cam.up.set(0, 1, 0)
    const live = poseRef?.current
    const roll = live?.screenRoll ?? screenRoll
    const liveScale = live?.scale
    if (typeof liveScale === 'number' && liveScale > 0) pivot.scale.setScalar(liveScale)
    if (isMobile) {
      orbitForward.current.copy(tmpTarget.current).sub(cam.position)
      cam.up.crossVectors(orbitRight.current, orbitForward.current).normalize()
    } else {
      orbitForward.current.copy(tmpTarget.current).sub(cam.position).normalize()
      cam.up.applyAxisAngle(orbitForward.current, roll)
    }
    cam.lookAt(tmpTarget.current)

    const [ox, oy] = offsetPx
    if (Math.abs(ox) > 0.01 || Math.abs(oy) > 0.01) cam.setViewOffset(size.width, size.height, -ox, -oy, size.width, size.height)
    else cam.clearViewOffset()
    cam.updateProjectionMatrix()

    const pointer = pointerRef.current
    const idle = pointer.inside && now - pointer.t > 90
    if (!spinning || !idle) {
      hoverTrackRef.current = false
      hoverCheckAngleRef.current = null
    } else if (hoveredIdxRef.current >= 0 || hoverTrackRef.current) {
      hoverTrackRef.current = true
      const lastCheck = hoverCheckAngleRef.current
      const due = lastCheck == null || Math.abs(a - lastCheck) >= 0.02
      if (due) {
        hoverCheckAngleRef.current = a
        const hit = idleHoverIndex({
          cam,
          pivot,
          pointer,
          width: size.width,
          height: size.height,
          baseRotation,
          sections,
          selectedIndex,
          hovered: hoveredIdxRef.current,
        })
        if (hit !== hoveredIdxRef.current) {
          if (hit < 0) {
            if (setHoveredPlaneIdx(-1, hoveredIdxRef.current) !== false) {
              hoveredIdxRef.current = -1
              document.body.style.cursor = ''
            }
          } else {
            setHoveredPlaneIdx(hit)
            hoveredIdxRef.current = hit
            document.body.style.cursor = 'pointer'
          }
        }
      }
    }
  })

  const onControlStart = () => { userRotatingRef.current = true }
  const onControlEnd = () => {
    userRotatingRef.current = false
    const cam = camRef.current
    const pivot = helixPivot.current
    if (!cam || !pivot) return
    pivot.getWorldPosition(tmpTarget.current)
    const dx = isMobile
      ? cam.position.y - tmpTarget.current.y
      : cam.position.x - tmpTarget.current.x
    const dz = cam.position.z - tmpTarget.current.z
    const azimuth = Math.atan2(dx, dz)
    const current = cam.userData.angle ?? azimuth
    const turns = Math.round((current - azimuth) / (Math.PI * 2))
    const unwrapped = azimuth + turns * Math.PI * 2
    cam.userData.angle = unwrapped
    targetAngleRef.current = unwrapped
    currentIndexRef.current = unwrapped / baseRotation
    aimedIndexRef.current = unwrapped / baseRotation
  }

  return (
    <>
      <group
        ref={helixPivot}
        position={[0, 0, 0]}
        scale={scale}
        rotation={isMobile ? [0, 0, Math.PI / 2] : [0, 0, 0]}
      >
        <group position={[0, -helixCenterY, 0]}>
          <Helix
            sections={sections}
            skewedPlaneGeometry={skewedPlaneGeometry}
            skewValue={skewValue}
            baseRotation={baseRotation}
            radius={radius}
            planeWidth={planeWidth}
            planeHeight={planeHeight}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            hoveredPlaneIdx={hoveredPlaneIdx}
            setHoveredPlaneIdx={setHoveredPlaneIdx}
            showTips={showTips}
            showLabel={!isMobile}
            textFront={textFront}
            textBack={textBack}
            poseRef={poseRef}
            gizmoScale={gizmoScale}
            gizmoOpacity={gizmoOpacity}
            contactCloseOpacity={contactCloseOpacity}
            contactFarOpacity={contactFarOpacity}
            secondaryColor={secondaryColor}
          />
        </group>
      </group>

      <OrthographicCamera ref={camRef} makeDefault zoom={orthoZoom} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableRotate={false}
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
