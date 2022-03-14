﻿enum c {
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
            x: 100, y: 130,
            customTitleStyle: 'top: 3.5em; left: 6em;',
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
                        x: 43, y: 262,
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

                    postType: t.bentR,
                    colour: c.green,
                    x: 410, y: 0,
                    customStyle : 'top: -10em; left: 5em'
                }],
                [{
                    id: 'else',
                    text: '',
                    subtext: 'I live in Buenos Aires... VR... etc etc',

                    colour: c.yellow,
                    postType: t.bentL,
                    x: 750, y: 360,
                    customStyle : 'top: 11em; left: 3em',
                }]
            ]
        },
        {
            id: "skills",
            x: 1640, y: 100,
            postItGroups: [
                [{
                    id: 'frontend',
                    text: 'Frontend\nFrameworks',
                    bigIcons: [
                        {id:'angular', tooltip: 'Angular 2+'},
                        {id:'react', tooltip: 'ReactJS &\nReact Native'},
                        {id:'jquery', tooltip: 'jQuery'},
                        {id:'svelte', tooltip: 'Svelte'},],
                    postType: t.bentL,
                    colour: c.green,
                    x: 1397, y: 100,
                    overwriteScrollText: 'Frontend',
                }],
                [{
                    id: 'vrar',
                    text: 'VR/AR\nDevelopment',
                    bigIcons: [
                        {id:'unity', tooltip: 'Unity'},
                        {id:'blender', tooltip: 'Blender'},
                        {id:'unreal', tooltip: 'Unreal\nEngine'},],
                    postType: t.bentR,
                    colour: c.blue,
                    overwriteScrollText: 'VR/AR',
                    x: 1752, y: 100
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
                    x: 2113, y: 100
                }],
                [{
                    id: 'product',
                    text: 'Product\nManagement',
                    bigIcons: [
                        {id:'jira', tooltip: 'Jira'},
                        {id:'bitbucket', tooltip: 'Bitbucket\n<small>(and other VCS)</small>'},
                        {id:'confluence', tooltip: 'Confluence\n<small>(and other\ncollab tools)</small>'},],
                    postType: t.stickU,
                    colour: c.yellow,
                    x: 2475, y: 100,
                    overwriteScrollText: 'Product',
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
                    wideIcon : true,
                    postType: t.stickU,
                    colour: c.green,
                    size: s.medium,
                    overwriteScrollText: 'is power',
                    x: 109, y: 971,
                        customStyle : 'left: 5em;',
                    },
                    {
                    id: 'university',
                    text: 'System & Computer Engineering',
                    href: 'https://www.puce.edu.ec/ingenieria-en-sistemas-de-informacion/',
                    subtext: 'ago 2010 » dec 2016',
                    wideIcon : true,
                    postType: t.bentL,
                    colour: c.yellow,
                    size: s.medium,
                    notScrollable: true,
                        customStyle : 'top: -4em; padding-top: 2em;',
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
                        wideIcon : true,

                        postType: t.bentL,
                        colour: c.red,
                        size: s.small,
                        overwriteScrollText: 'past',
                        x:  710 , y:  967,

                        customStyle : 'left: -5em; top: 6em;',

                    },{
                        id: 'atiko7',
                        text: 'Branding\nWordpress Dev',
                        subtext: 'sep 2013 » mar 2014',
                    wideIcon : true,

                        postType: t.stickU,
                        colour: c.yellow,
                        size: s.small,
                        notScrollable: true,
                        customStyle : 'top: 3em; padding-top: 2.6em; left: -8em;',
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

                        postType: t.bentL,
                        colour: c.blue,
                        size: s.medium,
                        x:  864 , y:  1109,
                        customStyle : 'left: 5em;'
                    },
                    {
                        id: 'productmanager',
                        text: 'Product\nManager',
                        subtext: 'jun 2021 » today',

                        postType: t.bentR,
                        colour: c.green,
                        size: s.small,
                        notScrollable: true,
                        customStyle : 'left: 7.4em; top: -5em;  padding-top: 5em;'
                    },
                    {
                        id: 'uxuileader',
                        text: 'UX/UI\nLeader',
                        subtext: 'nov 2020 » jun 2021',

                        postType: t.stickD,
                        colour: c.red,
                        size: s.small,
                        notScrollable: true,
                        customStyle : 'top: -12em; padding-top: 5em; left: 2.4em;'
                    },
                    {
                        id: 'frontenddev',
                        text: 'Frontend\nDev',
                        subtext: 'jan 2016 » nov 2020',

                        postType: t.stickU,
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
                        overwriteScrollText: 'recent',
                        x:  1126 , y:  1110,
                        customStyle : 'left: 10em;'
                    },
                    {
                        id: 'quiena2',
                        text: '',
                        postType: t.polaroid,
                        notScrollable: true,
                        customStyle : 'left: 10em;'
                    }
                ],
            ]
        },
        {
            id: "portfolio",
            x: 2120, y: 1070,
            customTitleStyle: 'top: 3em; left: 0.4em;',
            postItGroups: [

                [
                    {
                        id: 'spaceO2',
                        text: 'Space O2 VR',
                        postType: t.polaroid,
                        x:  1870 , y:  962,
                        customStyle : ' top: 23em;'
                    },
                ],
                [

                    {
                        id: 'lavaSurf',
                        text: '',
                        postType: t.polaroid,
                        x:  2218 , y:  1001
                    },
                    {
                        id: 'vrDinning',
                        text: '',
                        postType: t.polaroid,
                        x:  2218 , y:  1270
                    },
                ],
                [

                    {
                        id: 'moderaIt',
                        text: '',
                        postType: t.polaroid,
                        x:  2577 , y:  1030
                    },
                    {
                        id: 'Smatchups',
                        text: '',
                        postType: t.polaroid,
                        x:  2577 , y:  1298
                    },
                ],
                [
                    {
                        id: 'reel',
                        text: '',
                        postType: t.polaroid,
                        x:  2946 , y:  1026
                    },

                    {
                        id: 'youtube',
                        icon: true,
                        text: 'youtube.com/user/andzofficial',
                        href: 'https://www.youtube.com/user/andzofficial/videos',

                        postType: t.bentR,
                        colour: c.red,
                        size: s.small,
                        overwriteScrollText: 'else...',
                        x:  2870 , y:  1453,
                        customStyle: 'left: 6em;'
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
                        customStyle: 'top: -3em;'
                    },
                    {
                        id: 'last',
                        text: '',

                        postType: t.bentL,
                        colour: c.blue,
                        size: s.small,
                        notScrollable: true,
                        customStyle: 'top: -6em; left: 6em;'
                    },
                ],
            ]
        }
    ];
