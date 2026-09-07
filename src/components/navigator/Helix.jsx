import IndividualHelix from './IndividualHelix.jsx'

export function helixPlaneY(index, skewValue, planeWidth, planeHeight) {
  const absSkew = Math.abs(skewValue)
  const t = Math.min(1, Math.max(0, (absSkew - 0.6) / 0.3))
  const stepTighten = 0.89 + (0.8 - 0.89) * t
  const skewAngle = Math.atan(absSkew)
  const baseY = -index * planeWidth * Math.sin(skewAngle) * stepTighten
  const scalingFactor = Math.pow(absSkew, 1.5) * 0.29
  const skewCompensationY = skewValue * (
    index === 0 ? planeHeight : planeHeight + scalingFactor * index * stepTighten
  )
  return baseY + skewCompensationY
}

export default function Helix({
  totalPlanes,
  skewedPlaneGeometry,
  skewValue,
  baseRotation,
  radius,
  planeWidth = 0.7,
  planeHeight = 0.5,
  selectedIndex,
  setSelectedIndex,
  hoveredPlaneIdx,
  setHoveredPlaneIdx,
}) {
  return (
    <>
      {Array.from({ length: totalPlanes }).map((_, index) => {
        const y = helixPlaneY(index, skewValue, planeWidth, planeHeight)
        const planeRotation = baseRotation * index

        return (
          <IndividualHelix
            key={index}
            index={index}
            y={y}
            radius={radius}
            skewedPlaneGeometry={skewedPlaneGeometry}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            hoveredPlaneIdx={hoveredPlaneIdx}
            setHoveredPlaneIdx={setHoveredPlaneIdx}
            planeRotation={planeRotation}
          />
        )
      })}
    </>
  )
}
