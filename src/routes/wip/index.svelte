<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;800&display=swap" rel="stylesheet">
</svelte:head>

<script>
    import { onMount } from 'svelte'
    import Postit from '$lib/Postit/Postit.svelte';
    import MediaQuery from '$lib/MediaQuery.svelte';
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

    let scrollPositionsDesktop = [];
    let scrollPositionsMobile = [];

    postItsData.forEach(data => {
        if(data.id != 'experience'){
            scrollPositionsDesktop.push(data.id == 'education' ?
                { id: 'eduxperience', text: 'Education & Experience', x: 400, y: 1000 }                :
                {id: data.id, x: data.x, y: data.y });
        }
        data.postItGroups.forEach(group => {
            group.forEach(postit => {
                if(!postit.notScrollable){
                    scrollPositionsMobile.push(
                        { id: postit.id,
                            text: postit.overwriteScrollText || postit.id,
                            category: data.id,
                            x: postit.x,
                            y: postit.y,
                        }
                    )
                }
            });
        });

        //move name first
        var element = scrollPositionsMobile[1];
        scrollPositionsMobile.splice(1, 1);
        scrollPositionsMobile.splice(0, 0, element);

    });


    let currentScrollpos = 0

    function scrollTo(pos, arr){
        window.scrollTo( arr[pos].x, arr[pos].y)
    }

    function changeScrollPos(pos, isDesktop = null){
        var arr = isDesktop ? scrollPositionsDesktop : scrollPositionsMobile;
        if(pos > arr.length - 1){
            pos = 0
        }
        if(pos < 0){
            pos = arr.length - 1
        }
        currentScrollpos = pos
        scrollTo(pos, arr)
    }

    var menuExpanded;

    function expandMenu(){
        menuExpanded = !menuExpanded;
    }

</script>
<svelte:window on:scroll={onScrollEvent}
               on:keyup={onKeyUp}
               on:keydown={onKeyDown}/>
