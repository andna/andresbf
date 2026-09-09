import IndividualHelix from './IndividualHelix.jsx'

export function helixPlaneY(index, skewValue, planeWidth, planeHeight) {
  const absSkew = Math.abs(skewValue)
  const t = Math.min(1, Math.max(0, (absSkew - 0.6) / 0.6))
  const stepTighten = 0.89 + (0.71 - 0.89) * t
  const nudge = planeHeight > 0.5 ? 0.8 : 1
  const skewAngle = Math.atan(absSkew)
  const baseY = -index * planeHeight * Math.sin(skewAngle) * stepTighten * nudge
  const scalingFactor = Math.pow(absSkew, 1.5) * 0.29
  const skewCompensationY = skewValue * (
    index === 0
      ? planeHeight
      : planeHeight + scalingFactor * index * stepTighten * nudge
  )
  return baseY + skewCompensationY
}

export default function Helix({
  sections,
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
  showLabel,
  textFront,
  textBack,
}) {
  return (
    <>
      {sections.map((section, index) => {
        const y = helixPlaneY(index, skewValue, planeWidth, planeHeight)
        const planeRotation = baseRotation * index

        return (
          <IndividualHelix
            key={`${section.id}-${index}`}
            index={index}
            y={y}
            radius={radius}
            skewedPlaneGeometry={skewedPlaneGeometry}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            hoveredPlaneIdx={hoveredPlaneIdx}
            setHoveredPlaneIdx={setHoveredPlaneIdx}
            planeRotation={planeRotation}
            label={section.label}
            showLabel={showLabel}
            textFront={textFront}
            textBack={textBack}
          />
        )
      })}
    </>
  )
}
