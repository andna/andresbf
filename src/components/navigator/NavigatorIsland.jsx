import { lazy, Suspense, useEffect, useState } from 'react'
import './navigator.css'

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
          {sections.map((name) => (
            <li key={name}>{name}</li>
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
            {sections.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      }
    >
      <Navigator sections={sections} />
    </Suspense>
  )
}
