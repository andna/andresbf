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
            postItGroups: [
                [
                    {
                        id: 'mail',
                        icon: 'mail',
                        text: 'andbastidasfierro@gmail.com',
                        href: 'mailto:andbastidasfierro@gmail.com',
                        colour: c.blue,
                        postType: t.bentL,
                        size: s.small,
                    },
                    {
                        id: 'linkedin',
                        icon: 'mail',
                        text: 'linkedin.com/in/\nandbastidasfierro',
                        href: 'https://www.linkedin.com/in/andbastidasfierro/',
                        colour: c.blue,
                        postType: t.stickU,
                        size: s.small,
                    },
                    {
                        id: 'instagram',
                        icon: 'mail',
                        text: '@andbastf',
                        href: 'https://www.instagram.com/andbastf/',
                        colour: c.blue,
                        postType: t.bentR,
                        size: s.small,
                    }
                ],
                [{
                    id: 'me',
                    text: 'Andrés\nBastidas Fierro',
                    subtext: 'Software Engineer\n' +
                        'Algorithmic Designer\n' +
                        'XR Evangelist',
                    icon: 'mail',
                    postType: t.bentR,
                    colour: c.green,
                }],
                [{
                    id: 'more',
                    text: '',
                    icon: 'mail',
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
                    text: 'Frontend\nFrameworks',
                    icon: 'mail',
                    postType: t.bentL,
                    colour: c.green,
                }],
                [{
                    id: 'vrar',
                    text: 'VR/AR\nDevelopment',
                    icon: 'mail',
                    postType: t.bentR,
                    colour: c.blue,
                }],
                [{
                    id: 'uxui',
                    text: 'UX/UI\nDesign',
                    icon: 'mail',
                    postType: t.stickD,
                    colour: c.red,
                }],
                [{
                    id: 'product',
                    text: 'Product\nManagement',
                    icon: 'mail',
                    postType: t.stickU,
                    colour: c.yellow,
                }]
            ]
        },
        {
            id: "education",
            postItGroups: [
                [
                    {
                    id: 'master',
                    text: 'Master in Interactive\nDesign',
                    href: 'http://maedi.com.ar/',
                    subtext: 'mar 2020 » on thesis',
                    icon: 'mail',
                    postType: t.stickU,
                    colour: c.green,
                    size: s.medium,
                    },
                    {
                    id: 'university',
                    text: 'System & Computer Engineering',
                    href: 'https://www.puce.edu.ec/ingenieria-en-sistemas-de-informacion/',
                    subtext: 'ago 2010 » dec 2016',
                    icon: 'mail',
                    postType: t.bentL,
                    colour: c.yellow,
                    size: s.medium,
                    }
                ],

            ]
        },
        {
            id: "experience",
            postItGroups: [
                [

                    {
                        id: 'halliburton',
                        text: 'Content Manager',
                        subtext: 'jun 2014 » jan 2015',
                        icon: 'mail',
                        postType: t.bentL,
                        colour: c.red,
                        size: s.small,
                    },{
                        id: 'atiko7',
                        text: 'Branding\nWordpress Dev',
                        subtext: 'sep 2013 » mar 2014',
                        icon: 'mail',
                        postType: t.stickU,
                        colour: c.yellow,
                        size: s.small,
                },
                ],
                [
                    {
                        id: 'quiena',
                        text: 'Qienna Wealth\nManagement Inc.',
                        href: 'https://www.quiena.com/',
                        subtext: 'Co-founder',
                        icon: 'mail',
                        postType: t.bentL,
                        colour: c.blue,
                        size: s.medium,
                    },
                    {
                        id: 'productmanager',
                        text: 'Product\nManager',
                        subtext: 'jun 2021 » today',
                        icon: 'mail',
                        postType: t.stickU,
                        colour: c.green,
                        size: s.small,
                    },
                    {
                        id: 'uxuileader',
                        text: 'UX/UI\nLeader',
                        subtext: 'nov 2020 » jun 2021',
                        icon: 'mail',
                        postType: t.bentR,
                        colour: c.red,
                        size: s.small,
                    },
                    {
                        id: 'frontenddev',
                        text: 'Frontend\nDev',
                        subtext: 'jan 2016 » nov 2020',
                        icon: 'mail',
                        postType: t.stickD,
                        colour: c.green,
                        size: s.small,
                    },
                ],
                [
                    {
                        id: 'quiena1',
                        text: '',
                        postType: 4,
                    },
                    {
                        id: 'quiena2',
                        text: '',
                        postType: t.polaroid,
                    }
                ],
            ]
        },
        {
            id: "portfolio",
            postItGroups: [

                [
                    {
                        id: 'lavaSurf',
                        text: '',
                        postType: t.polaroid,
                    },
                ],
                [

                    {
                        id: 'vrDinning',
                        text: '',
                        postType: t.polaroid,
                    },
                    {
                        id: 'Space O2 VR',
                        text: '',
                        postType: t.polaroid,
                    },
                ],
                [

                    {
                        id: 'moderaGame',
                        text: '',
                        postType: t.polaroid,
                    },
                    {
                        id: 'Smatchups',
                        text: '',
                        postType: t.polaroid,
                    },
                ],
                [
                    {
                        id: 'andmore',
                        text: '',
                        postType: t.polaroid,
                    },

                    {
                        id: 'youtube',
                        text: 'youtube.com/user/andzofficial',
                        href: 'https://www.youtube.com/user/andzofficial/videos',
                        icon: 'mail',
                        postType: t.bentR,
                        colour: c.red,
                        size: s.small,
                    },

                    {
                        id: 'behance',
                        text: 'be.net/andbastf',
                        href: 'https://www.behance.net/andbastf',
                        icon: 'mail',
                        postType: t.stickD,
                        colour: c.green,
                        size: s.small,
                    },
                    {
                        id: 'last',
                        text: '',
                        icon: 'mail',
                        postType: t.bentL,
                        colour: c.blue,
                        size: s.small,
                    },
                ],
            ]
        }
    ];
