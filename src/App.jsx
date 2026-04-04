import postits from './data/postits.json'
import NavDrawer from './components/NavDrawer'
import Section from './components/Section'
import PostItItem from './components/PostItItem'
import { useScrollProgress } from './hooks/useScrollProgress'

function App() {
  const sectionIds = postits.map((s) => s.id)
  const { progress, activeSectionId, getSectionRef, scrollToSection } = useScrollProgress(sectionIds)

  return (
    <div className="app">
      <NavDrawer
        sectionIds={sectionIds}
        activeSectionId={activeSectionId}
        progress={progress}
        onSectionClick={scrollToSection}
      />
      <main className="app-main">
        {postits.map((section) => (
          <Section
            key={section.id}
            id={section.id}
            sectionRef={getSectionRef(section.id)}
            isVisible={activeSectionId === section.id}
            title={section.id}
          >
            <div className="postit-section-groups">
              {section.postItGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="postit-group">
                  {group.map((item) => (
                    <PostItItem key={item.id} item={item} />
                  ))}
                </div>
              ))}
            </div>
          </Section>
        ))}
      </main>
    </div>
  )
}

export default App
