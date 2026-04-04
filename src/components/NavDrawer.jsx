function NavDrawer({ sectionIds, activeSectionId, progress, onSectionClick }) {
  return (
    <nav className="nav-drawer">
      <div className="nav-drawer-progress-track">
        <div
          className="nav-drawer-progress-fill"
          style={{ height: `${progress * 100}%` }}
        />
      </div>
      <div className="nav-drawer-links">
        {sectionIds.map((id) => (
          <button
            key={id}
            type="button"
            className={`nav-drawer-link ${activeSectionId === id ? 'active' : ''}`}
            onClick={() => onSectionClick(id)}
            aria-label={`Go to ${id} section`}
          />
        ))}
      </div>
    </nav>
  )
}

export default NavDrawer
