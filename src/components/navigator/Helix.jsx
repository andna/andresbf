import IndividualHelix from './IndividualHelix.jsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { readThemeColors } from '../../theme.js'

const withDash = (geom) => {
  const pos = geom.attributes.position
  const dist = new Float32Array(pos.count)
  for (let i = 1; i < pos.count; i += 1) {
    dist[i] = dist[i - 1] + Math.hypot(
      pos.getX(i) - pos.getX(i - 1),
      pos.getY(i) - pos.getY(i - 1),
      pos.getZ(i) - pos.getZ(i - 1),
    )
  }
  geom.setAttribute('lineDistance', new THREE.BufferAttribute(dist, 1))
  return geom
}

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
  const [accent, setAccent] = useState(() => readThemeColors().accent)

  const localCorners = useMemo(() => {
    const pos = skewedPlaneGeometry.attributes.position
    const pts = []
    for (let i = 0; i < pos.count; i += 1) {
      const next = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))
      if (!pts.some((pt) => pt.distanceTo(next) < 1e-5)) pts.push(next)
    }
    return pts.sort((a, b) => a.y - b.y || a.x - b.x)
  }, [skewedPlaneGeometry])

  const { contactClose, contactFar } = useMemo(() => {
    const toWorld = (index, p) => {
      const angle = baseRotation * index
      const ox = radius * Math.sin(angle)
      const oy = helixPlaneY(index, skewValue, planeWidth, planeHeight)
      const oz = radius * Math.cos(angle)
      const c = Math.cos(angle)
      const s = Math.sin(angle)
      return new THREE.Vector3(
        ox + p.x * c + p.z * s,
        oy + p.y,
        oz - p.x * s + p.z * c,
      )
    }
    const makeContacts = (step, corners) => {
      const geoms = []
      for (let i = 0; i < sections.length - step; i += 1) {
        for (let k = 0; k < corners.length; k += 1) {
          const p0 = toWorld(i, corners[k])
          const p1 = toWorld(i + step, corners[k])
          geoms.push(withDash(new THREE.BufferGeometry().setFromPoints([p0, p1])))
        }
      }
      return geoms
    }
    const outerCorners = localCorners.filter((corner) => corner.x > 0)
    return {
      contactClose: makeContacts(2, outerCorners),
      contactFar: makeContacts(3, localCorners.slice(-1)),
    }
  }, [sections.length, localCorners, radius, baseRotation, skewValue, planeWidth, planeHeight])

  const contactsRef = useRef([...contactClose, ...contactFar])
  contactsRef.current = [...contactClose, ...contactFar]

  useEffect(() => {
    const sync = () => setAccent(readThemeColors().accent)
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    contactsRef.current.forEach((geom) => geom.dispose())
  }, [])

  return (
    <>
      {contactClose.map((geom, index) => (
        <line key={`contact-close-${index}`} geometry={geom} raycast={() => null}>
          <lineDashedMaterial color={accent} transparent opacity={1} dashSize={0.042} gapSize={0.022} depthWrite={false} />
        </line>
      ))}
      {contactFar.map((geom, index) => (
        <line key={`contact-far-${index}`} geometry={geom} raycast={() => null}>
          <lineDashedMaterial color={accent} transparent opacity={1} dashSize={0.042} gapSize={0.055} depthWrite={false} />
        </line>
      ))}
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
