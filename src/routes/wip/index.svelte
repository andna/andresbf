<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;800&display=swap" rel="stylesheet">
</svelte:head>

<script>
    import Postit from '$lib/Postit/Postit.svelte';
    import { postItsDB } from './postits-db.ts';
    import logo from './abfLogo.svg';



    let pos = { top: 0, left: 0, x: 0, y: 0 }

    let insideWindow
    let isDragging

    let isPressingSpaceBar

    function onKeyDown(e){
        if (e.keyCode === 32 && e.target === document.body) {
            e.preventDefault();
            isPressingSpaceBar = true;
        }
    }
    function onKeyUp(e){
        if (e.keyCode === 32 && e.target === document.body) {
            e.preventDefault();
            isPressingSpaceBar = false;
        }
    }

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

    let auxX = 0
    let auxY = 0
    function onScrollEvent(event){
        auxX = Math.round(window.pageXOffset)
        auxY = Math.round(window.pageYOffset)
    }

    let postItsData = postItsDB;

</script>
<svelte:window on:scroll={onScrollEvent} on:keyup={onKeyUp} on:keydown={onKeyDown}/>
<div class="body" class:spacebar={isPressingSpaceBar}>
    <div class="logo">
        <img src={logo} alt="ABF" />
        <br>
        <small><small>x: {auxX} <br> y: {auxY}</small></small>
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

        <!--
        <iframe title="ar-iframe" id="ar-iframe" src="https://app.vectary.com/viewer/v1/?model=d2ea42d2-dfb8-44e0-9f1f-ee8ea6303e82&env=studio1&turntable=3" frameborder="0" width="100%" height="480"></iframe>
-->
        <div class="postits-wrapper">

            {#each postItsData as postItData, i}
                <div class="group-container" class:container-padding-bottom={i === 0}>

                    <div class="group-title">{postItData.id}</div>
                    <div  class="postits-group">
                        {#each postItData.postItGroups as postItGroup}
                            <div class="postits-group-column">
                                {#each postItGroup as postIt (postIt.id)}
                                    <Postit postData={postIt} />
                                {/each}
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>

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
    }
    #wrapper{
        width: 3600px;
        height: 1800px;
        user-select: none;
        padding: 30vh 30vw;
    }
    #ar-iframe{
        width: 333px;
        height: 333px;
        margin-bottom: -200px;
        filter: drop-shadow(20px 28px 6px rgba(0,0,0,.3));
        z-index: 2;
        position: absolute;
    }
    .body{
        font-family: Poppins;
        color: #6C808E;
    }
    .group-container{
        position: relative;
        padding-right: 22em;
    }
    .postits-group-column{
        display: flex; flex-direction: column;
    }
    .group-title{
        position: absolute;
        font-size: 80px;
        font-weight: 800;
        top: -2em;
        z-index: -1;
        letter-spacing: -4px;

    }
    .body.spacebar{
        cursor: grab;
    }
    .container-padding-bottom{
        padding-bottom: 15em;
    }
</style>
