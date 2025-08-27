import { createContext, useContext, useEffect, useRef, useState } from 'react'

const breakpoints = {
  mobile: 58 * 16, // 928px
  mid: 64 * 16,    // 1024px
  large: 100 * 16, // 1600px
  mobileHeight: 800,
}

const getBreakpoint = (width, height) => {
  if (height < breakpoints.mobileHeight) return 'mobile'
  if (width < breakpoints.mid) return 'mobile'
  if (width < breakpoints.large) return 'mid'
  return 'large'
}

const BreakpointContext = createContext({
  breakpoint: 'large',
  prevBreakpoint: 'large',
})

export const BreakpointProvider = ({ children }) => {
  const [breakpoint, setBreakpoint] = useState(() => getBreakpoint(window.innerWidth, window.innerHeight))
  const prevBreakpoint = useRef(breakpoint)

  useEffect(() => {
    const handleResize = () => {
      const next = getBreakpoint(window.innerWidth, window.innerHeight)
      if (next !== breakpoint) {
        prevBreakpoint.current = breakpoint
        setBreakpoint(next)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return (
    <BreakpointContext.Provider value={{ breakpoint, prevBreakpoint: prevBreakpoint.current }}>
      {children}
    </BreakpointContext.Provider>
  )
}

export const useBreakpoint = (onChange) => {
  const { breakpoint, prevBreakpoint } = useContext(BreakpointContext)
  const cbRef = useRef(onChange)
  cbRef.current = onChange

  useEffect(() => {
    if (onChange && prevBreakpoint !== breakpoint) {
      cbRef.current(breakpoint, prevBreakpoint)
    }
  }, [breakpoint, prevBreakpoint, onChange])

  return breakpoint
}
