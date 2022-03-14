<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;800&display=swap" rel="stylesheet">
</svelte:head>

<script>
	import { goto } from '$app/navigation'
	import {page} from '$app/stores'
	import Postit from '$lib/Postit/Postit.svelte';
	import MediaQuery from '$lib/MediaQuery.svelte';
	import { postItsDB } from './print/postits-db.ts';
	import Logo from './print/abfLogo.svelte';

	import { onMount } from 'svelte';

	let breakpointMobile = 1500

	let isMounted

	let pos = { top: 0, left: 0, x: 0, y: 0 }

	let insideWindow
	let isDragging

	let isPressingSpaceBar

	let currentTheme = 0

	let logoDisable = true

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

		var halfHeight = Math.round(window.innerHeight / 2)
		var halfWidth = Math.round(window.innerWidth / 2)
		//console.log('x: ', auxX, ', y: ', auxY,',')

		logoDisable = false
	}

	let postItsData = postItsDB;

	let scrollPositionsDesktop = [];
	let scrollPositionsMobile = [];

	postItsData.forEach(data => {
		if(data.id != 'experience'){
			scrollPositionsDesktop.push(data.overwriteId ?
					{ id: data.overwriteId.id, text: data.overwriteId.text, x: data.x, y: data.y }
					:
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

	function scrollTo(x, y){
		var halfWidth = Math.round(window.innerWidth / 2)
		var halfHeight = Math.round(window.innerHeight / 2)
		window.scrollTo(x, y)
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


		var replaceTo = `#${arr[currentScrollpos].id}`
		if(currentScrollpos == 0){
			window.history.pushState({}, "<name>", " ")
		} else {
			window.history.replaceState({}, '#', replaceTo);

		}



		setCssSmoothBehaviour(true)
		setTimeout(()=>{
			setCssSmoothBehaviour()
			logoDisable = pos == 0
		}, 800)
		scrollTo(arr[pos].x, arr[pos].y)
	}

	var menuExpanded;

	function expandMenu(){
		menuExpanded = !menuExpanded;
	}


	onMount(() => {
		var currentHash = window.location.hash.substring(1)
		var foundHash = false
		scrollPositionsMobile.forEach((pos, i) => {
			if(pos.id == currentHash || pos.category == currentHash || pos.category.id == currentHash){
				var x = pos.x
				var y = pos.y
				var newPos = i
				if(pos.category == currentHash || pos.category.id == currentHash){
					var currentPos = scrollPositionsDesktop.find(posDesktop => posDesktop.id === currentHash || (posDesktop.category && posDesktop.category.id == currentHash))
					newPos = scrollPositionsDesktop.findIndex(posDesktop => posDesktop.id === currentHash || (posDesktop.category && posDesktop.category.id == currentHash))
					x = currentPos.x
					y = currentPos.y
				}
				currentScrollpos = newPos
				foundHash = true
				scrollTo(x, y)
				return;
			}
		})
		if(!foundHash){
			var posArr = isMobile() ? scrollPositionsMobile : scrollPositionsDesktop
			scrollTo(posArr[0].x,posArr[0].y)
		}
		isMounted = true;
	});


	function setCssSmoothBehaviour(isSmooth){
		var setTo = isSmooth ? 'smooth' : 'initial'
		document.documentElement.style.setProperty('scroll-behavior',setTo)

	}

	function changeTheme(){
		currentTheme != 0 ? currentTheme = 0 : currentTheme = 1
	}

	function returnToStart(){
		changeScrollPos(0, !isMobile())
	}

	function isMobile(){
		return window.innerWidth < breakpointMobile
	}
</script>
<svelte:window
		on:scroll={onScrollEvent}
		on:keyup={onKeyUp}
		on:keydown={onKeyDown}/>
<div class="body" class:spacebar={isPressingSpaceBar}>
	<div class="loader" class:hide-loader={isMounted}></div>
	<div class="logo" on:click={returnToStart} class:logo-disable={logoDisable}>
		<Logo />
	</div>

	<div class="menu-wrapper">
		<MediaQuery query="(max-width: {breakpointMobile}px)" let:matches>
			{#if matches}
				<div class="menu-button menu-button-back" on:click={() => changeScrollPos(currentScrollpos - 1)}>  </div>
				<div class="menu-button menu-button-navigation" on:click={expandMenu}>
					<div class="menu-button-expand wip" class:menu-button-expand-expanded={menuExpanded}><div></div></div>
					<div>
						<div class="menu-category">{scrollPositionsMobile[currentScrollpos].category}</div>
						<div class="menu-title">{scrollPositionsMobile[currentScrollpos].text || scrollPositionsMobile[currentScrollpos].id}</div>
					</div>
					<div class="menu-button-counter">{currentScrollpos + 1} of {scrollPositionsMobile.length}</div>
				</div>
				<div class="menu-button menu-button-forward"  on:click={() => changeScrollPos(currentScrollpos + 1)}>  </div>
			{:else}
				<div class="menu-button menu-button-back" on:click={() => changeScrollPos(currentScrollpos - 1, true)}>  </div>
				<div class="menu-button menu-button-navigation">
					<div class="menu-title capitilize">{scrollPositionsDesktop[currentScrollpos] ? (scrollPositionsDesktop[currentScrollpos].text || scrollPositionsDesktop[currentScrollpos].id) : ''}</div>
				</div>
				<div class="menu-button menu-button-forward"  on:click={() => changeScrollPos(currentScrollpos + 1, true)}>  </div>
			{/if}
		</MediaQuery>
	</div>

	<div class="menu-right wip">
		<div class="menu-button menu-button-theme" on:click={changeTheme}> {currentTheme} </div>
	</div>
	<div id="wrapper"
		 class="wrapper-theme-{currentTheme}"
		 on:mouseenter={() => blur()}
		 on:mouseout={() => blur(true)}
		 on:blur={() => blur(true)}
		 on:mousemove={handleMouseMove}
		 on:mousedown={handleMouseDown}
		 on:mouseup={handleMouseUp}>


		<div class="postits-wrapper">



			<div class="ar-iframe-container">
				<span class="arrow blink_5s">⬆</span>

				<iframe title="ar-iframe" id="ar-iframe" src="https://app.vectary.com/viewer/v1/?model=4f7b7d5a-0875-4293-bbb6-1157a34bd36a&env=studio3&turntable=-3" frameborder="0" width="100%" height="480"></iframe>

			</div>


			{#each postItsData as postItData, i}
				<div id="group-{postItData.id}" class="group-container" class:container-padding-bottom={i === 0}>

					<div class="group-title" style="{postItData.customTitleStyle ? postItData.customTitleStyle : ''}">
						{postItData.id}
					</div>
					<div  class="postits-group">
						{#each postItData.postItGroups as postItGroup}
							<div class="postits-group-column">
								{#each postItGroup as postIt, j (postIt.id)}
									<div class="postit-individual {postIt.href ? 'is-link' : ''}" style="z-index: {postItGroup.length - j}">
										<Postit postData={postIt} currentTheme={currentTheme} />
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
<div class="reticle"></div>

<style>
	.reticle{
		display: none;
		position: fixed;
		z-index: 2000;
		background: red;
		width: 2px;
		height: 2px;
		left: 50%;
		top: 44%;
	}
	:root{
		--dark: #859aac;
	}


	.logo{
		position: fixed;
		left: 3vh;
		bottom: 90%;
		width: 13vh;
		z-index: 100;
		cursor: pointer;
		transition: 0.2s;
		opacity: 0.5;
	}
	.logo-disable,
	.logo:hover{
		opacity: 1;
	}
	.logo-disable{
		pointer-events: none;
	}
	.menu-wrapper{
		width: 22.5em;
		right: 7vh;
		transition: cubic-bezier(0.61, 0.38, 0.13, 1.01) 2s;
	}
	.menu-right{
		right: calc(7vw + 20.5em);
	}

	.menu-wrapper,
	.menu-right{

		bottom: 90%;
		position: fixed;
		display: flex;
		height: 4em;
		align-items: center;
		justify-content: center;
		z-index: 100;
		transition: cubic-bezier(0.61, 0.38, 0.13, 1.01) 2s;
	}
	@media all and (max-width: 1500px) {
		.menu-wrapper {
			right: calc(50% - 180px);
			bottom: 3%;
		}
		.menu-right{
			right: 2vw;
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
		transition: ease-in 0.2s;
	}

	.wrapper-theme-0{

		background-color: var(--primary-color);
		background: linear-gradient(
				180deg,
				var(--primary-color) 0%,
				var(--secondary-color) 10.45%,
				var(--tertiary-color) 41.35%
		);
	}
	.wrapper-theme-1{

		background-color: #545D62;
		background: #545D62;
	}
	.ar-iframe-container{

		filter: drop-shadow(20px 18px 7px rgba(0,0,0,.4));
		z-index: 2;
		position: absolute;
		top: 25.5em;
		left: 40em;
		transition: 0.2s;
	}
	#ar-iframe{
		width: 333px;
		height: 333px;
	}
	.arrow{
		position: absolute;
		color: black;
		right: 21px;
		top: 50px;
	}

	.ar-iframe-container:hover{
		filter: drop-shadow(10px 10px 3px rgba(0,0,0,.2));
	}

	.body{
		font-family: Poppins;
		color: #6C808E;
	}
	.group-container{
		position: relative;
		padding-right: 20em;
	}
	.postits-group-column{
		display: flex; flex-direction: column;
	}
	.group-title{
		position: absolute;
		font-size: 4em;
		font-weight: 800;
		top: -1.6em;
		z-index: 0;
		letter-spacing: -4px;

	}
	.body.spacebar{
		cursor: grab;
	}
	.container-padding-bottom{
		padding-bottom: 17em;
	}

	.postit-individual.is-link:hover {
		z-index: 10 !important;
	}

	.loader{
		position: fixed;
		z-index: 1000;
		background: linear-gradient(
				180deg,
				var(--primary-color) 0%,
				var(--secondary-color) 10.45%,
				var(--tertiary-color) 41.35%
		);
		width: 100%;
		height: 100%;
		transition: ease-in-out 0.2s;
		pointer-events: auto;
	}
	.hide-loader{
		opacity: 0;
		pointer-events: none;
	}
	#group-portfolio{
		top: -18em;
	}
	.wip{
		visibility: hidden;
	}

	:global(.blink_1s) {
		animation: blinker 1s linear infinite;
	}
	:global(.blink_5s) {
		animation: blinker 5s linear infinite;
	}
	@keyframes blinker {
		50% {
			opacity: 0;
		}
	}
	.capitilize{
		text-transform: capitalize;
	}
</style>
