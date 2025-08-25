import { Suspense, useEffect, useMemo, useRef, useState, useCallback, memo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {Edges, OrbitControls, OrthographicCamera, Stars, Sparkles, Sky, Html} from '@react-three/drei'

const lineWidth = 2

const colors = {
    selected: '#ffffff',
    hovered: '#555555',
    default: '#1e1d1e',
    line: '#fff'
}

const SkewedPlane = memo(function SkewedPlane({ skewedPlaneGeometry, planeRotation = 0, isSelected = false, isExternallyHovered = false, onClick, ...props }) {
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
})

const Helix = memo(function Helix({ skewValue = -0.1, planesPerCycle = 4, indexHovered = -1, selectedIndex = 0, setSelectedIndex, totalPlanes, ...props }) {
    const mesh = useRef(null)

    const baseRotation = (Math.PI * 2) / planesPerCycle


    const planeWidth = 1
    const radius = planeWidth / (2 * Math.tan(Math.PI / planesPerCycle))

    const { skewedPlaneGeometry } = useMemo(() => {
        const geometry = new THREE.PlaneGeometry(1, 0.5)
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
})

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


function RotatingOrthoCamera({
                                 zoom,
                                 selectedIndex,
                                 planesPerCycle,
                                 radius = 10,
                                 height = 0,
                                 targetRef,
                                 offsetPx = [0, 0],
                             }) {
    const camRef = useRef()
    const controlsRef = useRef()
    const baseRotation = (Math.PI * 2) / planesPerCycle
    const currentIndexRef = useRef(0)
    const targetAngleRef = useRef(0)
    const { size } = useThree()
    const tmpTarget = new THREE.Vector3()
    const [userRotating, setUserRotating] = useState(false)

    // Compute the shortest-path delta when the index changes.
    useEffect(() => {
        if (userRotating) return
        const current = ((currentIndexRef.current % planesPerCycle) + planesPerCycle) % planesPerCycle
        const target = ((selectedIndex % planesPerCycle) + planesPerCycle) % planesPerCycle
        let delta = target - current
        const half = planesPerCycle / 2
        if (delta > half) delta -= planesPerCycle
        if (delta < -half) delta += planesPerCycle
        currentIndexRef.current += delta
        targetAngleRef.current = currentIndexRef.current * baseRotation
    }, [selectedIndex, baseRotation, planesPerCycle, userRotating])

    // Keep controls.target on the helix pivot (no y-jumps).
    useFrame(() => {
        const pivot = targetRef?.current
        const controls = controlsRef.current
        if (pivot && controls) {
            pivot.getWorldPosition(tmpTarget)
            controls.target.copy(tmpTarget)
            controls.update()
        }
    })

    // Drive auto-rotation only when not user-rotating.
    useFrame(() => {
        const cam = camRef.current
        const pivot = targetRef?.current
        if (!cam || !pivot) return

        pivot.getWorldPosition(tmpTarget)

        if (!userRotating) {
            cam.userData.angle ??= targetAngleRef.current
            cam.userData.angle += (targetAngleRef.current - cam.userData.angle) * 0.06
            const a = cam.userData.angle

            const basePos = tmpTarget.clone().add(
                new THREE.Vector3(Math.sin(a) * radius, height, Math.cos(a) * radius)
            )
            cam.position.copy(basePos)
            cam.lookAt(tmpTarget)
        }
        // No camera edits while userRotating—OrbitControls owns it.

        // Screen-space pan
        const [ox, oy] = offsetPx
        if ((ox | oy) !== 0) {
            cam.setViewOffset(size.width, size.height, -ox, -oy, size.width, size.height)
        } else {
            cam.clearViewOffset()
        }
        cam.updateProjectionMatrix()
    })

    const handleControlStart = () => setUserRotating(true)

    const handleControlEnd = () => {
        setUserRotating(false)
        const cam = camRef.current
        const pivot = targetRef?.current
        if (!cam || !pivot) return
        pivot.getWorldPosition(tmpTarget)

        // Align internal azimuth with current camera heading
        const dx = cam.position.x - tmpTarget.x
        const dz = cam.position.z - tmpTarget.z
        const azimuth = Math.atan2(dx, dz)
        cam.userData.angle = azimuth
        targetAngleRef.current = azimuth
        currentIndexRef.current = azimuth / baseRotation
    }

    return (
        <>
            <OrthographicCamera ref={camRef} makeDefault zoom={zoom} />
            <OrbitControls
                ref={controlsRef}
                makeDefault           // <<< important: integrate with R3F events so clicks on meshes still work
                enablePan={false}     // you already have screen-space pan via viewOffset
                enableZoom={false}     // or false to lock zoom to the `zoom` prop
                enableDamping
                dampingFactor={0.1}
                rotateSpeed={0.9}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
                onStart={handleControlStart}
                onEnd={handleControlEnd}
            />
        </>
    )
}



const sections = ['Intro', 'About', 'Portfolio', 'Contact', 'Blog', 'Resume']

export default function Navigator() {
    const [skewValue, setSkewValue] = useState(-0.65)
    const [planesPerCycle, setPlanesPerCycle] = useState(3)
    const [indexHovered, setIndexHovered] = useState(-1)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const helixScale = 0.6
    const orthoZoom = 200
    const totalPlanes = sections.length

    const debounceRef = useRef(null)
    const lastScrollStateRef = useRef(null)
    const lastScrollProgressRef = useRef(0)

    const initialState = { scale: 1, offsetPx: [0, -400] }
    const finalState = { scale: 0.7, offsetPx: [-700, 0] }
    
    const [scale, setScale] = useState(initialState.scale)
    const [offsetPx, setOffsetPx] = useState(initialState.offsetPx)
    const [targetScale, setTargetScale] = useState(initialState.scale)
    const [targetOffsetPx, setTargetOffsetPx] = useState(initialState.offsetPx)

    const scrollCheckInterval = 1

    const targetScaleRef = useRef(initialState.scale)
    const targetOffsetPxRef = useRef(initialState.offsetPx)
    
    useEffect(() => {
        targetScaleRef.current = targetScale
        targetOffsetPxRef.current = targetOffsetPx
    }, [targetScale, targetOffsetPx])

    useEffect(() => {
        let animationFrame
        
        const lerp = (start, end, factor) => start + (end - start) * factor
        
        const lerpToTarget = () => {
            setScale(prevScale => {
                const newScale = lerp(prevScale, targetScaleRef.current, 0.15)
                return newScale
            })
            setOffsetPx(prevOffset => {
                const newOffset = [
                    lerp(prevOffset[0], targetOffsetPxRef.current[0], 0.15),
                    lerp(prevOffset[1], targetOffsetPxRef.current[1], 0.15)
                ]
                return newOffset
            })
            
            animationFrame = requestAnimationFrame(lerpToTarget)
        }
        
        animationFrame = requestAnimationFrame(lerpToTarget)
        
        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame)
            }
        }
    }, [])

    const handleScroll = useCallback(() => {
        const scrollY = window.scrollY
        const halfScreenHeight = window.innerHeight * 0.5
        const isPastHalf = scrollY > halfScreenHeight
        
        const progress = Math.min(scrollY / halfScreenHeight, 1)
        
        const newTargetScale = initialState.scale + (finalState.scale - initialState.scale) * progress
        const newTargetOffsetPx = [
            initialState.offsetPx[0] + (finalState.offsetPx[0] - initialState.offsetPx[0]) * progress,
            initialState.offsetPx[1] + (finalState.offsetPx[1] - initialState.offsetPx[1]) * progress
        ]
        
        setTargetScale(newTargetScale)
        setTargetOffsetPx(newTargetOffsetPx)
        
        if (lastScrollStateRef.current !== isPastHalf) {
            lastScrollStateRef.current = isPastHalf
        }
    }, [initialState, finalState])



    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
        
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [handleScroll])

    const calculatedValues = useMemo(() => {
        const skewAngle = Math.atan(Math.abs(skewValue))
        const RAD2DEG = 180 / Math.PI
        const skewYDeg = skewAngle * RAD2DEG * 0.88
        const stepWorld = Math.sin(skewAngle) + Math.pow(Math.abs(skewValue), 2.5) * 0.1
        const planeWidthWorld = 1
        const radiusWorld = planeWidthWorld / (2 * Math.tan(Math.PI / planesPerCycle))
        const gapPx = 20
        const unitToPx = orthoZoom * helixScale
        const lineHeightPx = unitToPx * stepWorld * 1.125
        const helixViewWidthPx = 4 * unitToPx * radiusWorld
        const listLeftPx = helixViewWidthPx + gapPx

        return {
            skewAngle,
            skewYDeg,
            stepWorld,
            radiusWorld,
            unitToPx,
            lineHeightPx,
            helixViewWidthPx,
            listLeftPx
        }
    }, [skewValue, planesPerCycle, helixScale, orthoZoom])
    
    const handleIndexHover = useCallback((index) => setIndexHovered(index), [])
    const handleIndexLeave = useCallback(() => setIndexHovered(-1), [])

    const navigatorListStyle = useMemo(() => ({
        lineHeight: `${calculatedValues.lineHeightPx}px`,
        transform: `skewY(${calculatedValues.skewYDeg}deg) scale(${scale}) translate(7%, -7%)`
    }), [calculatedValues.lineHeightPx, calculatedValues.skewYDeg, scale])

    const navigatorContainerStyle = useMemo(() => ({
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start'
    }), [])

    const helixPivot = useRef()
    return (
        <div className="navigator" style={navigatorContainerStyle}>
            <div style={{ position: 'relative' }}>

                {/*
                <Slider title="Planes per cycle" value={planesPerCycle} onChange={setPlanesPerCycle} min={3} max={8} step={1} left='0px' />
                <Slider title="Skew" value={skewValue} onChange={setSkewValue} min={-2} max={0.01} step={0.01} left='300px' />

*/}
                
                <div className="canvas">
                    <Canvas>

                             <Stars radius={1} depth={20} rayleigh={2} count={3000} factor={1} saturation={3} fade speed={0} color={"blue"} />

                        {/*
                        <Sky distance={40000} sunPosition={[1, 0.2, 0]} inclination={1} azimuth={0} minDirectionalG={0.3}/>



                           */}




                        <Suspense fallback={null}>

                            <group ref={helixPivot} position={[0, 0, 0]} scale={scale}>
                                <Helix
                                    scale={helixScale}
                                    skewValue={skewValue}
                                    planesPerCycle={planesPerCycle}
                                    indexHovered={indexHovered}
                                    selectedIndex={selectedIndex}
                                    setSelectedIndex={setSelectedIndex}
                                    totalPlanes={totalPlanes}
                                />
                                <Html>

                                    <ul className="navigator-list" style={navigatorListStyle}>
                                        {sections.map((name, index) => (
                                            <li key={index}>
                                                <span
                                                    className={`${selectedIndex === index ? 'selected' : ''}`}
                                                    onClick={() => setSelectedIndex(index)}
                                                    onMouseEnter={() => handleIndexHover(index)}
                                                    onMouseLeave={handleIndexLeave}>{name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    
                                </Html>
                            </group>


                            <RotatingOrthoCamera
                                zoom={orthoZoom}
                                selectedIndex={selectedIndex}
                                planesPerCycle={planesPerCycle}
                                radius={10}
                                height={0}
                                targetRef={helixPivot}
                                offsetPx={offsetPx}  // right side: 450, -450
                            />


                        </Suspense>
                    </Canvas>
                </div>

            </div>
        </div>
    )
}
