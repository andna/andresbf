export const mobileHelixLabel = (section) => section.title

export const mobileLogoLabel = (section) => {
  if (!section || section.title === 'init' || section.title === 'Contact') return ''
  if (section.title === 'Experience') return 'Exp.'
  if (section.title === 'Education') return 'Edu.'
  return section.title
}

export const sections = [
  { id: 'header', label: '', title: 'init', blank: true },
  { id: 'me', label: 'ME', title: 'Me' },
  { id: 'skills', label: 'SKL', title: 'Skills' },
  { id: 'experience', label: 'EXP', title: 'Experience' },
  { id: 'portfolio-1', label: 'PRT', title: 'AI', kicker: 'Portfolio' },
  { id: 'portfolio-2', label: 'PRT', title: 'XR', kicker: 'Portfolio' },
  { id: 'portfolio-3', label: 'PRT', title: '3D', kicker: 'Portfolio' },
  { id: 'portfolio-4', label: 'PRT', title: 'Art', kicker: 'Portfolio' },
  { id: 'education', label: 'EDU', title: 'Education' },
  { id: 'footer', label: '', title: 'Contact', blank: true },
]
