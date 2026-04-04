function Section({ id, sectionRef, isVisible, title, children }) {
  const animationClass = isVisible ? 'section-enter-active section-enter-done' : 'section-enter'
  return (
    <section
      ref={sectionRef}
      data-section-id={id}
      className={`section ${animationClass}`}
    >
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  )
}

export default Section
