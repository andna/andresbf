import postits from './data/postits.json'

function PostItItem({ item }) {
  const content = (
    <>
      {item.text ? <span className="postit-item-text">{item.text}</span> : null}
      {item.subtext ? <span className="postit-item-subtext">{item.subtext}</span> : null}
      {item.avatar ? <img className="postit-item-avatar" src={item.avatar} alt="" /> : null}
      {item.tools ? <span className="postit-item-tools">{item.tools}</span> : null}
      {item.bigIcons ? (
        <div className="postit-item-bigicons">
          {item.bigIcons.map((icon) => (
            <span key={icon.id} className="postit-item-bigicon" title={icon.tooltip}>{icon.id}</span>
          ))}
        </div>
      ) : null}
      {item.otherLinks ? (
        <div className="postit-item-otherlinks">
          {item.otherLinks.map((link) => (
            <a key={link.label} className="postit-item-otherlink" href={link.href}>{link.label}</a>
          ))}
        </div>
      ) : null}
      {item.videoUrl ? <span className="postit-item-videourl">{item.videoUrl}</span> : null}
      {item.imgId ? <span className="postit-item-imgid">{item.imgId}</span> : null}
    </>
  )
  if (item.href) {
    return (
      <a className="postit-item" href={item.href} data-id={item.id}>
        {content}
      </a>
    )
  }
  return (
    <div className="postit-item" data-id={item.id}>
      {content}
    </div>
  )
}

function App() {
  return (
    <div className="app">
      {postits.map((section) => (
        <section key={section.id} className="postit-section" data-section-id={section.id}>
          <h2 className="postit-section-title">{section.id}</h2>
          <div className="postit-section-groups">
            {section.postItGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="postit-group">
                {group.map((item) => (
                  <PostItItem key={item.id} item={item} />
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default App
