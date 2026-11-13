const slides = (name) => [1, 2, 3].map((index) => `/portfolio/${name}-${index}.svg`)

export const portfolioProjects = {
  'portfolio-1': [
    {
      title: 'Lorebites',
      line: 'A pipeline that writes skill documentation from a codebase.',
      images: slides('ai-docs'),
    },
    {
      title: 'MovieCube',
      line: 'Sorts incoming bugs into a DevOps fix queue.',
      images: slides('ai-triage'),
    },
    {
      title: 'Pokeit',
      line: 'Short product videos cut from screen recordings.',
      images: slides('ai-cuts'),
    },
  ],
  'portfolio-2': [
    {
      title: 'ZScroll',
      line: 'Spatial steps laid over a live workspace.',
      images: slides('xr-guide'),
    },
    {
      title: 'xWorlds',
      line: 'Walk a product at real scale before it is built.',
      images: slides('xr-showroom'),
    },
    {
      title: 'aiXstorias',
      line: 'Review a session inside the headset.',
      images: slides('xr-replay'),
    },
  ],
  'portfolio-3': [
    {
      title: 'Glitch Fixing',
      line: 'A scroll-driven navigator drawn in WebGL.',
      images: slides('d3-helix'),
    },
    {
      title: 'VibesStyle',
      line: 'Vector mountains built from a height field.',
      images: slides('d3-terrain'),
    },
    {
      title: 'Reach Infinity',
      line: 'An exploded product view in the browser.',
      images: slides('d3-parts'),
    },
    {
      title: 'Disorderli',
      line: '',
      images: slides('d3-helix'),
    },
    {
      title: 'Space02',
      line: '',
      images: slides('d3-terrain'),
    },
  ],
  'portfolio-4': [
    {
      title: 'Welta GenAI',
      line: 'Studies in line weight, grid and registration.',
      images: slides('art-marks'),
    },
    {
      title: 'LoreVideos',
      line: 'Tone built from a stipple instead of a fill.',
      images: slides('art-dither'),
    },
    {
      title: 'Youtube',
      line: 'Print-like frames for a set of stills.',
      images: slides('art-plates'),
    },
  ],
}
