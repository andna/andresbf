import { Html } from '@react-three/drei'

export default function NavigatorNav({
  sections,
  selectedIndex,
  setSelectedIndex,
  setHoveredPlaneIdx,
  navigatorListStyle,
}) {
  return (
    <Html>
      <ul className="navigator-list" style={navigatorListStyle}>
        {sections.map((name, index) => (
          <li key={index}>
            <span
              className={`${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => setSelectedIndex(index)}
              onMouseEnter={() => setHoveredPlaneIdx(index)}
              onMouseLeave={() => setHoveredPlaneIdx(-1)}
            >
              {name}
            </span>
          </li>
        ))}
      </ul>
    </Html>
  )
}
