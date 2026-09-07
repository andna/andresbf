import * as THREE from 'three'
import { Edges } from '@react-three/drei'

export default function Helix({
  totalPlanes,
  skewedPlaneGeometry,
  skewValue,
  baseRotation,
  radius,
  selectedIndex,
  setSelectedIndex,
  hoveredPlaneIdx,
  setHoveredPlaneIdx,
}) {
  return (
    <>
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

        return (
          <group
            key={index}
            rotation={[0, planeRotation, 0]}
            position={[x, y, z]}
            onPointerOver={(e) => { setHoveredPlaneIdx(index); e.stopPropagation() }}
            onPointerOut={() => setHoveredPlaneIdx(-1)}
          >
            <mesh
              geometry={skewedPlaneGeometry}
              onClick={(e) => { setSelectedIndex(index); e.stopPropagation() }}
            >
              <meshBasicMaterial
                color={isSel ? '#ffffff' : (isHover ? '#555555' : '#1e1d1e')}
                toneMapped={false}
                side={THREE.DoubleSide}
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
      })}
    </>
  )
}
