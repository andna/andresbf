import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'

const labelLines = {
  Experience: ['Expe', 'rience'],
  Portfolio: ['Port', 'folio'],
  Education: ['Edu', 'cation'],
}

const drawLabel = (canvas, label, isSel, isHover, isBack) => {
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = isSel
    ? '#ffffff'
    : isHover
      ? (isBack ? '#9a9a9a' : '#555555')
      : (isBack ? '#8a8a8a' : '#1e1d1e')
  ctx.fillRect(0, 0, w, h)

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

  ctx.globalAlpha = isSel ? 1 : 0.5
  ctx.fillStyle = isSel ? '#111111' : '#ffffff'
  const gap = size * 1.15
  const startY = h / 2 - ((lines.length - 1) * gap) / 2
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, startY + i * gap)
  })
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
}) {
  const x = radius * Math.sin(planeRotation)
  const z = radius * Math.cos(planeRotation)
  const isSel = selectedIndex === index
  const isHover = hoveredPlaneIdx === index

  const { texture, backTexture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const backCanvas = document.createElement('canvas')
    backCanvas.width = 512
    backCanvas.height = 512
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    const backTexture = new THREE.CanvasTexture(backCanvas)
    backTexture.colorSpace = THREE.SRGBColorSpace
    backTexture.anisotropy = 8
    return { texture, backTexture }
  }, [])

  useEffect(() => {
    drawLabel(texture.image, label, isSel, isHover, false)
    const backCtx = backTexture.image.getContext('2d')
    backCtx.setTransform(-1, 0, 0, 1, 512, 0)
    drawLabel(backTexture.image, label, isSel, isHover, true)
    backCtx.setTransform(1, 0, 0, 1, 0, 0)
    texture.needsUpdate = true
    backTexture.needsUpdate = true
  }, [texture, backTexture, label, isSel, isHover])

  useEffect(() => () => {
    texture.dispose()
    backTexture.dispose()
  }, [texture, backTexture])

  return (
    <group
      rotation={[0, planeRotation, 0]}
      position={[x, y, z]}
      onPointerOver={(e) => { setHoveredPlaneIdx(index); e.stopPropagation() }}
      onPointerOut={() => setHoveredPlaneIdx(-1)}
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
      <mesh geometry={skewedPlaneGeometry} frustumCulled>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges color="#fff" />
      </mesh>
    </group>
  )
}
