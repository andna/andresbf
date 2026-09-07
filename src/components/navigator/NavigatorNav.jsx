export default function NavigatorNav({
  sections,
  selectedIndex,
  setSelectedIndex,
  setHoveredPlaneIdx,
  navigatorListStyle,
}) {
  return (
    <ul className="navigator-list" style={navigatorListStyle}>
      {sections.map((section, index) => (
        <li key={section.id}>
          <span
            className={`${selectedIndex === index ? 'selected' : ''}`}
            onClick={() => setSelectedIndex(index)}
            onMouseEnter={() => setHoveredPlaneIdx(index)}
            onMouseLeave={() => setHoveredPlaneIdx(-1)}
          >
            {section.label}
          </span>
        </li>
      ))}
    </ul>
  )
}
