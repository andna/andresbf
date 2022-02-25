

<script context="module">
    export const prerender = true;
</script>

<script>
    import Postit from '$lib/Postit.svelte';

    let pos = { top: 0, left: 0, x: 0, y: 0 }

    let insideWindow
    let isDragging

    function handleMouseDown(event) {
        isDragging = true
        pos = {
            top: window.pageYOffset,
            left: window.pageXOffset,
            x: event.clientX,
            y: event.clientY
        }
    }
    function handleMouseUp(event) {
        isDragging = false
    }
    function handleMouseMove(event) {
        if (isDragging) {
            const dx = event.clientX - pos.x;
            const dy = event.clientY - pos.y;

            const left = pos.left - dx;
            const top = pos.top - dy;
            window.scrollTo(left, top);
        }
    }
    function blur(isOut) {
        insideWindow = !isOut
        if(!isOut){
            isDragging = false
        }
    }

    let postItSmallSize = 200
    let postItMediumSize = 250

    let postItsData = [
        {
            id: "about",
            postItGroups: [
                [
                    {
                        id: 'mail',
                        text: 'andbastidasfierro@gmail.com',
                        icon: 'mail',
                        colour: 2,
                        postType: 2,
                        customSize: postItSmallSize,
                    },
                    {
                        id: 'linkedin',
                        text: 'andbastidasfierro@gmail.com',
                        icon: 'mail',
                        colour: 2,
                        postType: 1,
                        customSize: postItSmallSize,
                    },
                    {
                        id: 'instagram',
                        text: 'andbastidasfierro@gmail.com',
                        icon: 'mail',
                        colour: 2,
                        postType: 0,
                        customSize: postItSmallSize,
                    }
                ],
                [{
                    id: 'me',
                    text: 'Andrés Bastidas Fierro',
                    icon: 'mail',
                    postType: 0,
                    colour: 1,
                }],
                [{
                    id: 'more',
                    text: 'Andrés Bastidas Fierro',
                    icon: 'mail',
                    colour: 3,
                    postType: 2,
                }]
            ]
        },
        {
            id: "skills",
            postItGroups: [
                [{
                    id: 'frontend',
                    text: 'Andrés Bastidas Fierro',
                    icon: 'mail',
                    postType: 0,
                    colour: 1,
                }],
                [{
                    id: 'vrar',
                    text: 'Andrés Bastidas Fierro',
                    icon: 'mail',
                    postType: 2,
                    colour: 2,
                }],
                [{
                    id: 'uxui',
                    text: 'Andrés Bastidas Fierro',
                    icon: 'mail',
                    postType: 2,
                    colour: 0,
                }],
                [{
                    id: 'product',
                    text: 'Andrés Bastidas Fierro',
                    icon: 'mail',
                    postType: 2,
                    colour: 3,
                }]
            ]
        },
        {
            id: "education",
            postItGroups: [
                [
                    {
                    id: 'master',
                    text: 'Andrés Bastidas Fierro',
                    icon: 'mail',
                    postType: 1,
                    colour: 1,
                    customSize: postItMediumSize,
                    },
                    {
                    id: 'university',
                    text: 'Andrés Bastidas Fierro',
                    icon: 'mail',
                    postType: 2,
                    colour: 3,
                    customSize: postItMediumSize,
                    }
                ],
                [

                   {
                        id: 'halliburton',
                        text: 'Andrés Bastidas Fierro',
                        icon: 'mail',
                        postType: 2,
                        colour: 0,
                        customSize: postItSmallSize,
                    },{
                        id: 'atiko7',
                        text: 'Andrés Bastidas Fierro',
                        icon: 'mail',
                        postType: 1,
                        colour: 3,
                        customSize: postItSmallSize,
                    },
                ],
                [
                    {
                        id: 'quiena',
                        text: 'Andrés Bastidas Fierro',
                        icon: 'mail',
                        postType: 2,
                        colour: 2,
                        customSize: postItMediumSize,
                    },
                    {
                        id: 'productmanager',
                        text: 'Andrés Bastidas Fierro',
                        icon: 'mail',
                        postType: 2,
                        colour: 1,
                        customSize: postItSmallSize,
                    },
                    {
                        id: 'uxuileader',
                        text: 'Andrés Bastidas Fierro',
                        icon: 'mail',
                        postType: 1,
                        colour: 1,
                        customSize: postItSmallSize,
                    },
                    {
                        id: 'frontenddev',
                        text: 'Andrés Bastidas Fierro',
                        icon: 'mail',
                        postType: 1,
                        colour: 1,
                        customSize: postItSmallSize,
                    },
                ]
            ]
        },
        {
            id: "experience",
            postItGroups: []
        },
        {
            id: "portfolio",
            postItGroups: []
        }
    ];

    import logo from './abfLogo.svg';
