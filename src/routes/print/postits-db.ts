enum c {
    red,
    green,
    blue,
    yellow
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
        x:  505 , y:  184 ,
        boxCollider: {x1: 0, y1: 0, x2: 1200, y2: 800},
        customTitleStyle: 'top: 3.9em; left: 5.8em;',
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
                    x:  106 , y:  245  ,
                    customStyle: 'left: 3em;',
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
                    customStyle: 'left: -3em; top: -2em;'
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
                    customStyle: 'left: 3em; top: -5em;'
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
                x: 471, y: 32,
                customStyle : 'top: -10em; left: 5.3em;     padding-top: 3.5em;'
            }],
            [{
                id: 'more',
                text: '',
                hasCustomHTML:true,
                colour: c.yellow,
                postType: t.bentL,
                x:  806 , y:  416 ,
                customStyle : 'top: 11em; left: 3em; color: #5F4013;',
            }]
        ]
    },
    {
        id: "skills",
        x:  2027 , y:  236 ,
        boxCollider: {x1: 1200, y1: 0, x2: 3058, y2: 542},
        postItGroups: [
            [{
                id: 'frontend',
                text: 'Frontend\nFrameworks',
                bigIcons: [
                    {id:'react', tooltip: 'ReactJS &\nReact Native'},
                    {id:'angular', tooltip: 'Angular 2+'},
                    {id:'jquery', tooltip: 'jQuery'},
                    {id:'svelte', tooltip: 'Svelte'},],
                postType: t.bentL,
                colour: c.green,
                x:  1442 , y:  103 ,
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
                x:  1836 , y:  140 ,
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
                x:  2230 , y:  140 ,
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
                x: 2619 , y: 140 ,
                overwriteScrollText: 'Product',
            }]
        ]
    },
    {
        id: "education",
        x:  778 , y:  1214 ,
        joinWithNextGroup: true,
        boxCollider: {x1: 0, y1: 800, x2: 1642, y2: 1642},
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
                    x:  160 , y:  1060 ,
                    customStyle : 'left: 5em;',
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
                    customStyle : 'top: -4em; padding-top: 1em;',
                }
            ],

        ]
    },
    {
        id: "experience",
        customTitleStyle: 'left: -2em',
        postItGroups: [
            [

                {
                    id: 'halliburton',
                    text: 'Content Manager',
                    subtext: 'Jun 2014 ➡ Jan 2015',
                    wideIcon : true,

                    postType: t.bentL,
                    colour: c.red,
                    size: s.small,
                    overwriteScrollText: 'Past',
                    x:  621 , y:  1036 ,

                    customStyle : 'left: -1em; top: 1em;',
                    hasExtraBox: true

                },{
                id: 'atiko7',
                text: 'Branding\nWordpress Dev',
                subtext: 'Sep 2013 ➡ Mar 2014',
                wideIcon : true,

                postType: t.stickU,
                colour: c.yellow,
                size: s.small,
                notScrollable: true,
                customStyle : 'top: -1em; left: -7em;',
            },
            ],
            [
                {
                    id: 'quiena',
                    text: 'Qienna Wealth\nManagement Inc.',
                    href: 'https://www.quiena.com/',
                    subtext: 'Co-founder',
                    overwriteScrollText: 'Quiena',
                    wideIcon : true,

                    postType: t.bentR,
                    colour: c.blue,
                    size: s.medium,
                    x:  933 , y:  1160 ,
                    customStyle : 'left: 5em;',
                    hasExtraBox: true
                },
                {
                    id: 'productmanager',
                    text: 'Product\nManager',
                    subtext: 'Jun 2021 ➡ Today',

                    postType: t.stickU,
                    colour: c.green,
                    size: s.small,
                    notScrollable: true,
                    customStyle : 'left: 7.4em; top: -5em;  padding-top: 5em;'
                },
                {
                    id: 'uxuileader',
                    text: 'UX/UI\nLeader',
                    subtext: 'Nov 2020 ➡ Jun 2021',

                    postType: t.stickD,
                    colour: c.red,
                    size: s.small,
                    notScrollable: true,
                    customStyle : 'top: -12em; padding-top: 5em; left: 2.4em;'
                },
                {
                    id: 'frontenddev',
                    text: 'Frontend\nDev',
                    subtext: 'Jan 2016 ➡ Nov 2020',

                    postType: t.bentL,
                    colour: c.green,
                    size: s.small,
                    notScrollable: true,
                    customStyle : 'top: -17em; left: -1em; padding-top: 4em;'
                },
            ],
            [
                {
                    id: 'quiena1',
                    text: '',
                    postType: 4,
                    overwriteScrollText: 'Quiena Cont.',
                    x:  1365 , y:  1160 ,
                    customStyle : 'left: 10em;',
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
                    customStyle : 'left: 10em;',
                    imgId: 'quiena2'
                }
            ],
        ]
    },
    {
        id: "portfolio",
        x:  2457 , y:  960 ,
        boxCollider: {x1: 1642, y1: 542, x2: 3058, y2: 1642},
        customTitleStyle: 'top: -1.6em; left: 0.4em;',
        postItGroups: [

            [
                {
                    id: 'themoviecube',
                    subtext: '3D Web',
                    tools: 'React, Three.js, Jest, TS.',
                    overwriteScrollText: 'The Movie ◱',
                    x:  1886 , y:  742 ,
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
                    x:  1886 , y:  1120  ,
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
                    x:  2250  , y:  792 ,
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
                    x:  2250  , y:  1132 ,
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
                    x:  2610  , y:  792 ,
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
                    x:  2610   , y:  1132,
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
                    x:  2970   , y:  792,
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
                    x:  2970 , y:  1132  ,
                    customStyle: 'top: 1em; left: 1em',
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
                    customStyle: 'top: -2em; left: 8em;'
                },
            ],
        ]
    }
];
