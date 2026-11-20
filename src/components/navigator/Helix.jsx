import IndividualHelix, { TipWarmup } from './IndividualHelix.jsx'
import HelixGizmo from './HelixGizmo.jsx'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { readThemeColors } from '../../theme.js'
import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { gpuDevices } from './gpu.js'

// Glow (in the accent colour) on the contact lines that touch the selected rug: [lineWidth px, opacity at the
// rug's corner], widest first. It fades out along the line, strongest at the corner.
const contactGlow = [[12, 0.22], [7, 0.4], [3, 0.85]]
// How far along the contact the glow reaches (0 = selected rug's corner, 1 = far end),
// fading linearly to nothing. Each line is a single segment: fat lines draw round caps
// per segment, and translucent caps overlapping at the joins showed as bright dots.
const contactGlowReach = 0.55
// Solid core line under the glow, the full length of the contact: [lineWidth px, opacity
// at the selected rug's corner]. It fades along the line into a plain contact (secondary
// colour at the usual contact opacity) at the far end.
const contactGlowCore = [1.6, 0.9]
// Share of the usual contact opacity left at the core's far end.
const contactGlowFarEnd = 0.35
// Seconds for the glow to grow out from the selected rug's corner after a selection.
const contactGlowGrow = 0.6
const zero = new THREE.Vector3()

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
  showTips,
  showLabel,
  textFront,
  textBack,
  poseRef,
  gizmoScale = 0.6,
  gizmoOpacity = 0.75,
  contactCloseOpacity = 0.6,
  contactFarOpacity = 0.7,
  secondaryColor,
  showSecondary = true,
  isMobile = false,
}) {
  const [themeSecondary, setThemeSecondary] = useState(() => readThemeColors().secondary)
  const secondary = secondaryColor || themeSecondary
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

  const { contactClose, contactFar, contactSegments } = useMemo(() => {
    if (!showSecondary) return { contactClose: [], contactFar: [], contactSegments: [] }
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
    const isOmitted = (index, corner) => {
      if (!sections[index]?.blank) return false
      const omit = index === 0
        ? localCorners.reduce((best, c) => (c.x < best.x || (c.x === best.x && c.y < best.y) ? c : best))
        : index === sections.length - 1
          ? localCorners.reduce((best, c) => (c.x > best.x || (c.x === best.x && c.y > best.y) ? c : best))
          : null
      return omit ? corner.distanceTo(omit) < 1e-5 : false
    }
    const segments = []
    const makeContacts = (step, corners, dashed) => {
      const geoms = []
      for (let i = 0; i < sections.length - step; i += 1) {
        for (let k = 0; k < corners.length; k += 1) {
          if (isOmitted(i, corners[k]) || isOmitted(i + step, corners[k])) continue
          const p0 = toWorld(i, corners[k])
          const p1 = toWorld(i + step, corners[k])
          segments.push({ a: i, b: i + step, p0, p1, step })
          const geom = new THREE.BufferGeometry().setFromPoints([p0, p1])
          geoms.push(dashed ? withDash(geom) : geom)
        }
      }
      return geoms
    }
    const outerCorners = localCorners.filter((corner) => corner.x > 0)
    return {
      contactClose: makeContacts(2, outerCorners, true),
      contactFar: makeContacts(3, localCorners.slice(-1), true),
      contactSegments: segments,
    }
  }, [showSecondary, sections, localCorners, radius, baseRotation, skewValue, planeWidth, planeHeight])

  // Contacts touching the selected rug are drawn solid + glowing instead of dashed.
  const litContacts = useMemo(() => {
    if (!gpuDevices || isMobile) return new Set()
    return new Set(contactSegments.flatMap(({ a, b }, k) => (a === selectedIndex || b === selectedIndex ? [k] : [])))
  }, [contactSegments, selectedIndex, isMobile])

  // Each contact touching the selected rug, as points running from its corner outward,
  // with RGBA vertex colours that fade along the line.
  const contactGlowLines = useMemo(() => {
    if (!gpuDevices || isMobile) return []
    const rgb = new THREE.Color(accent).toArray()
    const accentColor = new THREE.Color(accent)
    const secondaryColor3 = new THREE.Color(secondary)
    return contactSegments
      .filter(({ a, b }) => a === selectedIndex || b === selectedIndex)
      .map(({ a, p0, p1, step }) => {
        const [from, to] = a === selectedIndex ? [p0, p1] : [p1, p0]
        const dir = to.clone().sub(from)
        const plain = step === 2 ? contactCloseOpacity : contactFarOpacity
        return {
          origin: from,
          end: dir,
          glowEnd: dir.clone().multiplyScalar(contactGlowReach),
          rgb,
          // Core: accent at the corner blending to a plain contact at the far end.
          core: [[...accentColor.toArray(), contactGlowCore[1]], [...secondaryColor3.toArray(), plain * contactGlowFarEnd]],
        }
      })
  }, [contactSegments, selectedIndex, accent, secondary, contactCloseOpacity, contactFarOpacity, isMobile])

  // Grow the glow out from the corner: each glow sits in a group at the selected rug's
  // corner and scales from 0 to 1 (line widths are in pixels, so only the length grows).
  const contactGlowGroups = useRef([])
  const contactGlowStart = useRef(null)
  useEffect(() => {
    contactGlowStart.current = null
  }, [selectedIndex])
  useFrame(({ clock }) => {
    if (!contactGlowLines.length) return
    if (contactGlowStart.current === null) contactGlowStart.current = clock.elapsedTime
    const t = Math.min(1, (clock.elapsedTime - contactGlowStart.current) / contactGlowGrow)
    const eased = 1 - (1 - t) ** 3
    contactGlowGroups.current.forEach((group) => group?.scale.setScalar(Math.max(eased, 1e-4)))
  })

  const contactsRef = useRef([...contactClose, ...contactFar])
  contactsRef.current = [...contactClose, ...contactFar]
  const tipCarryRef = useRef({ justClosed: false, world: new THREE.Vector3() })

  useLayoutEffect(() => {
    if (hoveredPlaneIdx < 0 || !showTips) {
      tipCarryRef.current.justClosed = false
      tipCarryRef.current.hasPos = false
    }
  }, [hoveredPlaneIdx, showTips])

  useEffect(() => {
    const sync = () => {
      const colors = readThemeColors()
      setThemeSecondary(colors.secondary)
      setAccent(colors.accent)
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    contactsRef.current.forEach((geom) => geom.dispose())
  }, [])

  const gizmoMove = 0.35
  const gizmoStart = 1
  const y0 = helixPlaneY(0, skewValue, planeWidth, planeHeight)
  const yN = helixPlaneY(Math.max(0, sections.length - 1), skewValue, planeWidth, planeHeight)
  const gizmoMidY = (y0 + yN) / 2
  const gizmoResetAt = sections.length - 3
  // const gizmoNewY = -0.35
  // const gizmoYOffset = selectedIndex >= gizmoResetAt
  //   ? gizmoNewY - (selectedIndex - gizmoResetAt) * gizmoMove
  //   : gizmoStart - selectedIndex * gizmoMove
  const gizmoYOffset = gizmoStart - (gizmoResetAt - 1) * gizmoMove
  const gizmoSize = Math.min(radius * 0.55, planeWidth * 0.48) * gizmoScale

  return (
    <>
      <TipWarmup />
      {showSecondary && (
        <HelixGizmo
          midY={gizmoMidY}
          yOffset={gizmoYOffset}
          size={gizmoSize}
          opacity={gizmoOpacity}
          secondary={secondary}
        />
      )}
      {showSecondary && contactClose.map((geom, index) => (
        <line key={`contact-close-${index}`} geometry={geom} visible={!litContacts.has(index)} raycast={() => null}>
          <lineDashedMaterial color={secondary} transparent opacity={contactCloseOpacity} dashSize={0.042} gapSize={0.022} depthWrite={false} />
        </line>
      ))}
      {showSecondary && contactFar.map((geom, index) => (
        <line key={`contact-far-${index}`} geometry={geom} visible={!litContacts.has(contactClose.length + index)} raycast={() => null}>
          <lineDashedMaterial color={secondary} transparent opacity={contactFarOpacity} dashSize={0.008} gapSize={0.02} depthWrite={false} />
        </line>
      ))}
      {showSecondary && contactGlowLines.map(({ origin, end, glowEnd, rgb, core }, index) => (
        <group
          key={`contact-glow-${selectedIndex}-${index}`}
          ref={(group) => { contactGlowGroups.current[index] = group }}
          position={origin}
          scale={1e-4}
        >
          <Line
            points={[zero, end]}
            vertexColors={core}
            lineWidth={contactGlowCore[0]}
            transparent
            depthWrite={false}
            toneMapped={false}
            raycast={() => null}
          />
          {contactGlow.map(([width, opacity]) => (
            <Line
              key={width}
              points={[zero, glowEnd]}
              vertexColors={[[...rgb, opacity], [...rgb, 0]]}
              lineWidth={width}
              transparent
              depthWrite={false}
              toneMapped={false}
              raycast={() => null}
            />
          ))}
        </group>
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
            showTips={showTips}
            tipCarryRef={tipCarryRef}
            planeRotation={planeRotation}
            baseRotation={baseRotation}
            label={section.label}
            title={section.title}
            kicker={section.kicker}
            icon={section.icon}
            showLabel={showLabel}
            blank={!!section.blank}
            cap={section.blank ? (index === 0 ? 'start' : 'end') : null}
            textFront={textFront}
            textBack={textBack}
            poseRef={poseRef}
            isMobile={isMobile}
          />
        )
      })}
    </>
  )
}
