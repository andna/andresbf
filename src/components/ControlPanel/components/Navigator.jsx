import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Edges, OrbitControls, OrthographicCamera } from '@react-three/drei'

const lineWidth = 2

const colors = {
    selected: '#ffffff',
    hovered: '#555555',
    default: '#28262B',
    line: '#444'
}

function SkewedPlane({ skewedPlaneGeometry, planeRotation = 0, isSelected = false, isExternallyHovered = false, onClick, ...props }) {
    const [hovered, hover] = useState(false)
    const edgesRef = useRef(null)

    useEffect(() => {
        if (!edgesRef.current) return
        const mat = edgesRef.current.material
        if (!mat) return
        mat.linewidth = lineWidth
        if (mat.color) mat.color.set(colors.line)
    }, [])

    return (
        <group {...props}>
            <group rotation={[0, planeRotation, 0]}
                onPointerOver={(e) => { hover(true); e.stopPropagation() }}
                onPointerOut={() => hover(false)}
            >
                <mesh
                    geometry={skewedPlaneGeometry}
                    onClick={(e) => {
                        if (onClick) onClick()
                        e.stopPropagation()
                    }}
                >
                    <meshBasicMaterial color={isSelected ? colors.selected : ((hovered || isExternallyHovered) ? colors.hovered : colors.default)} toneMapped={false} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} depthTest depthWrite />
                </mesh>
                <mesh geometry={skewedPlaneGeometry} frustumCulled>
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                    <Edges ref={edgesRef} color={colors.line} lineWidth={lineWidth} />
                </mesh>
            </group>
        </group>
    )
}

function Helix({ skewValue = -0.1, planesPerCycle = 4, indexHovered = -1, selectedIndex = 0, setSelectedIndex, totalPlanes, ...props }) {
    const mesh = useRef(null)

    const baseRotation = (Math.PI * 2) / planesPerCycle
    const targetRotationY = useRef(0)
    const currentRotationIndex = useRef(0)

    useEffect(() => {
        const current = currentRotationIndex.current % planesPerCycle
        const target = selectedIndex % planesPerCycle
        let delta = target - current
        const half = planesPerCycle / 2
        if (delta > half) delta -= planesPerCycle
        if (delta < -half) delta += planesPerCycle
        currentRotationIndex.current += delta
        targetRotationY.current = -currentRotationIndex.current * baseRotation
    }, [selectedIndex, baseRotation, planesPerCycle])

    useFrame(() => {
        if (mesh.current) {
            mesh.current.rotation.y += (targetRotationY.current - mesh.current.rotation.y) * 0.1
        }
    })

    const planeWidth = 1
    const radius = planeWidth / (2 * Math.tan(Math.PI / planesPerCycle))

    const { skewedPlaneGeometry } = useMemo(() => {
        const geometry = new THREE.PlaneGeometry(1, 0.35)
        const m = new THREE.Matrix4()
        m.makeShear(skewValue, 0, 0, 0, 0, 0)
        geometry.applyMatrix4(m)
        geometry.computeVertexNormals()
        return { skewedPlaneGeometry: geometry }
    }, [skewValue])

    useEffect(() => {
        return () => {
            skewedPlaneGeometry.dispose()
        }
    }, [skewedPlaneGeometry])

    return (
        <group ref={mesh} {...props}>
            {Array.from({ length: totalPlanes }).map((_, index) => {
                const skewAngle = Math.atan(Math.abs(skewValue))
                const distance = 1
                const baseY = -index * distance * Math.sin(skewAngle)

                let skewCompensationY
                if (index === 0) {
                    skewCompensationY = skewValue * 0.5
                } else {
                    const normalizedSkew = Math.abs(skewValue)
                    const scalingFactor = Math.pow(normalizedSkew, 1.5) * 0.29
                    skewCompensationY = skewValue * (0.5 + scalingFactor * index)
                }

                const y = baseY + skewCompensationY
                const planeRotation = baseRotation * index
                const x = radius * Math.sin(planeRotation)
                const z = radius * Math.cos(planeRotation)

                return (
                    <SkewedPlane
                        key={index}
                        index={index}
                        skewedPlaneGeometry={skewedPlaneGeometry}
                        planeRotation={planeRotation}
                        position={[x, y, z]}
                        isSelected={selectedIndex === index}
                        isExternallyHovered={indexHovered === index}
                        onClick={() => setSelectedIndex(index)}
                    />
                )
            })}
        </group>
    )
}

