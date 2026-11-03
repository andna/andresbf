const slides = (name) => [1, 2, 3].map((index) => `/portfolio/${name}-${index}.svg`)

export const portfolioProjects = {
  'portfolio-1': [
    {
      title: 'Skill docs',
      line: 'A pipeline that writes skill documentation from a codebase.',
      images: slides('ai-docs'),
    },
    {
      title: 'Ticket triage',
      line: 'Sorts incoming bugs into a DevOps fix queue.',
      images: slides('ai-triage'),
    },
    {
      title: 'GenAI cuts',
      line: 'Short product videos cut from screen recordings.',
      images: slides('ai-cuts'),
    },
  ],
  'portfolio-2': [
    {
      title: 'Field guide',
      line: 'Spatial steps laid over a live workspace.',
      images: slides('xr-guide'),
    },
    {
      title: 'Showroom',
      line: 'Walk a product at real scale before it is built.',
      images: slides('xr-showroom'),
    },
    {
      title: 'Replay',
      line: 'Review a session inside the headset.',
      images: slides('xr-replay'),
    },
  ],
  'portfolio-3': [
    {
      title: 'Helix',
      line: 'A scroll-driven navigator drawn in WebGL.',
      images: slides('d3-helix'),
    },
    {
      title: 'Terrain',
      line: 'Vector mountains built from a height field.',
      images: slides('d3-terrain'),
    },
    {
      title: 'Parts',
      line: 'An exploded product view in the browser.',
      images: slides('d3-parts'),
    },
  ],
  'portfolio-4': [
    {
      title: 'Marks',
      line: 'Studies in line weight, grid and registration.',
      images: slides('art-marks'),
    },
    {
      title: 'Dither',
      line: 'Tone built from a stipple instead of a fill.',
      images: slides('art-dither'),
    },
    {
      title: 'Plates',
      line: 'Print-like frames for a set of stills.',
      images: slides('art-plates'),
    },
  ],
}
