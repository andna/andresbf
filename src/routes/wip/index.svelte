

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
            postItGroups: []
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

</script>


<div style="position:fixed;">{insideWindow}</div>
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


    <div  style="display: flex;">

        {#each postItsData as postItData}
            <div  style="display: flex;">

                {postItData.id}
                <div style="display: flex;">
                    {#each postItData.postItGroups as postItGroup}
                        <div style="display: flex; flex-direction: column;">
                            {#each postItGroup as postIt (postIt.id)}
                                <Postit postId={postIt.id}
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
    #wrapper{
        width: 5000px;
        height: 5000px;
    }
    #ar-iframe{
        width: 333px;
        height: 333px;
        margin-bottom: -100px;
        filter: drop-shadow(20px 28px 6px rgba(0,0,0,.3));
    }
</style>
