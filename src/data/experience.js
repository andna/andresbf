export const experienceJobs = [
  {
    name: '.monks',
    url: 'https://www.monks.com',
    field: 'IT Services & Consulting',
    logo: true,
    points: [
      {
        title: 'Working on:',
        items: [
          { text: 'Tech stack migrations', items: ['React, Next.js, Redux, GraphQL'] },
          { text: 'AI skill documentation pipelines', href: '#' },
        ],
      },
      {
        title: 'With clients such as:',
        items: ['Walmart', 'Great Wolf Lodge', 'Bed Bath & Beyond'],
      },
    ],
    entries: [
      { type: 'start', label: 'Present' },
      { type: 'role', lines: ['Full time'] },
      { type: 'gap', label: 'Oct 2023', datetime: '2023-10' },
      {
        type: 'role',
        lines: [
          'Senior',
          'Frontend Dev',
          { text: 'Contractor', plain: true },
        ],
        end: { label: 'May 2022', datetime: '2022-05' },
      },
    ],
  },
  {
    name: 'Wealth2B',
    url: 'https://wealth2b.com/',
    field: 'Investing APIs',
    logo: true,
    points: [
      {
        title: 'Working on:',
        items: ['DevOps bugfix AI pipeline', 'Product & UX consulting', { text: 'GenAI videos', href: '#' }],
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
    url: 'https://www.linkedin.com/company/quiena',
    field: 'Wealth Management',
    logo: true,
    side: {
      name: 'Internships',
      entries: [
        { type: 'start', label: 'Jan 2015', datetime: '2015-01' },
        {
          type: 'role',
          lines: [{ text: 'Halliburton', href: 'https://www.halliburton.com' }, { text: 'Content', plain: true }, { text: 'Manager', plain: true }],
          logo: '/logo-a.svg',
        },
        { type: 'gap', label: 'Jun 2014', datetime: '2014-06' },
        {
          type: 'role',
          lines: [{ text: 'Átiko7', href: 'https://www.atiko7.com/' }, { text: 'Wordpress', plain: true }, { text: '& Blender', plain: true }],
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
