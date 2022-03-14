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
            x:  177 , y:  130,
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
                        x:  50 , y:  246 ,
                        customStyle: 'left: 3em;'
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
                    x: 410, y: 0,
                    customStyle : 'top: -10em; left: 5.3em;     padding-top: 3.5em;'
                }],
                [{
                    id: 'more',
                    text: '',
                    hasCustomHTML:true,
                    colour: c.yellow,
                    postType: t.bentL,
                    x:  748 , y:  395,
                    customStyle : 'top: 11em; left: 3em; color: #5F4013;',
                }]
            ]
        },
        {
            id: "skills",
            x:  1728 , y:  124,
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
                    x:  1387 , y:  100 ,
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
                    x:  1777 , y:  142 ,
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
                    x: 2173 , y: 142
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
                    x: 2562 , y: 142,
                    overwriteScrollText: 'Product',
                }]
            ]
        },
        {
            id: "education",
            x:  490 , y:  1158,
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
                    x:  103 , y:  1052 ,
                    customStyle : 'left: 5em;',
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
                        x:  560 , y:  1018 ,

                        customStyle : 'left: -1em; top: 1em;',

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
                        x:  866 , y:  1196 ,
                        customStyle : 'left: 5em;'
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
                        overwriteScrollText: 'Quiena',
                        x:  1295 , y:  1130 ,
                        customStyle : 'left: 10em;',
                        imgId: 'quiena1'
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
            x:  2007 , y:  852,
            customTitleStyle: 'top: -1.6em; left: 0.4em;',
            postItGroups: [

                [
                    {
                        id: 'space_o2',
                        text: 'Space O2 VR',
                        overwriteScrollText: 'Space O2 VR',
                        subtext: 'Incremental VR videogame',
                        videoUrl: 'VKvfS5y1mG4',
                        href: 'https://andbf.itch.io/space-o2',
                        postType: t.polaroid,
                        x:  1826 , y:  744 ,
                    },
                    {
                        id: 'lava_surf',
                        text: 'Lava Surf VR',
                        overwriteScrollText: 'Lava Surf VR',
                        subtext: 'Cardboard game - Thesis',
                        postType: t.polaroid,
                        x:  1826 , y:  1064 ,
                        videoUrl: 'CocjtK3EBuA',
                        href: 'https://andbf.itch.io/lava-surf-vr'
                    },
                ],
                [

                    {
                        id: 'vr_dinning',
                        text: 'VR Dinning',
                        subtext: 'Master thesis experience plan',
                        overwriteScrollText: 'VR Dinning',
                        videoUrl: 'TOI1ie4dzRw',
                        postType: t.polaroid,
                        x:  2194 , y:  763 ,
                    },
                    {
                        id: 'modera_game',
                        text: 'Modera Game',
                        subtext: 'Hackathon social game',
                        overwriteScrollText: 'ModeraGame',
                        videoUrl: 'bKNcZ4yMe40',
                        href: 'https://andbf.itch.io/modera-game',
                        postType: t.polaroid,
                        x:  2194 , y:  1090 ,
                    },
                ],
                [

                    {
                        id: 'smatchups',
                        text: 'Smatchups',
                        subtext: 'Community voting fullstack project ',
                        postType: t.polaroid,
                        overwriteScrollText: 'Smatchups',
                        href: 'https://twitter.com/InfoSmatchups',
                        x:  2558 , y:  763 ,
                        imgId: 'smatchups'
                    },
                    {
                        id: 'pokeweakto',
                        text: 'Poke Weak To',
                        overwriteScrollText: 'Poke Weak To',
                        subtext: 'Interactive companion tool',
                        postType: t.polaroid,
                        x:  2558  , y:  1090,
                        href: 'https://poke-weak-to.vercel.app/',
                        imgId: 'pokeweakto'
                    },
                    /*{
                        id: 'reel',
                        text: 'and more...',
                        overwriteScrollText: 'Extra Reel',
                        subtext: ' ',
                        postType: t.polaroid,
                        x:  2558  , y:  1090
                    },*/
                ],
                [

                    {
                        id: 'youtube',
                        icon: true,
                        text: 'youtube.com/user/andzofficial',
                        href: 'https://www.youtube.com/user/andzofficial/videos',

                        postType: t.bentR,
                        colour: c.red,
                        size: s.small,
                        overwriteScrollText: 'Else...',
                        x:  2930 , y: 968 ,
                        customStyle: 'top: 6em; left: 6em;'
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
                        customStyle: 'top: 4em;'
                    },
                    {
                        id: 'last',
                        text: '',
                        postType: t.bentL,
                        colour: c.blue,
                        size: s.small,
                        notScrollable: true,
                        customStyle: 'top: 2em; left: 6em;',
                        hasCustomHTML: true,
                    },
                ],
            ]
        }
    ];
