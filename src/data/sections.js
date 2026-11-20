export const mobileHelixLabel = (section) => section.title

export const mobileLogoLabel = (section) => {
  if (!section || section.title === 'init' || section.title === 'Contact') return ''
  if (section.kicker === 'Portfolio') return 'Portfolio'
  if (section.title === 'Experience') return 'Exp.'
  if (section.title === 'Certificates') return 'Certs.'
  return section.title
}

export const sections = [
  { id: 'header', label: '', title: 'init', blank: true, icon: '/logo-a.svg' },
  { id: 'me', label: 'ME', title: 'Me', icon: '/icons/me.svg' },
  { id: 'skills', label: 'SKL', title: 'Skills', icon: '/icons/skills.svg' },
  { id: 'experience', label: 'EXP', title: 'Experience', icon: '/icons/experience.svg' },
  { id: 'portfolio-1', label: 'PRT', title: 'Web', kicker: 'Portfolio', icon: '/icons/web.svg' },
  { id: 'portfolio-2', label: 'PRT', title: 'XR', kicker: 'Portfolio', icon: '/icons/xr.svg' },
  { id: 'portfolio-3', label: 'PRT', title: 'Games', kicker: 'Portfolio', icon: '/icons/games.svg' },
  { id: 'portfolio-4', label: 'PRT', title: 'Vids', kicker: 'Portfolio', icon: '/icons/vids.svg' },
  { id: 'education', label: 'CRT', title: 'Certificates', icon: '/icons/certificates.svg' },
  { id: 'footer', label: '', title: 'Contact', blank: true, icon: '/icons/contact.svg', titleIcon: '/icons/contact.svg' },
]
