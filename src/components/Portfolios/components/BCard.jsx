import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react'
import { useSpring, animated, to } from '@react-spring/web'
import './BCard.css'

const ActiveCardContext = createContext(null)

const ActiveCardProvider = ({ children }) => {
  const [activeCard, setActiveCard] = useState(null)
  return (
    <ActiveCardContext.Provider value={{ activeCard, setActiveCard }}>
      {children}
    </ActiveCardContext.Provider>
  )
}

const useActiveCard = () => {
  const context = useContext(ActiveCardContext)
  if (!context) {
    throw new Error('useActiveCard must be used within an ActiveCardProvider')
  }
  return context
}

const useOrientation = () => {
  const [orientation, setOrientation] = useState({ relative: { gamma: 0, beta: 0 } })

  useEffect(() => {
    const handleOrientation = (event) => {
      setOrientation({
        relative: {
          gamma: event.gamma || 0,
          beta: event.beta || 0
        }
      })
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [])

  return orientation
}

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value))
const round = (value, precision = 2) => Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)
const adjust = (value, fromMin, fromMax, toMin, toMax) => {
  const fromRange = fromMax - fromMin
  const toRange = toMax - toMin
  const normalized = (value - fromMin) / fromRange
  return toMin + normalized * toRange
}

const Card = (props) => {
  const { 
    id, 
    name, 
    number, 
    set, 
    types, 
    subtypes, 
    supertype, 
    rarity, 
    img, 
    back = 'https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg', 
    foil, 
    mask, 
    showcase 
  } = props
  
  const { activeCard, setActiveCard } = useActiveCard()
  const o = useOrientation()
  const [loading, setLoading] = useState(true)
  const thisCard = useRef(null)
  const isActive = activeCard === thisCard.current
  const [interacting, setInteracting] = useState(false)
  const firstPop = useRef(true)
  const isTwirlAnimating = useRef(false)
  const hasSpunIn = useRef(false)
  const hasSpunOut = useRef(false)
  const TWIRL_IN_SPEED_MS = 500
  const TWIRL_OUT_SPEED_MS = TWIRL_IN_SPEED_MS

  const randomSeed = useMemo(() => ({ x: Math.random(), y: Math.random() }), [])
  const cosmosPosition = useMemo(() => ({ x: Math.floor(randomSeed.x * 734), y: Math.floor(randomSeed.y * 1280) }), [randomSeed])

  const numberLower = useMemo(() => String(number || '').toLowerCase(), [number])
  const setLower = useMemo(() => String(set || '').toLowerCase(), [set])
  const rarityLower = useMemo(() => String(rarity || '').toLowerCase(), [rarity])
  const supertypeLower = useMemo(() => String(supertype || '').toLowerCase(), [supertype])
  const typesLower = useMemo(() => {
    const t = Array.isArray(types) ? types.join(' ') : types
    return String(t || '').toLowerCase()
  }, [types])
  const subtypesLower = useMemo(() => {
    const s = Array.isArray(subtypes) ? subtypes.join(' ') : subtypes
    return String(s || '').toLowerCase()
  }, [subtypes])
  const isTrainerGallery = useMemo(() => {
    const n = numberLower
    return !!n.match(/^[tg]g/i) || id === 'swshp-SWSH076' || id === 'swshp-SWSH077'
  }, [numberLower, id])

  const [spr, api] = useSpring(() => ({
    rotX: 0,
    rotY: 0,
    rotDX: 0,
    rotDY: 0,
    glareX: 50,
    glareY: 50,
    glareO: 0,
    bgX: 50,
    bgY: 50,
    scale: 1,
    tX: 0,
    tY: 0,
    config: { tension: 66, friction: 25 },
  }))

  function interact(e) {
    if (isTwirlAnimating.current) return
    setInteracting(true)
    const target = e.currentTarget
    const rect = target.getBoundingClientRect()
    const srcX = e.clientX ?? e.touches?.[0]?.clientX
    const srcY = e.clientY ?? e.touches?.[0]?.clientY
    const absX = srcX - rect.left
    const absY = srcY - rect.top
    const percentX = clamp(round((100 / rect.width) * absX))
    const percentY = clamp(round((100 / rect.height) * absY))
    const centerX = percentX - 50
    const centerY = percentY - 50
    api.start({
      bgX: adjust(percentX, 0, 100, 37, 63),
      bgY: adjust(percentY, 0, 100, 33, 67),
      rotX: round(-(centerX / 3.5)),
      rotY: round(centerY / 2),
      glareX: percentX,
      glareY: percentY,
      glareO: 1,
    })
  }

  function interactEnd() {
    if (isTwirlAnimating.current) return
    if (isActive) return
    setInteracting(false)
    api.start({ rotX: 0, rotY: 0, glareX: 50, glareY: 50, glareO: 0, bgX: 50, bgY: 50 })
  }

  function requestDeactivate() {
    if (isTwirlAnimating.current) return
    if (hasSpunIn.current && !hasSpunOut.current) {
      isTwirlAnimating.current = true
      api.start({
        rotDX: 0,
        rotDY: 0,
        rotX: 0,
        rotY: 0,
        glareX: 50,
        glareY: 50,
        glareO: 0,
        bgX: 50,
        bgY: 50,
        scale: 1,
        tX: 0,
        tY: 0,
        config: { duration: TWIRL_OUT_SPEED_MS },
        onRest: () => {
          isTwirlAnimating.current = false
          hasSpunOut.current = true
          setActiveCard(undefined)
          setInteracting(false)
        },
      })
      return
    }
    setActiveCard(undefined)
    setInteracting(false)
    api.start({
      rotX: 0,
      rotY: 0,
      glareX: 50,
      glareY: 50,
      glareO: 0,
      bgX: 50,
      bgY: 50,
      rotDX: 0,
      rotDY: 0,
      scale: 1,
      tX: 0,
      tY: 0,
      config: { tension: 90, friction: 18 },
    })
  }

  function activate() {
    if (isTwirlAnimating.current) return
    if (!isActive) {
      setActiveCard(thisCard.current)
      if (o && typeof o.resetBase === 'function') o.resetBase()
      hasSpunOut.current = false
    } else {
      requestDeactivate()
    }
  }

  useEffect(() => {
    if (isActive) {
      const rect = thisCard.current.getBoundingClientRect()
      const scaleW = (window.innerWidth / rect.width) * 0.9
      const scaleH = (window.innerHeight / rect.height) * 0.9
      const scaleF = 1.75
      const tX = round(document.documentElement.clientWidth / 2 - rect.x - rect.width / 2)
      const tY = round(document.documentElement.clientHeight / 2 - rect.y - rect.height / 2)
      api.start({ scale: Math.min(scaleW, scaleH, scaleF), tX, tY, config: { tension: 90, friction: 18 } })
      const x = o.relative.gamma
      const y = o.relative.beta
      const limit = { x: 16, y: 18 }
      const dx = clamp(x, -limit.x, limit.x)
      const dy = clamp(y, -limit.y, limit.y)
      api.start({
        bgX: adjust(dx, -limit.x, limit.x, 37, 63),
        bgY: adjust(dy, -limit.y, limit.y, 33, 67),
        rotX: round(dx * -1),
        rotY: round(dy),
        glareX: adjust(dx, -limit.x, limit.x, 0, 100),
        glareY: adjust(dy, -limit.y, limit.y, 0, 100),
        glareO: 1,
      })
      if (firstPop.current) {
        firstPop.current = false
        isTwirlAnimating.current = true
        setInteracting(true)
        const durationMs = TWIRL_IN_SPEED_MS
        api.start({ rotDX: 360, rotDY: 0, config: { duration: durationMs } })
        setTimeout(() => {
          isTwirlAnimating.current = false
          hasSpunIn.current = true
        }, durationMs)
      }
    } else {
      api.start({ scale: 1, tX: 0, tY: 0, config: { tension: 90, friction: 18 } })
    }
  }, [isActive, o])

  useEffect(() => {
    if (!isActive) return
    function handleDocumentClick(e) {
      if (!thisCard.current) return
      if (!thisCard.current.contains(e.target)) requestDeactivate()
    }
    function handleVisibility() {
      if (document.visibilityState !== 'visible') requestDeactivate()
    }
    document.addEventListener('click', handleDocumentClick, true)
    document.addEventListener('visibilitychange', handleVisibility, true)
    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
      document.removeEventListener('visibilitychange', handleVisibility, true)
    }
  }, [isActive, setActiveCard])

  const styleVars = useMemo(() => ({
    '--pointer-x': spr.glareX.to((v) => `${v}%`),
    '--pointer-y': spr.glareY.to((v) => `${v}%`),
    '--pointer-from-center': to([spr.glareX, spr.glareY], (gx, gy) => clamp(Math.sqrt((gy - 50) * (gy - 50) + (gx - 50) * (gx - 50)) / 50, 0, 1)),
    '--pointer-from-top': spr.glareY.to((v) => v / 100),
    '--pointer-from-left': spr.glareX.to((v) => v / 100),
    '--card-opacity': spr.glareO,
    '--rotate-x': to([spr.rotX, spr.rotDX], (a, d) => `${a + d}deg`),
    '--rotate-y': to([spr.rotY, spr.rotDY], (a, d) => `${a + d}deg`),
    '--background-x': spr.bgX.to((v) => `${v}%`),
    '--background-y': spr.bgY.to((v) => `${v}%`),
    '--card-scale': spr.scale,
    '--translate-x': spr.tX.to((v) => `${v}px`),
    '--translate-y': spr.tY.to((v) => `${v}px`),
  }), [spr])

  const staticVars = useMemo(() => ({
    '--seedx': randomSeed.x,
    '--seedy': randomSeed.y,
    '--cosmosbg': `${cosmosPosition.x}px ${cosmosPosition.y}px`,
  }), [randomSeed, cosmosPosition])

  const foilVars = useMemo(() => ({
    ...(mask ? { '--mask': `url(${mask})` } : {}),
    ...(foil ? { '--foil': `url(${foil})` } : {}),
  }), [mask, foil])

  return (
    <animated.div
      className={`card ${typesLower} interactive ${isActive ? 'active' : ''} ${interacting ? 'interacting' : ''} ${loading ? 'loading' : ''} ${mask ? 'masked' : ''}`}
      data-number={numberLower}
      data-set={setLower}
      data-subtypes={subtypesLower}
      data-supertype={supertypeLower}
      data-rarity={rarityLower}
      data-trainer-gallery={String(isTrainerGallery)}
      ref={thisCard}
      style={styleVars}
    >
      <div className="card__translater">
        <button
          className="card__rotator"
          onClick={activate}
          onPointerMove={interact}
          onMouseOut={interactEnd}
          aria-label={`Expand the Pokemon Card; ${name}.`}
          tabIndex={0}
        >
          <img
            className="card__back"
            src={back}
            alt="The back of a Pokemon Card, a Pokeball in the center with Pokemon logo above and below"
            loading="lazy"
            width="660"
            height="921"
          />
          <animated.div className="card__front" style={{ ...staticVars, ...foilVars }}>
            <img
              src={img}
              alt={`Front design of the ${name} Pokemon Card, with the stats and info around the edge`}
              onLoad={() => setLoading(false)}
              loading="lazy"
              width="660"
              height="921"
            />
            <div className="card__shine"></div>
            <div className="card__glare"></div>
          </animated.div>
        </button>
      </div>
    </animated.div>
  )
}

const PokemonCardDisplay = ({ 
  cardData = {
    id: 'sv107',
    name: 'Charizard VMAX',
    number: 'SV107',
    set: 'swsh45sv',
    types: ['fire'],
    subtypes: ['VMAX'],
    supertype: 'pokemon',
    rarity: 'Rare Shiny VMAX',
    img: '/img/card/abf-card.png',
    foil: '/img/card/abf-foil.webp',
    mask: '/img/card/abf-mask.webp',
    back: '/img/card/abf-back.jpg'
  },
  className = ''
}) => {
  return (
    <ActiveCardProvider>
      <div className={`card-grid card-custom-grid ${className}`}>
        <div className="card card-hidden"></div>
        <Card {...cardData} />
        <div className="card card-hidden"></div>
      </div>
    </ActiveCardProvider>
  )
}

export { PokemonCardDisplay, Card, ActiveCardProvider, useActiveCard }
export default PokemonCardDisplay
