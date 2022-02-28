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
                        colour: c.blue,
                        postType: t.bentL,
                        size: s.small,
                    },
                    {
                        id: 'linkedin',
                        icon: 'mail',
                        text: 'linkedin.com/in/\nandbastidasfierro',
                        colour: c.blue,
                        postType: t.stickU,
                        size: s.small,
                    },
                    {
                        id: 'instagram',
                        icon: 'mail',
                        text: '@andbastf',
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
                    icon: 'mail',
                    postType: t.stickU,
                    colour: c.green,
                    size: s.medium,
                    },
                    {
                    id: 'university',
                    text: 'System & Computer Engineering',
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
                        icon: 'mail',
                        postType: t.bentL,
                        colour: c.red,
                        size: s.small,
                    },{
                    id: 'atiko7',
                    text: 'Branding\nWordpress Dev',
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
                        icon: 'mail',
                        postType: t.bentL,
                        colour: c.blue,
                        size: s.medium,
                    },
                    {
                        id: 'productmanager',
                        text: 'Product\nManager',
                        icon: 'mail',
                        postType: t.stickU,
                        colour: c.green,
                        size: s.small,
                    },
                    {
                        id: 'uxuileader',
                        text: 'UX/UI\nLeader',
                        icon: 'mail',
                        postType: t.bentR,
                        colour: c.red,
                        size: s.small,
                    },
                    {
                        id: 'frontenddev',
                        text: 'Frontend\nDev',
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
                        icon: 'mail',
                        postType: t.bentR,
                        colour: c.red,
                        size: s.small,
                    },

                    {
                        id: 'behance',
                        text: 'be.net/andna',
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
