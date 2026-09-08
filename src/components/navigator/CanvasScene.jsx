import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls, OrthographicCamera, Stars } from '@react-three/drei'
import Helix, { helixPlaneY } from './Helix.jsx'

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

  useEffect(() => {
    if (!isMobile) {
      camRef.current?.up.set(0, 1, 0)
      return
    }
    const el = gl.domElement
    let dragging = false
    let lastY = 0
    const onDown = (event) => {
      dragging = true
      lastY = event.clientY
      userRotatingRef.current = true
    }
    const onMove = (event) => {
      if (!dragging) return
      targetAngleRef.current -= (event.clientY - lastY) * 0.01
      lastY = event.clientY
      currentIndexRef.current = targetAngleRef.current / baseRotation
    }
    const onUp = () => {
      dragging = false
      userRotatingRef.current = false
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
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
    if (!isMobile) controls.update()
  })

  useFrame(() => {
    const cam = camRef.current
    const pivot = helixPivot.current
    if (!cam || !pivot) return
    pivot.getWorldPosition(tmpTarget.current)

    if (isMobile || !userRotatingRef.current) {
      cam.userData.angle ??= targetAngleRef.current
      if (isMobile && userRotatingRef.current) cam.userData.angle = targetAngleRef.current
      else cam.userData.angle += (targetAngleRef.current - cam.userData.angle) * 0.06
      const a = cam.userData.angle
      if (isMobile) orbitOffset.current.set(0, Math.sin(a) * 10, Math.cos(a) * 10)
      else orbitOffset.current.set(Math.sin(a) * 10, 0, Math.cos(a) * 10)
      cam.position.copy(tmpTarget.current).add(orbitOffset.current)
      if (isMobile) {
        orbitForward.current.copy(tmpTarget.current).sub(cam.position)
        cam.up.crossVectors(orbitRight.current, orbitForward.current).normalize()
      }
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
    const dx = isMobile
      ? cam.position.y - tmpTarget.current.y
      : cam.position.x - tmpTarget.current.x
    const dz = cam.position.z - tmpTarget.current.z
    const azimuth = Math.atan2(dx, dz)
    cam.userData.angle = azimuth
    targetAngleRef.current = azimuth
    currentIndexRef.current = azimuth / baseRotation
  }

  return (
    <>
      {!isMobile && (
        <Stars radius={1} depth={20} rayleigh={2} count={3000} factor={1} saturation={3} fade speed={0} color="blue" />
      )}

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
            showLabel={!isMobile}
          />
        </group>
      </group>

      <OrthographicCamera ref={camRef} makeDefault zoom={orthoZoom} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableRotate={!isMobile}
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
