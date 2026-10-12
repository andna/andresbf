import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { readThemeColors } from '../../theme.js'
import { useFrame } from '@react-three/fiber'
import { Billboard, Line } from '@react-three/drei'

const labelMapSize = 1024
const capIconScale = 0.6
const capIconNudge = 0.05

const logoUrl = '/logo-a.svg'

const loadLogo = () => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = reject
  image.src = logoUrl
})

let logoPromise
const getLogo = () => {
  if (!logoPromise) logoPromise = loadLogo()
  return logoPromise
}

const drawMark = (canvas, logo, isSel, isBack, showLabel, colors, skew, markScale = 1) => {
  const { accent, bg } = colors
  const face = isBack ? skew.back : skew.front
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  if (!showLabel || !logo) return

  const size = Math.floor(w * 0.36 * markScale)
  const stamp = document.createElement('canvas')
  stamp.width = size
  stamp.height = size
  const stampCtx = stamp.getContext('2d')
  stampCtx.drawImage(logo, 0, 0, size, size)
  stampCtx.globalCompositeOperation = 'source-in'
  stampCtx.fillStyle = isSel ? bg : accent
  stampCtx.fillRect(0, 0, size, size)

  ctx.save()
  ctx.translate(w / 2, h / 2)
  if (!isBack) {
    ctx.rotate(face.rot)
    ctx.transform(1, face.skewY, face.skewX, 1, 0, 0)
  }
  ctx.drawImage(stamp, -size / 2, -size / 2)
  ctx.restore()
}

const uniqueCorners = (geometry) => {
  const pos = geometry.attributes.position
  const pts = []
  for (let i = 0; i < pos.count; i += 1) {
    const next = [pos.getX(i), pos.getY(i), pos.getZ(i)]
    if (!pts.some((pt) => Math.hypot(pt[0] - next[0], pt[1] - next[1], pt[2] - next[2]) < 1e-5)) {
      pts.push(next)
    }
  }
  return pts
}

const omitCapCorner = (pts, cap) => {
  if (!cap || pts.length < 4) return pts
  let omit = 0
  for (let i = 1; i < pts.length; i += 1) {
    if (cap === 'start') {
      if (pts[i][0] < pts[omit][0] || (pts[i][0] === pts[omit][0] && pts[i][1] < pts[omit][1])) omit = i
    } else if (pts[i][0] > pts[omit][0] || (pts[i][0] === pts[omit][0] && pts[i][1] > pts[omit][1])) {
      omit = i
    }
  }
  return pts.filter((_, i) => i !== omit)
}

const uvScratch = new THREE.Matrix3()

const setBackTextUv = (matrix, rot, skewX, skewY) => {
  const cx = 0.5
  const cy = 0.5
  const cos = Math.cos(-rot)
  const sin = Math.sin(-rot)
  matrix.set(
    cos,
    -sin,
    cx - cos * cx + sin * cy,
    sin,
    cos,
    cy - sin * cx - cos * cy,
    0,
    0,
    1
  )
  const a = 1
  const b = -skewY
  const c = skewX
  const d = 1
  uvScratch.set(
    a,
    c,
    cx - a * cx - c * cy,
    b,
    d,
    cy - b * cx - d * cy,
    0,
    0,
    1
  )
  matrix.multiply(uvScratch)
}

const textLift = 0.00

const tipFont = '800 64px "Oxanium", system-ui, sans-serif'
const tipKickerFont = '600 32px "Oxanium", system-ui, sans-serif'

