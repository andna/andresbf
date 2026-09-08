import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'

const labelLines = {
  Experience: ['Expe', 'rience'],
  Portfolio: ['Port', 'folio'],
  Education: ['Edu', 'cation'],
}

const accentColor = '#1a5564'
const bgColor = '#ebebe5'
const hoverColor = '#c1cdcb'

const textSkewX = 0
const textSkewYFront = -0.2
const textSkewYBack = 0.2
const labelMapSize = 1024

const drawLabel = (canvas, label, isSel, isHover, isBack, showLabel) => {
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = isSel ? accentColor : isHover ? hoverColor : bgColor
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
  ctx.fillStyle = isSel ? bgColor : accentColor
  const gap = size * 1.15
  const startY = h / 2 - ((lines.length - 1) * gap) / 2
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.transform(1, isBack ? textSkewYBack : textSkewYFront, textSkewX, 1, 0, 0)
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
}) {
  const x = radius * Math.sin(planeRotation)
  const z = radius * Math.cos(planeRotation)
  const isSel = selectedIndex === index
  const isHover = hoveredPlaneIdx === index

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
    drawLabel(texture.image, label, isSel, isHover, false, showLabel)
    const backCtx = backTexture.image.getContext('2d')
    backCtx.setTransform(-1, 0, 0, 1, labelMapSize, 0)
    drawLabel(backTexture.image, label, isSel, isHover, true, showLabel)
    backCtx.setTransform(1, 0, 0, 1, 0, 0)
    texture.needsUpdate = true
    backTexture.needsUpdate = true
  }, [texture, backTexture, label, isSel, isHover, showLabel])

  useEffect(() => () => {
    texture.dispose()
    backTexture.dispose()
    document.body.style.cursor = ''
  }, [texture, backTexture])

  return (
    <group
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
      <mesh geometry={skewedPlaneGeometry} frustumCulled>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges color={accentColor} />
      </mesh>
    </group>
  )
}
