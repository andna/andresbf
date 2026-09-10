import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { readThemeColors } from '../../theme.js'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'

const labelMapSize = 1024

const labelFont = '"Black Ops One", system-ui, sans-serif'

const drawLabel = (canvas, label, isSel, isHover, isBack, showLabel, colors, skew) => {
  const { accent, bg, hover } = colors
  const face = isBack ? skew.back : skew.front
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = isSel ? accent : isHover ? hover : bg
  ctx.fillRect(0, 0, w, h)

  if (!showLabel) return

  const lines = [label]
  const pad = w * 0.1
  const maxW = w - pad * 2
  let size = Math.floor(h * 0.22)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${size}px ${labelFont}`
  const widest = () => Math.max(...lines.map((line) => ctx.measureText(line).width))
  while (size > 10 && widest() > maxW) {
    size -= 1
    ctx.font = `${size}px ${labelFont}`
  }

  ctx.globalAlpha = isBack ? 0.3 : 1
  ctx.fillStyle = isSel ? bg : accent
  const gap = size * 1.15
  const startY = h / 2 - ((lines.length - 1) * gap) / 2
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate(face.rot)
  ctx.transform(1, face.skewY, face.skewX, 1, 0, 0)
  ctx.translate(-w / 2, -h / 2)
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, startY + i * gap)
  })
  ctx.restore()
  ctx.globalAlpha = 1
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
    } else if (pts[i][1] < pts[omit][1] || (pts[i][1] === pts[omit][1] && pts[i][0] > pts[omit][0])) {
      omit = i
    }
  }
  return pts.filter((_, i) => i !== omit)
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
  radius,
  skewedPlaneGeometry,
  selectedIndex,
  setSelectedIndex,
  hoveredPlaneIdx,
  setHoveredPlaneIdx,
  label,
  showLabel,
  blank = false,
  cap = null,
  textFront,
  textBack,
}) {
  const x = radius * Math.sin(planeRotation)
  const z = radius * Math.cos(planeRotation)
  const isSel = selectedIndex === index
  const isHover = hoveredPlaneIdx === index
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
  const faceGeom = useMemo(() => {
    if (!blank || corners.length < 3) return skewedPlaneGeometry
    const ordered = ringOrder(corners)
    const geom = new THREE.BufferGeometry()
    const positions = new Float32Array(9)
    const uvs = new Float32Array([0, 0, 1, 0, 0.5, 1])
    ordered.slice(0, 3).forEach((p, i) => {
      positions[i * 3] = p[0]
      positions[i * 3 + 1] = p[1]
      positions[i * 3 + 2] = p[2]
    })
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geom.setIndex([0, 1, 2])
    geom.computeVertexNormals()
    return geom
  }, [blank, corners, skewedPlaneGeometry])
  const outlinePoints = useMemo(() => {
    if (corners.length < 3) return null
    const ordered = ringOrder(corners).map((p) => new THREE.Vector3(...p))
    return [...ordered, ordered[0]]
  }, [corners])
  const worldNormal = useRef(new THREE.Vector3())
  const viewDir = useRef(new THREE.Vector3())
  const worldPos = useRef(new THREE.Vector3())

  useFrame(({ camera }) => {
    const group = groupRef.current
    const outline = outlineRef.current
    if (!group || !outline?.material) return
    group.getWorldPosition(worldPos.current)
    viewDir.current.copy(camera.position).sub(worldPos.current).normalize()
    worldNormal.current.set(0, 0, 1).transformDirection(group.matrixWorld)
    const front = worldNormal.current.dot(viewDir.current) > 0
    outline.material.transparent = true
    outline.material.opacity = front ? 1 : 0.3
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
      return tex
    }
    return { texture: make(), backTexture: make() }
  }, [])

  useEffect(() => {
    let cancelled = false
    const skew = { front: textFront, back: textBack }
    const paint = () => {
      if (cancelled) return
      drawLabel(texture.image, label, isSel, isHover, false, showLabel, colors, skew)
      const backCtx = backTexture.image.getContext('2d')
      backCtx.setTransform(-1, 0, 0, 1, labelMapSize, 0)
      drawLabel(backTexture.image, label, isSel, isHover, true, showLabel, colors, skew)
      backCtx.setTransform(1, 0, 0, 1, 0, 0)
      texture.needsUpdate = true
      backTexture.needsUpdate = true
    }
    paint()
    document.fonts.load(`64px ${labelFont}`).then(paint)
    return () => {
      cancelled = true
    }
  }, [texture, backTexture, label, isSel, isHover, showLabel, colors, textFront, textBack])

  useEffect(() => () => {
    texture.dispose()
    backTexture.dispose()
    document.body.style.cursor = ''
  }, [texture, backTexture])

  useEffect(() => () => {
    if (faceGeom !== skewedPlaneGeometry) faceGeom.dispose()
  }, [faceGeom, skewedPlaneGeometry])

  return (
    <group
      ref={groupRef}
      rotation={[0, planeRotation, 0]}
      position={[x, y, z]}
      onPointerOver={(e) => {
        setHoveredPlaneIdx(index)
        document.body.style.cursor = 'pointer'
        e.stopPropagation()
      }}
      onPointerOut={() => {
        setHoveredPlaneIdx(-1)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        setSelectedIndex(index)
        e.stopPropagation()
      }}
    >
      <mesh geometry={faceGeom}>
        <meshBasicMaterial
          map={texture}
          toneMapped={false}
          side={THREE.FrontSide}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
          depthTest
          depthWrite
        />
      </mesh>
      <mesh geometry={faceGeom}>
        <meshBasicMaterial
          map={backTexture}
          toneMapped={false}
          side={THREE.BackSide}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
          depthTest
          depthWrite
        />
      </mesh>
      {outlinePoints && (
        <Line
          ref={outlineRef}
          points={outlinePoints}
          color={colors.accent}
          lineWidth={2.4}
          transparent
          opacity={1}
          toneMapped={false}
          raycast={() => null}
        />
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
