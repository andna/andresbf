import { useState, useEffect, useRef, useCallback } from 'react'

export function useScrollProgress(sectionIds) {
  const [progress, setProgress] = useState(0)
  const [activeSectionId, setActiveSectionId] = useState(sectionIds[0] ?? null)
  const sectionRefs = useRef({})
  const observerRef = useRef(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.sectionId
            if (id) setActiveSectionId(id)
          }
        }
      },
      { threshold: 0.5, rootMargin: '0px' }
    )
    return () => observerRef.current?.disconnect()
  }, [])

  const getSectionRef = useCallback((id) => (el) => {
    if (sectionRefs.current[id]) {
      observerRef.current?.unobserve(sectionRefs.current[id])
    }
    sectionRefs.current[id] = el
    if (el) {
      observerRef.current?.observe(el)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id]
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return { progress, activeSectionId, getSectionRef, scrollToSection }
}
