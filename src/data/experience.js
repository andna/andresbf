export const experienceJobs = [
  {
    name: '.monks',
    field: 'IT Services & Consulting',
    logo: '/logo-monks.svg',
    points: [
      {
        title: 'Working on:',
        items: ['Tech stack migrations.', 'React, redux, Next.js.', 'Architecture AI skill pipelines.'],
      },
      {
        title: 'With clients such as:',
        items: ['Walmart', 'GreatWolf Lodges', 'BB&B'],
      },
    ],
    entries: [
      { type: 'start', label: 'Present' },
      { type: 'role', lines: ['Full time'] },
      { type: 'gap', label: 'Oct 2023', datetime: '2023-10' },
      {
        type: 'role',
        lines: [
          { parts: [{ text: 'Senior', small: true }] },
          'Frontend Dev',
          { text: 'Contractor', plain: true },
        ],
        end: { label: 'May 2022', datetime: '2022-05' },
      },
    ],
  },
  {
    name: 'Wealth2B',
    field: 'Investing Products',
    points: [
      {
        title: 'Working on:',
        items: ['AI Ticket/BugFix DevOps pipeline', 'UX & Product Consultor', { text: 'GenAI Videos', href: '#' }],
      },
    ],
    entries: [
      { type: 'start', label: 'Present' },
      {
        type: 'role',
        lines: ['Welta.us', { text: 'Contractor', plain: true }],
        end: { label: 'Jan 2026', datetime: '2026-01' },
      },
    ],
  },
  {
    name: 'Quiena Inversiones',
    field: 'Wealth Management',
    logo: true,
    side: {
      name: 'Internships',
      entries: [
        { type: 'start', label: 'Jan 2015', datetime: '2015-01' },
        {
          type: 'role',
          lines: ['Halliburton', { text: 'Content', plain: true }, { text: 'Manager', plain: true }],
          logo: '/logo-a.svg',
        },
        { type: 'gap', label: 'Jun 2014', datetime: '2014-06' },
        {
          type: 'role',
          lines: ['Átiko7', { text: 'Wordpress', plain: true }, { text: '& Blender', plain: true }],
          logo: '/logo-a.svg',
          end: { label: 'Jan 2014', datetime: '2014-01' },
        },
      ],
    },
    entries: [
      { type: 'start', label: 'Apr 2022', datetime: '2022-04' },
      { type: 'role', lines: ['Lead Product', 'Manager'] },
      { type: 'gap', label: 'Jun 2021', datetime: '2021-06' },
      { type: 'role', lines: ['Head of UX'] },
      { type: 'gap', label: 'Nov 2020', datetime: '2020-11' },
      {
        type: 'role',
        lines: ['Co-founder,', 'Frontend Dev'],
        end: { label: 'Jan 2016', datetime: '2016-01' },
      },
    ],
  },
];
