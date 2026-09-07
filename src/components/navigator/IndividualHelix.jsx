import * as THREE from 'three'
import { Edges } from '@react-three/drei'

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
}) {
  const x = radius * Math.sin(planeRotation)
  const z = radius * Math.cos(planeRotation)
  const isSel = selectedIndex === index
  const isHover = hoveredPlaneIdx === index

  return (
    <group
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
}