<div class="body" class:spacebar={isPressingSpaceBar}>
    <div class="logo">
        <img src={logo} alt="ABF" />
        <br>
        <small style="opacity: 0.1"><small>x: {auxX} <br> y: {auxY}</small></small>
    </div>

    <div class="menu-wrapper">
        <MediaQuery query="(min-width: 1360px)" let:matches>
            {#if matches}
                <div class="menu-button menu-button-back" on:click={() => changeScrollPos(currentScrollpos - 1, true)}>  </div>
                <div class="menu-button menu-button-navigation">
                    <div class="menu-title">{scrollPositionsDesktop[currentScrollpos] ? (scrollPositionsDesktop[currentScrollpos].text || scrollPositionsDesktop[currentScrollpos].id) : ''}</div>
                </div>
                <div class="menu-button menu-button-forward"  on:click={() => changeScrollPos(currentScrollpos + 1, true)}>  </div>
            {:else}
                <div class="menu-button menu-button-back" on:click={() => changeScrollPos(currentScrollpos - 1)}>  </div>
                <div class="menu-button menu-button-navigation" on:click={expandMenu}>
                    <div class="menu-button-expand" class:menu-button-expand-expanded={menuExpanded}><div></div></div>
                    <div>
                        <div class="menu-category">{scrollPositionsMobile[currentScrollpos].category}</div>
                        <div class="menu-title">{scrollPositionsMobile[currentScrollpos].text || scrollPositionsMobile[currentScrollpos].id}</div>
                    </div>
                    <div class="menu-button-counter">{currentScrollpos + 1} of {scrollPositionsMobile.length}</div>
                </div>
                <div class="menu-button menu-button-forward"  on:click={() => changeScrollPos(currentScrollpos + 1)}>  </div>
            {/if}
        </MediaQuery>
    </div>
    <div id="wrapper"
         on:mouseenter={() => blur()}
         on:mouseout={() => blur(true)}
         on:blur={() => blur(true)}
         on:mousemove={handleMouseMove}
         on:mousedown={handleMouseDown}
         on:mouseup={handleMouseUp}>


       <div class="postits-wrapper">
           <!--
           <iframe title="ar-iframe" id="ar-iframe" src="https://app.vectary.com/viewer/v1/?model=d2ea42d2-dfb8-44e0-9f1f-ee8ea6303e82&env=studio1&turntable=3" frameborder="0" width="100%" height="480"></iframe>
-->
           {#each postItsData as postItData, i}
                <div class="group-container" class:container-padding-bottom={i === 0}>

                    <div class="group-title">{postItData.id}</div>
                    <div  class="postits-group">
                        {#each postItData.postItGroups as postItGroup}
                            <div class="postits-group-column">
                                {#each postItGroup as postIt, j (postIt.id)}
                                    <div class="postit-individual {postIt.href ? 'is-link' : ''}" style="z-index: {postItGroup.length - j}">
                                        <Postit postData={postIt} />
                                    </div>
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
    :root{
        --dark: #859aac;
    }
    .logo{
        position: fixed;
        left: 2vh;
        top: 2.5vh;
        width: 13vh;
        z-index: 100;
    }
    .logo img{ width: 100%; }
    .menu-wrapper{
        position: fixed;
        width: 360px;
        left: calc(50% - 180px);
        display: flex;
        height: 5em;
        align-items: center;
        justify-content: center;
        z-index: 100;
        bottom: 3%;
        transition: cubic-bezier(0.61, 0.38, 0.13, 1.01) 2s;
    }
    @media all and (min-width: 1360px) {
        .menu-wrapper {
            bottom: 90%;
        }
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
        user-select: none;
        position: relative;
        line-height: 1.2em;
        color: var(--dark);
    }
    .menu-button-expand>div,
    .menu-button-expand:before,
    .menu-button-expand:after,
    .menu-button-back:before,
    .menu-button-forward:before,
    .menu-button-back:after,
    .menu-button-forward:after{
        content: ' ';
        position: absolute;
        width: 2px;
        height: 11px;
        background: var(--dark);
        border-radius: 59px;
        transform: rotate(45deg) translate(-4px, -2px);
        transition: ease-in-out 0.2s;
    }

    .menu-button-back:after{
        transform: rotate(-45deg) translate(-3px, 1px);
    }

    .menu-button-forward:before{
        transform: rotate(-45deg) translate(4px, -2px);
    }

    .menu-button-forward:after{
        transform: rotate(45deg) translate(3px, 1px);
    }
    .menu-button-expand:before{
        transform: rotate(90deg) translate(-16px, 0px);
    }

    .menu-button-expand > div{
        transform: rotate(90deg) translate(-4px, -16px);
    }
    .menu-button-expand:after{
        transform: rotate(90deg) translate(-10px, 0px);
    }
    .menu-button-expand:before,
    .menu-button-expand:after,
    .menu-button-expand > div{
        height: 16px;
    }

    .menu-button-expand-expanded:before{
        transform: rotate(45deg) translate(-8px, -5px);
    }
    .menu-button-expand-expanded > div{
        transform: rotate(135deg) translate(-17px, -4px);
    }
    .menu-button-expand-expanded:after{
        height: 0;
        transform: rotate(90deg) translate(0px, 0px);
    }

    .menu-button:last-child{
        margin-right: 0;
    }
    .menu-button-counter,
    .menu-button-expand{
        width: 40px;
        font-size: 65%;
        letter-spacing: -.4px;
    }
    .menu-button-counter{
        text-align: right;
    }
    .menu-button-navigation{
        flex-grow: 1;
    }
    .menu-title{
        font-weight: 800;
        letter-spacing: -.6px;
        min-width: 110px;
    }
    .menu-category{
        font-size: 75%;
    }
    .menu-title,
    .menu-category{

    }
    .postits-wrapper{
        flex-flow: row wrap;
        display: flex;
        position: relative;
    }
    .postits-group{
        display:flex;
    }
    #wrapper{
        width: 3600px;
        height: 1800px;
        user-select: none;
        padding: 42vh 12vw 12vh 35vw;
    }
    #ar-iframe{
        width: 333px;
        height: 333px;
        margin-bottom: -200px;
        filter: drop-shadow(20px 28px 6px rgba(0,0,0,.3));
        z-index: 2;
        position: absolute;
        top: 220px;
        left: 658px;
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
        top: -1.6em;
        z-index: -1;
        letter-spacing: -4px;

    }
    .body.spacebar{
        cursor: grab;
    }
    .container-padding-bottom{
        padding-bottom: 15em;
    }

    .postit-individual.is-link:hover {
        z-index: 10 !important;
    }
</style>
