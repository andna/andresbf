import { lazy, Suspense, useEffect, useState } from 'react'
import './navigator.css'
import { mobileHelixLabel } from '../../data/sections.js'

const Navigator = lazy(() => import('./Navigator.jsx'))

export default function NavigatorIsland({ sections }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <div className="navigator-placeholder">
        <ul>
          {sections.map((section) => (
            <li key={section.id}>{mobileHelixLabel(section)}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="navigator-placeholder">
          <ul>
            {sections.map((section) => (
              <li key={section.id}>{mobileHelixLabel(section)}</li>
            ))}
          </ul>
        </div>
      }
    >
      <Navigator sections={sections} />
    </Suspense>
  )
}
