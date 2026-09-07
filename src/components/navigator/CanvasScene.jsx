import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls, OrthographicCamera, Stars } from '@react-three/drei'
import Helix from './Helix.jsx'
import NavigatorNav from './NavigatorNav.jsx'

export default function CanvasScene({
  orthoZoom,
  scale,
  offsetPx,
  sections,
  planesPerCycle,
  skewValue,
  selectedIndex,
  setSelectedIndex,
  isMobile,
}) {
  const helixScale = 0.6
  const totalPlanes = sections.length

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

  const calculated = useMemo(() => {
    const skewAngle = Math.atan(Math.abs(skewValue))
    const RAD2DEG = 180 / Math.PI
    const skewYDeg = skewAngle * RAD2DEG * 0.88
    const stepWorld = Math.sin(skewAngle) + Math.pow(Math.abs(skewValue), 2.5) * 0.1
    const unitToPx = orthoZoom * helixScale
    const lineHeightPx = unitToPx * stepWorld * 1.85
    return { skewYDeg, lineHeightPx }
  }, [skewValue, orthoZoom])

  const camRef = useRef()
  const controlsRef = useRef()
  const helixPivot = useRef()
  const { size } = useThree()
  const tmpTarget = useRef(new THREE.Vector3())
  const userRotatingRef = useRef(false)
  const currentIndexRef = useRef(0)
  const targetAngleRef = useRef(0)

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

  useFrame(() => {
    const pivot = helixPivot.current
    const controls = controlsRef.current
    if (!pivot || !controls) return
    pivot.getWorldPosition(tmpTarget.current)
    controls.target.copy(tmpTarget.current)
    controls.update()
  })

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

  const [hoveredPlaneIdx, setHoveredPlaneIdx] = useState(-1)

  const navigatorListStyle = useMemo(() => {
    const lerp = (a, b, t) => a + (b - a) * t
    const t = Math.min(1, Math.max(0, (scale - 0.4) / (0.6 - 0.4)))
    const tx = lerp(-30, -5, t)
    const ty = lerp(-10, -7, t)

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
        <Helix
          totalPlanes={totalPlanes}
          skewedPlaneGeometry={skewedPlaneGeometry}
          skewValue={skewValue}
          baseRotation={baseRotation}
          radius={radius}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          hoveredPlaneIdx={hoveredPlaneIdx}
          setHoveredPlaneIdx={setHoveredPlaneIdx}
        />
        <NavigatorNav
          sections={sections}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          setHoveredPlaneIdx={setHoveredPlaneIdx}
          navigatorListStyle={navigatorListStyle}
        />
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
