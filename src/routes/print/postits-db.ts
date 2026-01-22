enum c {
    red,
    green,
    blue,
    yellow,
    black
}
enum t {
    bentR,
    bentL,
    stickU,
    stickD,
    polaroid
}

enum s {
    big,
    medium,
    small,
}

export let postItsDB = [
    {
        id: "about",
        postItGroups: [
            [
                {
                    id: 'mail',
                    icon: true,
                    text: 'andbastidasfierro@gmail.com',
                    href: 'mailto:andbastidasfierro@gmail.com',
                    colour: c.blue,
                    postType: t.bentL,
                    size: s.small,
                    overwriteScrollText: 'contact',
                    hasExtraBox: true
                },
                {
                    id: 'linkedin',
                    icon: true,
                    text: 'linkedin.com/in/\nandbastidasfierro',
                    href: 'https://www.linkedin.com/in/andbastidasfierro/',
                    colour: c.blue,
                    postType: t.stickU,
                    size: s.small,
                    notScrollable: true,
                },
                {
                    id: 'instagram',
                    icon: true,
                    text: '@andbastf',
                    href: 'https://www.instagram.com/andbastf/',
                    colour: c.blue,
                    postType: t.bentR,
                    size: s.small,
                    notScrollable: true,
                }
            ],
            [{
                id: 'me',
                text: 'Andrés\nBastidas Fierro',
                subtext: 'Software Engineer\n' +
                    'Algorithmic Designer\n' +
                    'XR Evangelist',

                hasCustomHTML:true,
                postType: t.bentR,
                colour: c.green,
            }],
            [{
                id: 'more',
                text: '',
                hasCustomHTML:true,
                colour: c.yellow,
                postType: t.bentL,
            }]
        ]
    },
    {
        id: "skills",
        postItGroups: [
            [{
                id: 'frontend',
                text: 'Frontend\nDevelopment',
                bigIcons: [
                    {id:'react', tooltip: 'ReactJS &\nReact Native'},
                    {id:'threejs', tooltip: 'Three.js'},
                    {id:'svelte', tooltip: 'Svelte'},],
                postType: t.bentL,
                colour: c.green,
                overwriteScrollText: 'Frontend',
            }],
            [{
                id: 'vrar',
                text: 'VR/AR\nDevelopment',
                bigIcons: [
                    {id:'unity', tooltip: 'Unity'},
                    {id:'blender', tooltip: 'Blender'},
                    {id:'unreal', tooltip: 'Unreal\nEngine 4/5'},],
                postType: t.bentR,
                colour: c.blue,
                overwriteScrollText: 'VR/AR',
            }],
            [{
                id: 'uxui',
                text: 'UX/UI\nDesign',
                bigIcons:[
                    {id:'figma', tooltip: 'Figma'},
                    {id:'photoshop', tooltip: 'Photoshop'},
                    {id:'aftereffects', tooltip: 'After Effects'},],
                postType: t.stickD,
                colour: c.red,
                overwriteScrollText: 'UX/UI',
            }],
            [{
                id: 'product',
                text: 'Product\nManagement',
                bigIcons: [
                    {id:'jira', tooltip: 'Jira'},
                    {id:'bitbucket', tooltip: 'Bitbucket\n<small>(and other VCS)</small>'},
                    {id:'confluence', tooltip: 'Confluence\n<small>(and other\ncollab. tools)</small>'},],
                postType: t.stickU,
                colour: c.yellow,
                overwriteScrollText: 'Product',
            }]
        ]
    },
    {
        id: "education",
        joinWithNextGroup: true,
        overwriteId: { id: 'education_experience', text: 'education & experience'},
        postItGroups: [
            [
                {
                    id: 'master',
                    text: 'Master in Interactive\nDesign',
                    href: 'http://maedi.com.ar/',
                    subtext: 'Mar 2020 ➡ On thesis',
                    wideIcon : true,
                    postType: t.stickU,
                    colour: c.green,
                    size: s.medium,
                    overwriteScrollText: 'Tech & Art',
                    hasExtraBox: true
                },
                {
                    id: 'university',
                    text: 'System & Computer Engineering',
                    href: 'https://www.puce.edu.ec/ingenieria-en-sistemas-de-informacion/',
                    subtext: 'Ago 2010 ➡ Dec 2016',
                    wideIcon : true,
                    postType: t.bentL,
                    colour: c.yellow,
                    size: s.medium,
                    notScrollable: true,
                }
            ],

        ]
    },
    {
        id: "experience",
        postItGroups: [
            [
                {
                    id: 'quiena',
                    text: 'Qienna Wealth\nManagement Inc.',
                    href: 'https://www.quiena.com/',
                    subtext: 'Co-founder',
                    overwriteScrollText: 'Quiena',
                    wideIcon : true,

                    postType: t.bentL,
                    colour: c.blue,
                    size: s.medium,
                    hasExtraBox: true
                },
                {
                    id: 'productmanager',
                    text: 'Product\nManager',
                    subtext: 'Jun 2021 ➡ Apr 2022',

                    postType: t.stickU,
                    colour: c.green,
                    size: s.small,
                    notScrollable: true,
                },
                {
                    id: 'uxuileader',
                    text: 'UX/UI\nLeader',
                    subtext: 'Nov 2020 ➡ Jun 2021',

                    postType: t.stickD,
                    colour: c.red,
                    size: s.small,
                    notScrollable: true,
                },
                {
                    id: 'frontenddev',
                    text: 'Frontend\nDev',
                    subtext: 'Jan 2016 ➡ Nov 2020',

                    postType: t.stickU,
                    colour: c.green,
                    size: s.small,
                    notScrollable: true,
                },
            ],
            [
                {
                    id: 'quiena1',
                    text: '',
                    postType: 4,
                    overwriteScrollText: 'Quiena Cont.',
                    imgId: 'quiena1',
                    subtext: 'Fintech Solution',
                    tools: 'Angular, React, Native & +',
                    otherLinks: [
                        {label: 'Web', href: 'https://www.quiena.com'},
                        {label: 'App', href: 'https://www.quiena.com/#connect'},
                    ],
                    hasExtraBox: true
                },
                {
                    id: 'quiena2',
                    text: '',
                    postType: t.polaroid,
                    notScrollable: true,
                    imgId: 'quiena2'
                }
            ],
            [
                {
                    id: 'zemoga',
                    text: 'Senior FE Dev',
                    href: 'https://www.zemoga.com/',
                    subtext: 'May 2022 ➡ Today',
                    overwriteScrollText: 'Zemoga',
                    wideIcon : true,

                    postType: t.bentR,
                    colour: c.black,
                    size: s.big,
                    hasExtraBox: true
                },
            ],
        ]
    },
    {
        id: "portfolio",
        postItGroups: [

            [
                {
                    id: 'themoviecube',
                    subtext: '3D Web',
                    tools: 'React, Three.js, Jest, TS.',
                    overwriteScrollText: 'The Movie ◱',
                    videoUrl: 'ow2xQUg1NXg',
                    postType: t.polaroid,

                    otherLinks: [
                        {label: 'Live', href: 'https://themoviecube.vercel.app/'},
                        {label: 'Repo', href: 'https://github.com/andna/themoviecube'},
                    ]
                },
                {
                    id: 'pokitdex',
                    overwriteScrollText: 'Pok\'it Dex',
                    subtext: '2D Web',
                    tools: 'React, Redux, Next.js, MUI, Formik, TS.',
                    videoUrl: 'TC-ZUk__xWY',
                    postType: t.polaroid,
                    otherLinks: [
                        {label: 'Live', href: 'https://pokitdex.vercel.app/'},
                        {label: 'Repo', href: 'https://github.com/andna/pokitdex'},
                    ]
                },
            ],
            [
                {
                    id: 'space_o2',
                    overwriteScrollText: 'Space O²',
                    subtext: '6DoF VR Game',
                    tools: 'Unity, C#, Meta Quest 2.',
                    videoUrl: 'VKvfS5y1mG4',
                    postType: t.polaroid,
                    otherLinks: [
                        {label: 'APK', href: 'https://andbf.itch.io/space-o2'},
                    ]
                },
                {
                    id: 'lava_surf',
                    overwriteScrollText: 'Lava Surf VR',
                    subtext: '3DoF VR Game',
                    tools: 'Unity, Blender, Cardboard.',
                    postType: t.polaroid,
                    videoUrl: 'CocjtK3EBuA',
                    otherLinks: [
                        {label: 'APK', href: 'https://andbf.itch.io/lava-surf-vr'},
                    ]
                },
            ],
            [
                {
                    id: 'smatchups',
                    subtext: 'Web',
                    tools: 'JQuery, Sass, Fullstack PHP practice.',
                    postType: t.polaroid,
                    overwriteScrollText: 'Smatchups',
                    imgId: 'smatchups',
                    otherLinks: [
                        {label: 'Live', href: 'https://smatchups.vercel.app/'},
                        {label: 'Repo', href: 'https://github.com/andna/smatchups'},
                    ]
                },
                {
                    id: 'modera_game',
                    subtext: '2D Game',
                    tools: 'Unityscript, GameMaker.',
                    overwriteScrollText: 'ModeraGame',
                    videoUrl: 'bKNcZ4yMe40',
                    postType: t.polaroid,
                    otherLinks: [
                        {label: 'APK', href: 'https://andbf.itch.io/modera-game'},
                    ]
                },
            ],
            [
                {
                    id: 'this_web',
                    subtext: 'This Web',
                    tools: 'SvelteKit, Next.js, Figma.',
                    overwriteScrollText: 'This Web',
                    postType: t.polaroid,
                    otherLinks: [
                        {label: 'Repo', href: 'https://github.com/andna/andresbf'},
                        {label: 'Figma', href: 'https://www.figma.com/file/yAaTAFz5Mq7IEo7mgKz68U/Confluence-Variable?node-id=0%3A1'},
                        {label: 'Live', href: '#'},
                    ]
                },
                {
                    id: 'youtube',
                    icon: true,
                    text: 'youtube.com/user/andzofficial',
                    href: 'https://www.youtube.com/user/andzofficial/videos',
                    postType: t.bentR,
                    colour: c.red,
                    size: s.small,
                    overwriteScrollText: 'Else...',
                    hasExtraBox: true
                },
                {
                    id: 'behance',
                    icon: true,
                    text: 'be.net/andbastf',
                    href: 'https://www.behance.net/andbastf',
                    postType: t.stickD,
                    colour: c.green,
                    size: s.small,
                    notScrollable: true,
                },
            ],
        ]
    }
];