</script>
<div class="logo">
    <img src={logo} alt="ABF" />
</div>

<div class="menu-wrapper">
    <div class="menu-button menu-button-back"> b </div>
    <div class="menu-button menu-button-navigation">
        <div>o</div>
        <div>
            <div>experience</div>
            <div>Space O2 VR</div>
        </div>
        <div>
            <p>
                1/2
            </p>
        </div>
    </div>
    <div class="menu-button menu-button-back"> f </div>
</div>
<div id="wrapper"
     on:mouseenter={() => blur()}
     on:mouseout={() => blur(true)}
     on:blur={() => blur(true)}
     on:mousemove={handleMouseMove}
     on:mousedown={handleMouseDown}
     on:mouseup={handleMouseUp}>

    <iframe id="ar-iframe" src="https://app.vectary.com/viewer/v1/?model=d2ea42d2-dfb8-44e0-9f1f-ee8ea6303e82&env=studio1&turntable=3" frameborder="0" width="100%" height="480"></iframe>


    The mouse position is {pos.top} x {pos.left}
    {isDragging}


    <div class="postits-wrapper">

        {#each postItsData as postItData}
            <div  style="display: flex;">

                <h1><b>{postItData.id}</b></h1>
                <div  class="postits-group">
                    {#each postItData.postItGroups as postItGroup}
                        <div style="display: flex; flex-direction: column;">
                            {#each postItGroup as postIt (postIt.id)}
                                <Postit title={postIt.id}
                                        postId={postIt.id}
                                        currentColor={postIt.colour}
                                        currentPostType={postIt.postType}
                                        svgSize={postIt.customSize} />
                            {/each}
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>

</div>

<style>
    .logo{
        position: fixed;
        left: 2vh;
        top: 2.5vh;
        width: 10vh;
        z-index: 100;
    }
    .menu-wrapper{
        position: fixed;
        width: 360px;
        left: calc(50% - 180px);
        display: flex;
        height: 5em;
        align-items: center;
        justify-content: center;
        z-index: 10;
        bottom: 3%;
    }
    .menu-button{
        background: #ffffff;
        padding: 1em;
        color: #506163;
        display: flex;
        margin-right: 16px;
        border-radius: 100px;
        min-width: 60px;
        text-align: center;
        min-height: 60px;
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
        box-shadow: 3px 5px 5px rgba(0, 0, 0, 0.15), -2px -2px 5px rgba(255, 255, 255, 0.45);
        height: 60px;
        cursor: pointer;

    }
    .menu-button:last-child{
        margin-right: 0;
    }
    .menu-button-navigation{
        flex-grow: 1;
    }
    .postits-wrapper{
        flex-flow: row wrap;
        display: flex;
    }
    .postits-group{
        display:flex;
        padding: 50px;
    }
    #wrapper{
        width: 3000px;
        height: 1800px;
        user-select: none;
    }
    #ar-iframe{
        width: 333px;
        height: 333px;
        margin-bottom: -200px;
        filter: drop-shadow(20px 28px 6px rgba(0,0,0,.3));
    }
</style>