function Common({ color, zoom }) {
    return (
        <Suspense fallback={null}>
            {color && <color attach='background' args={[color]} />}
            <ambientLight />
            <directionalLight color={'white'} position={[20, 30, 10]} intensity={23233} decay={0.2} />
            <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={zoom} />
        </Suspense>
    )
}

function Slider({ title, value, onChange, min, max, step = 1, left = '300px' }) {
    return (
        <div style={{ left }} className="absolute bottom-4 z-10 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {title}: {value}
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    )
}

export default function Navigator() {
    const [skewValue, setSkewValue] = useState(-0.37)
    const [planesPerCycle, setPlanesPerCycle] = useState(3)
    const [indexHovered, setIndexHovered] = useState(-1)
    const helixScale = 0.6
    const orthoZoom = 200
    const skewAngle = Math.atan(Math.abs(skewValue))
    const RAD2DEG = 180 / Math.PI
    const skewYDeg = skewAngle * RAD2DEG * 1.6
    const stepWorld = Math.sin(skewAngle) + Math.pow(Math.abs(skewValue), 2.5) * 0.1
    const planeWidthWorld = 1
    const radiusWorld = planeWidthWorld / (2 * Math.tan(Math.PI / planesPerCycle))
    const gapPx = 20
    const unitToPx = orthoZoom * helixScale
    const lineHeightPx = unitToPx * stepWorld * 0.74
    const helixViewWidthPx = 4 * unitToPx * radiusWorld
    const listLeftPx = helixViewWidthPx + gapPx
    const [selectedIndex, setSelectedIndex] = useState(0)
    const totalPlanes = 7

    return (
        <div className="navigator" style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative' }}>
                <Slider title="Planes per cycle" value={planesPerCycle} onChange={setPlanesPerCycle} min={3} max={8} step={1} left='0px' />
                <Slider title="Skew" value={skewValue} onChange={setSkewValue} min={-2} max={0.01} step={0.01} left='300px' />
                <div style={{ width: `${helixViewWidthPx}px`, height: '80vh' }}>
                    <Canvas orthographic camera={{ position: [0, 0, 10], zoom: orthoZoom }}>
                        <Suspense fallback={null}>
                            <group position={[0, 3, 0]} scale={[0.5, 1, 1]}>
                                <Helix scale={helixScale} skewValue={skewValue} planesPerCycle={planesPerCycle} indexHovered={indexHovered} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} totalPlanes={totalPlanes - 1} />
                            </group>
                            <Common zoom={orthoZoom} />
                            <OrbitControls />
                        </Suspense>
                    </Canvas>
                </div>
            </div>
            <ul style={{ lineHeight: `${lineHeightPx}px`, color: 'white', marginTop: '6rem', transform: `skewY(${skewYDeg}deg)`, fontSize: '20px', fontWeight: '900', marginLeft: `${listLeftPx}px`, position: 'absolute', left: 0, top: 0 }}>
                {['Blob', 'Helix', 'Torus', 'Tube', 'Sphere', 'Torus Knot'].map((name, index) => (
                    <li key={index}>
                        <span
                            className={`${selectedIndex === index ? 'underline underline-offset-4 text-white' : 'unselected text-gray-300'}`}
                            onClick={() => setSelectedIndex(index)}
                            onMouseEnter={() => setIndexHovered(index)}
                            onMouseLeave={() => setIndexHovered(-1)}>{name}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}