const makeTipTexture = (title, kicker, color, bg) => {
  const canvas = document.createElement('canvas')
  const measure = canvas.getContext('2d')
  measure.font = tipFont
  const textW = measure.measureText(title).width
  measure.font = tipKickerFont
  const kickerW = kicker ? measure.measureText(kicker).width : 0
  const padX = 40
  const padY = 28
  const w = Math.ceil(Math.max(textW, kickerW) + padX * 2)
  const h = kicker ? 32 + 12 + 64 + padY * 2 : 64 + padY * 2
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = bg
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (kicker) {
    ctx.font = tipKickerFont
    ctx.fillText(kicker, w / 2, padY + 16)
    ctx.font = tipFont
    ctx.fillText(title, w / 2, padY + 32 + 12 + 32)
  } else {
    ctx.font = tipFont
    ctx.fillText(title, w / 2, h / 2 + 2)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return { tex, aspect: w / h }
}

const desktopTipY = [
  -0.53, // C1
  -0.31, // C3
  -0.07, // F3
  0.21, // F1
  0.18, // F2
  -0.75, // C2
]

function tipFor(index, angle, baseRotation, radius) {
  const cycle = Math.max(1, Math.round((Math.PI * 2) / baseRotation))
  let along = index - angle / baseRotation
  along = ((along % cycle) + cycle) % cycle
  const slot = Math.floor(along) % cycle
  const next = (slot + 1) % cycle
  const frac = along - Math.floor(along)
  const at = (n) => {
    const steps = Math.min(n, cycle - n)
    const tipY = cycle === 6 ? desktopTipY[n] : (steps === 2 ? 0 : 0.45) + 0.08
    const tipZ = cycle === 6 && n === 5 ? -radius + 0.28 : -radius
    return { tipY, tipZ }
  }
  const a = at(slot)
  const b = at(next)
  return {
    slot: Math.round(along) % cycle,
    tipY: a.tipY + (b.tipY - a.tipY) * frac,
    tipZ: a.tipZ + (b.tipZ - a.tipZ) * frac,
  }
}

function RugTip({ title, kicker, color, bg, tipY, tipZ, slot, tipCarryRef, anchor = [0, 0, 0], index, baseRotation, radius, poseRef }) {
  const [tipMap, setTipMap] = useState(null)
  const mapRef = useRef(null)
  const groupRef = useRef()
  const lineRef = useRef()
  const boxRef = useRef()
  const boxGroupRef = useRef()
  const right = useRef(new THREE.Vector3())
  const up = useRef(new THREE.Vector3())
  const inv = useRef(new THREE.Matrix4())
  const toAnchor = useRef(new THREE.Vector3())
  const end = useRef(new THREE.Vector3())
  const grown = useRef(new THREE.Vector3())
  const fromLocal = useRef(new THREE.Vector3())
  const fromWorld = useRef(new THREE.Vector3())
  const center = useRef(new THREE.Vector3())
  const tipVec = useRef(new THREE.Vector3())
  const started = useRef(0)
  const slide = useRef(false)
  const placed = useRef(false)
  const dotMatRef = useRef()
  const dotRingRef = useRef()
  const rugNormal = useRef(new THREE.Vector3())
  const rugPos = useRef(new THREE.Vector3())
  const rugView = useRef(new THREE.Vector3())
  const boxH = kicker ? 0.22 : 0.16
  const boxW = boxH * (tipMap?.aspect || 4)
  const tip = [0, tipY, tipZ]

  useEffect(() => {
    let cancelled = false
    const paint = () => {
      if (cancelled) return
      const next = makeTipTexture(title, kicker, color, bg)
      mapRef.current?.tex.dispose()
      mapRef.current = next
      setTipMap(next)
    }
    paint()
    Promise.all([document.fonts.load(tipFont), document.fonts.load(tipKickerFont)]).then(paint)
    return () => {
      cancelled = true
    }
  }, [title, kicker, color, bg])

  useEffect(() => () => {
    mapRef.current?.tex.dispose()
    mapRef.current = null
  }, [])

  useLayoutEffect(() => {
    const carry = tipCarryRef.current
    const fromSlot = carry.slot
    const f2c2 = (fromSlot === 4 && slot === 5) || (fromSlot === 5 && slot === 4)
    if (carry.justClosed && !f2c2) {
      slide.current = true
      fromWorld.current.copy(carry.world)
    }
    carry.justClosed = false
    return () => {
      if (carry.hasPos) carry.justClosed = true
    }
  }, [tipCarryRef])

  useFrame(({ camera, clock }) => {
    const group = groupRef.current
    const line = lineRef.current
    if (!group || !line?.geometry) return
    if (!started.current) started.current = clock.elapsedTime
    const elapsed = clock.elapsedTime - started.current
    const grow = !slide.current
    const u = Math.min(1, elapsed / 0.32)
    const t = 1 - (1 - u) ** 3
    const boxU = grow ? Math.min(1, Math.max(0, (elapsed - 0.2) / 0.12)) : 1
    const boxT = 1 - (1 - boxU) ** 3
    if (boxRef.current) boxRef.current.scale.setScalar(grow ? 0.02 + 0.98 * boxT : 1)
    group.updateWorldMatrix(true, false)
    if (slide.current && !placed.current) {
      fromLocal.current.copy(fromWorld.current)
      group.worldToLocal(fromLocal.current)
      placed.current = true
    }
    const liveAngle = poseRef?.current?.orbitAngle
    const live = typeof liveAngle === 'number' ? tipFor(index, liveAngle, baseRotation, radius) : null
    const liveSlot = live ? live.slot : slot
    tipVec.current.set(0, live ? live.tipY : tip[1], live ? live.tipZ : tip[2])
    const slideU = Math.min(1, elapsed / 0.2)
    const slideT = 1 - (1 - slideU) ** 3
    if (slide.current) center.current.lerpVectors(fromLocal.current, tipVec.current, slideT)
    else center.current.copy(tipVec.current)
    if (boxGroupRef.current) boxGroupRef.current.position.copy(center.current)
    inv.current.copy(group.matrixWorld).invert()
    right.current.set(1, 0, 0).applyQuaternion(camera.quaternion).transformDirection(inv.current)
    up.current.set(0, 1, 0).applyQuaternion(camera.quaternion).transformDirection(inv.current)
    toAnchor.current.set(anchor[0] - center.current.x, anchor[1] - center.current.y, anchor[2] - center.current.z)
    const dx = toAnchor.current.dot(right.current)
    const dy = toAnchor.current.dot(up.current)
    const ax = Math.abs(dx)
    const ay = Math.abs(dy)
    const s = Math.min(ax > 1e-5 ? (boxW / 2) / ax : Infinity, ay > 1e-5 ? (boxH / 2) / ay : Infinity)
    end.current.copy(center.current)
    if (Number.isFinite(s)) end.current.addScaledVector(right.current, dx * s).addScaledVector(up.current, dy * s)
    grown.current.set(anchor[0], anchor[1], anchor[2]).lerp(end.current, t)
    line.geometry.setPositions([anchor[0], anchor[1], anchor[2], grown.current.x, grown.current.y, grown.current.z])
    line.computeLineDistances()
    if (line.material) line.material.dashOffset = -clock.elapsedTime * 0.09
    const carry = tipCarryRef.current
    carry.world.copy(center.current)
    group.localToWorld(carry.world)
    carry.hasPos = true
    carry.slot = liveSlot
    const rug = group.parent
    if (rug) {
      rug.getWorldPosition(rugPos.current)
      rugView.current.copy(camera.position).sub(rugPos.current).normalize()
      rugNormal.current.set(0, 0, 1).transformDirection(rug.matrixWorld)
      const close = rugNormal.current.dot(rugView.current) > 0
      const fill = close ? color : bg
      const stroke = close ? bg : color
      if (dotMatRef.current) dotMatRef.current.color.set(fill)
      if (dotRingRef.current) dotRingRef.current.color.set(stroke)
      if (line.material) line.material.depthTest = close
      line.renderOrder = close ? 0 : 7
    }
  })

  return (
    <group ref={groupRef} raycast={() => null}>
      <Line
        ref={lineRef}
        points={[anchor, tip]}
        color={color}
        dashed
        dashSize={0.04}
        gapSize={0.02}
        lineWidth={1.5}
        transparent
        depthTest
        depthWrite={false}
        raycast={() => null}
      />
      <Billboard position={anchor}>
        <mesh raycast={() => null} renderOrder={8}>
          <circleGeometry args={[0.016, 28]} />
          <meshBasicMaterial ref={dotMatRef} color={color} transparent opacity={0.5} side={THREE.DoubleSide} depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh raycast={() => null} renderOrder={9}>
          <ringGeometry args={[0.016, 0.021, 28]} />
          <meshBasicMaterial ref={dotRingRef} color={bg} transparent opacity={0.5} side={THREE.DoubleSide} depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
      </Billboard>
      <group ref={boxGroupRef}>
        <Billboard>
          {tipMap && (
            <mesh ref={boxRef} scale={slide.current ? 1 : 0.02} raycast={() => null} renderOrder={10}>
              <planeGeometry args={[boxW, boxH]} />
              <meshBasicMaterial map={tipMap.tex} transparent depthTest={false} depthWrite toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          )}
        </Billboard>
      </group>
    </group>
  )
}

const ringOrder = (pts) => {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
  return [...pts].sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx))
}

