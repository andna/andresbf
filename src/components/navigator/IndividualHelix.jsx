import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { readThemeColors } from '../../theme.js'
import { useFrame } from '@react-three/fiber'

const labelLines = {
  Experience: ['Expe', 'rience'],
  Portfolio: ['Port', 'folio'],
  Education: ['Edu', 'cation'],
}

const labelMapSize = 1024

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

  const lines = labelLines[label] ?? [label]
  const pad = w * 0.1
  const maxW = w - pad * 2
  let size = Math.floor(h * (lines.length > 1 ? 0.18 : 0.22))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `500 ${size}px system-ui, -apple-system, sans-serif`
  const widest = () => Math.max(...lines.map((line) => ctx.measureText(line).width))
  while (size > 10 && widest() > maxW) {
    size -= 1
    ctx.font = `500 ${size}px system-ui, -apple-system, sans-serif`
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
  const edgesRef = useRef()
  const corners = useMemo(() => {
    const pos = skewedPlaneGeometry.attributes.position
    const pts = []
    for (let i = 0; i < pos.count; i += 1) {
      const next = [pos.getX(i), pos.getY(i), pos.getZ(i)]
      if (!pts.some((pt) => Math.hypot(pt[0] - next[0], pt[1] - next[1], pt[2] - next[2]) < 1e-5)) {
        pts.push(next)
      }
    }
    return pts
  }, [skewedPlaneGeometry])
  const outlineGeom = useMemo(() => {
    if (corners.length < 4) return null
    const [bl, br, tl, tr] = corners.map((p) => new THREE.Vector3(...p))
    return new THREE.BufferGeometry().setFromPoints([bl, br, tr, tl, bl])
  }, [corners])
  const worldNormal = useRef(new THREE.Vector3())
  const viewDir = useRef(new THREE.Vector3())
  const worldPos = useRef(new THREE.Vector3())

  useFrame(({ camera }) => {
    const group = groupRef.current
    const material = edgesRef.current
    if (!group || !material) return
    group.getWorldPosition(worldPos.current)
    viewDir.current.copy(camera.position).sub(worldPos.current).normalize()
    worldNormal.current.set(0, 0, 1).transformDirection(group.matrixWorld)
    const front = worldNormal.current.dot(viewDir.current) > 0
    material.transparent = true
    material.opacity = front ? 1 : 0.3
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
    const skew = { front: textFront, back: textBack }
    drawLabel(texture.image, label, isSel, isHover, false, showLabel, colors, skew)
    const backCtx = backTexture.image.getContext('2d')
    backCtx.setTransform(-1, 0, 0, 1, labelMapSize, 0)
    drawLabel(backTexture.image, label, isSel, isHover, true, showLabel, colors, skew)
    backCtx.setTransform(1, 0, 0, 1, 0, 0)
    texture.needsUpdate = true
    backTexture.needsUpdate = true
  }, [texture, backTexture, label, isSel, isHover, showLabel, colors, textFront, textBack])

  useEffect(() => () => {
    texture.dispose()
    backTexture.dispose()
    document.body.style.cursor = ''
  }, [texture, backTexture])

  useEffect(() => () => outlineGeom?.dispose(), [outlineGeom])

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
      onClick={(e) => { setSelectedIndex(index); e.stopPropagation() }}
    >
      <mesh geometry={skewedPlaneGeometry}>
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
      <mesh geometry={skewedPlaneGeometry}>
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
      {outlineGeom && (
        <line geometry={outlineGeom} raycast={() => null}>
          <lineBasicMaterial ref={edgesRef} color={colors.accent} transparent opacity={1} />
        </line>
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
