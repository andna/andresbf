import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mixHex, readThemeColors } from '../../theme.js'

const axisDefs = [
  { key: 'x', dir: [1, 0, 0], label: 'X', rot: [0, 0, -Math.PI / 2] },
  { key: 'y', dir: [0, 1, 0], label: 'Y', rot: [0, 0, 0] },
  { key: 'z', dir: [0, 0, 1], label: 'Z', rot: [Math.PI / 2, 0, 0] },
]

const makeLabelTexture = (letter, ink, bg) => {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 128, 128)
  ctx.beginPath()
  ctx.arc(64, 64, 54, 0, Math.PI * 2)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.fillStyle = ink
  ctx.font = '700 72px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(letter, 64, 68)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

function YBillboard({ position, children }) {
  const ref = useRef()
  useFrame(({ camera }) => {
    const el = ref.current
    if (!el) return
    el.lookAt(camera.position)
  })
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  )
}

function AxisArm({ dir, rot, label, ink, bg, length, thickness, labelSize }) {
  const texture = useMemo(() => makeLabelTexture(label, ink, bg), [label, ink, bg])
  useEffect(() => () => texture.dispose(), [texture])
  const tip = length * 0.82
  const cone = length * 0.11
  const labelPos = length * 1.28
  const labelY = dir[1] * labelPos + (dir[1] === 0 ? -labelSize * 0.55 : 0)

  return (
    <group raycast={() => null}>
      <mesh position={[dir[0] * tip * 0.5, dir[1] * tip * 0.5, dir[2] * tip * 0.5]} rotation={rot}>
        <cylinderGeometry args={[thickness, thickness, tip, 6]} />
        <meshBasicMaterial color={ink} toneMapped={false} />
      </mesh>
      <mesh
        position={[dir[0] * (tip + cone * 0.35), dir[1] * (tip + cone * 0.35), dir[2] * (tip + cone * 0.35)]}
        rotation={rot}
      >
        <coneGeometry args={[thickness * 3.8, cone, 8]} />
        <meshBasicMaterial color={ink} toneMapped={false} />
      </mesh>
      <YBillboard position={[dir[0] * labelPos, labelY, dir[2] * labelPos]}>
        <mesh>
          <planeGeometry args={[labelSize, labelSize]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </YBillboard>
    </group>
  )
}

export default function HelixGizmo({ position = [0, 0, 0], midY = 0, yOffset = -0.25, size = 0.22 }) {
  const [colors, setColors] = useState(() => readThemeColors())
  const ink = useMemo(() => mixHex(colors.secondary, colors.bg, 0.7), [colors.secondary, colors.bg])
  const groupRef = useRef()
  const offsetRef = useRef(yOffset)
  const length = size
  const thickness = size * 0.01
  const labelSize = size * 0.386
  const shell = size * 0.72
  const shellEdges = useMemo(() => {
    const box = new THREE.BoxGeometry(shell, shell, shell)
    const edges = new THREE.EdgesGeometry(box)
    box.dispose()
    return edges
  }, [shell])

  useEffect(() => {
    const sync = () => setColors(readThemeColors())
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => shellEdges.dispose(), [shellEdges])

  useFrame(() => {
    offsetRef.current += (yOffset - offsetRef.current) * 0.06
    if (groupRef.current) {
      groupRef.current.position.x = position[0]
      groupRef.current.position.y = midY + offsetRef.current
      groupRef.current.position.z = position[2]
    }
  })

  return (
    <group ref={groupRef} position={[position[0], midY + yOffset, position[2]]} raycast={() => null}>
      <lineSegments geometry={shellEdges}>
        <lineBasicMaterial color={ink} transparent opacity={0.45} toneMapped={false} depthWrite={false} />
      </lineSegments>
      <mesh>
        <sphereGeometry args={[thickness * 2.2, 10, 10]} />
        <meshBasicMaterial color={ink} toneMapped={false} />
      </mesh>
      {axisDefs.map((axis) => (
        <AxisArm
          key={axis.key}
          dir={axis.dir}
          rot={axis.rot}
          label={axis.label}
          ink={ink}
          bg={colors.bg}
          length={length}
          thickness={thickness}
          labelSize={labelSize}
        />
      ))}
    </group>
  )
}