export default function IndividualHelix({
  index,
  y,
  planeRotation,
  baseRotation,
  radius,
  skewedPlaneGeometry,
  selectedIndex,
  setSelectedIndex,
  hoveredPlaneIdx,
  setHoveredPlaneIdx,
  showTips,
  tipCarryRef,
  showLabel,
  title,
  kicker,
  blank = false,
  cap = null,
  textFront,
  textBack,
  poseRef,
  isMobile = false,
}) {
  const x = radius * Math.sin(planeRotation)
  const z = radius * Math.cos(planeRotation)
  const isSel = selectedIndex === index
  const isHover = hoveredPlaneIdx === index
  const frontAngle = poseRef?.current?.orbitAngle ?? selectedIndex * baseRotation
  const { slot, tipY, tipZ } = tipFor(index, frontAngle, baseRotation, radius)
  const [colors, setColors] = useState(() => ({
    accent: '#1a5564',
    bg: '#ebebe5',
    hover: '#c1cdcb',
  }))
  const groupRef = useRef()
  const outlineRef = useRef()
  const corners = useMemo(
    () => omitCapCorner(uniqueCorners(skewedPlaneGeometry), blank ? cap : null),
    [skewedPlaneGeometry, blank, cap]
  )
  const tipAnchor = useMemo(() => {
    if (!blank || corners.length < 3) return [0, 0, 0]
    const n = corners.length
    return corners.reduce((sum, p) => [sum[0] + p[0] / n, sum[1] + p[1] / n, sum[2] + p[2] / n], [0, 0, 0])
  }, [blank, corners])
  const faceGeom = useMemo(() => {
    if (!blank || corners.length < 3) return skewedPlaneGeometry
    const ordered = ringOrder(corners).slice(0, 3)
    const geom = new THREE.BufferGeometry()
    const positions = new Float32Array(9)
    const uvs = new Float32Array(6)
    const srcPos = skewedPlaneGeometry.attributes.position
    const srcUv = skewedPlaneGeometry.attributes.uv
    const planeUv = ordered.map((p) => {
      for (let i = 0; i < srcPos.count; i += 1) {
        const dx = srcPos.getX(i) - p[0]
        const dy = srcPos.getY(i) - p[1]
        const dz = srcPos.getZ(i) - p[2]
        if (dx * dx + dy * dy + dz * dz < 1e-10) return [srcUv.getX(i), srcUv.getY(i)]
      }
      return [0.5, 0.5]
    })
    const nudge = cap === 'end' ? -capIconNudge : capIconNudge
    const cu = planeUv.reduce((sum, uv) => sum + uv[0], 0) / planeUv.length + nudge
    const cv = planeUv.reduce((sum, uv) => sum + uv[1], 0) / planeUv.length + nudge
    ordered.forEach((p, i) => {
      positions[i * 3] = p[0]
      positions[i * 3 + 1] = p[1]
      positions[i * 3 + 2] = p[2]
      uvs[i * 2] = 0.5 + (planeUv[i][0] - cu)
      uvs[i * 2 + 1] = 0.5 + (planeUv[i][1] - cv)
    })
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geom.setIndex([0, 1, 2])
    geom.computeVertexNormals()
    return geom
  }, [blank, corners, skewedPlaneGeometry, cap])
  const outlinePoints = useMemo(() => {
    if (corners.length < 3) return null
    const ordered = ringOrder(corners).map((p) => new THREE.Vector3(...p))
    return [...ordered, ordered[0]]
  }, [corners])
  const worldNormal = useRef(new THREE.Vector3())
  const viewDir = useRef(new THREE.Vector3())
  const worldPos = useRef(new THREE.Vector3())
  const frontLabelRef = useRef()
  const backLabelRef = useRef()

  useFrame(({ camera }) => {
    const group = groupRef.current
    const outline = outlineRef.current
    const tb = poseRef?.current?.textBack ?? textBack
    if (tb && backTexture) {
      backTexture.matrixAutoUpdate = false
      setBackTextUv(backTexture.matrix, tb.rot ?? 0, tb.skewX ?? 0, tb.skewY ?? 0)
    }
    if (!group || !outline?.material) return
    group.getWorldPosition(worldPos.current)
    viewDir.current.copy(camera.position).sub(worldPos.current).normalize()
    worldNormal.current.set(0, 0, 1).transformDirection(group.matrixWorld)
    const facing = worldNormal.current.dot(viewDir.current)
    const close = THREE.MathUtils.smoothstep(facing, -0.08, 0.08)
    const fade = 0.3 + 0.7 * close
    outline.material.transparent = true
    outline.material.opacity = fade
    if (frontLabelRef.current) frontLabelRef.current.material.opacity = fade
    if (backLabelRef.current) backLabelRef.current.material.opacity = fade
  })

  useEffect(() => {
    const sync = () => setColors(readThemeColors())
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const { texture, backTexture } = useMemo(() => {
    const make = () => {
      const canvas = document.createElement('canvas')
      canvas.width = labelMapSize
      canvas.height = labelMapSize
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 16
      tex.generateMipmaps = false
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.matrixAutoUpdate = false
      return tex
    }
    return { texture: make(), backTexture: make() }
  }, [])

  useEffect(() => {
    let cancelled = false
    const skew = { front: textFront, back: textBack }
    const markScale = cap ? capIconScale : 1
    const paint = (logo) => {
      if (cancelled) return
      drawMark(texture.image, logo, isSel, false, showLabel, colors, skew, markScale)
      const backCtx = backTexture.image.getContext('2d')
      backCtx.setTransform(-1, 0, 0, 1, labelMapSize, 0)
      drawMark(backTexture.image, logo, isSel, true, showLabel, colors, skew, markScale)
      backCtx.setTransform(1, 0, 0, 1, 0, 0)
      texture.needsUpdate = true
      backTexture.needsUpdate = true
    }
    getLogo().then(paint)
    return () => {
      cancelled = true
    }
  }, [texture, backTexture, isSel, showLabel, colors, textFront, textBack, cap])

  useEffect(() => () => {
    texture.dispose()
    backTexture.dispose()
    document.body.style.cursor = ''
  }, [texture, backTexture])

  useEffect(() => () => {
    if (faceGeom !== skewedPlaneGeometry) faceGeom.dispose()
  }, [faceGeom, skewedPlaneGeometry])

  const mutePointer = isSel && !!cap && !isMobile
  const faceRaycast = mutePointer ? () => null : THREE.Mesh.prototype.raycast

  useEffect(() => {
    if (!mutePointer || hoveredPlaneIdx !== index) return
    if (setHoveredPlaneIdx(-1, index) === false) return
    document.body.style.cursor = ''
  }, [mutePointer, hoveredPlaneIdx, index, setHoveredPlaneIdx])

  return (
    <group
      ref={groupRef}
      rotation={[0, planeRotation, 0]}
      position={[x, y, z]}
      onPointerOver={(e) => {
        if (mutePointer) return
        setHoveredPlaneIdx(index)
        document.body.style.cursor = 'pointer'
        e.stopPropagation()
      }}
      onPointerOut={() => {
        if (mutePointer) return
        if (setHoveredPlaneIdx(-1, index) === false) return
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        setSelectedIndex(index)
        e.stopPropagation()
      }}
    >
      <mesh geometry={faceGeom} raycast={faceRaycast}>
        <meshBasicMaterial
          color={isSel ? colors.accent : isHover ? colors.hover : colors.bg}
          toneMapped={false}
          side={THREE.FrontSide}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
          depthTest
          depthWrite
        />
      </mesh>
      <mesh geometry={faceGeom} raycast={faceRaycast}>
        <meshBasicMaterial
          color={isSel ? colors.accent : isHover ? colors.hover : colors.bg}
          toneMapped={false}
          side={THREE.BackSide}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
          depthTest
          depthWrite
        />
      </mesh>
      {showLabel && (
        <mesh ref={frontLabelRef} geometry={faceGeom} position={[0, 0, textLift]} raycast={() => null}>
          <meshBasicMaterial
            map={texture}
            transparent
            toneMapped={false}
            side={THREE.FrontSide}
            depthTest
            depthWrite={false}
          />
        </mesh>
      )}
      {showLabel && (
        <mesh ref={backLabelRef} geometry={faceGeom} position={[0, 0, -textLift]} raycast={() => null}>
          <meshBasicMaterial
            map={backTexture}
            transparent
            toneMapped={false}
            side={THREE.BackSide}
            depthTest
            depthWrite={false}
          />
        </mesh>
      )}
      {outlinePoints && (
        <Line
          ref={outlineRef}
          points={outlinePoints}
          color={colors.accent}
          lineWidth={2.4}
          transparent
          toneMapped={false}
          raycast={() => null}
        />
      )}
      {isHover && showTips && title && !mutePointer && (
        <RugTip title={title} kicker={kicker} color={colors.accent} bg={colors.bg} tipY={tipY} tipZ={tipZ} slot={slot} tipCarryRef={tipCarryRef} anchor={tipAnchor} index={index} baseRotation={baseRotation} radius={radius} poseRef={poseRef} />
      )}
      {corners.map((pt, i) => (
        <group key={i} position={pt} raycast={() => null}>
          <mesh>
            <sphereGeometry args={[isSel ? 0.0055 : 0.004, 12, 12]} />
            <meshBasicMaterial
              color={colors.accent}
              transparent
              opacity={isSel ? 1 : 0.45}
              depthWrite={false}
            />
          </mesh>
          {isSel && (
            <>
              <mesh>
                <torusGeometry args={[0.012, 0.00115, 8, 28]} />
                <meshBasicMaterial color={colors.accent} depthWrite={false} />
              </mesh>
              <mesh>
                <ringGeometry args={[0.0165, 0.0182, 28]} />
                <meshBasicMaterial
                  color={colors.accent}
                  transparent
                  opacity={0.7}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
              <mesh>
                <boxGeometry args={[0.024, 0.00085, 0.00085]} />
                <meshBasicMaterial color={colors.accent} transparent opacity={0.85} depthWrite={false} />
              </mesh>
              <mesh>
                <boxGeometry args={[0.00085, 0.024, 0.00085]} />
                <meshBasicMaterial color={colors.accent} transparent opacity={0.85} depthWrite={false} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  )
}
