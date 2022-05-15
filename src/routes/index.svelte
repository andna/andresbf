<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin>
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;800&display=swap" rel="stylesheet">
</svelte:head>

<script>
	import Postit from '$lib/Postit/Postit.svelte';
	import MediaQuery from '$lib/MediaQuery.svelte';
	import {postItsDB} from './print/postits-db.ts';
	import Logo from './print/abfLogo.svelte';

	import {onMount} from 'svelte';

	let breakpointMobile = 1500

	let isMounted

	let pos = {top: 0, left: 0, x: 0, y: 0}

	let insideWindow
	let isDragging

	let isPressingSpaceBar

	let currentTheme = 0

	let logoDisable = true

	function onKeyDown(e) {
		if (e.keyCode === 32 && e.target === document.body) {
			e.preventDefault();
			isPressingSpaceBar = true;
		}
	}

	function onKeyUp(e) {
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
		if (!isOut) {
			isDragging = false
		}
	}

	let auxX = 0
	let auxY = 0


	let innerHeight = 0
	let innerWidth = 0
	let innerHeightHalf = 0
	let innerWidthHalf = 0
	let paddingLeft = 0
	let paddingTop = 0

	function resizedScreen() {
		innerHeightHalf = Math.round(window.innerHeight / 2)
		innerWidthHalf = Math.round(window.innerWidth / 2)
		paddingLeft = Math.round(window.innerWidth * 0.56)
		paddingTop = Math.round(window.innerHeight * 0.56)
	}

	//$: (innerHeight || innerWidth) && resizedScreen()


	let countScrollFrame = 0


	function onScrollEvent(event) {
		auxX = Math.round(window.scrollX)
		auxY = Math.round(window.scrollY)

		if (!currentlyScrollingByButton && countScrollFrame == 0) {
			let foundCurrentPos = false
			if (isMobile()) {

				scrollPositionsMobile.forEach((pos, i) => {
					let box = pos.boxCollider
					if (!foundCurrentPos &&
							auxX >= box.x1 && auxX < box.x2 &&
							auxY >= box.y1 && auxY < box.y2
					) {
						foundCurrentPos = true
						currentScrollpos = i
					}
				});

			} else {
				scrollPositionsDesktop.forEach((pos, i) => {
					let box = pos.boxCollider
					if (!foundCurrentPos &&
							auxX >= box.x1 && auxX < box.x2 &&
							auxY >= box.y1 && auxY < box.y2
					) {
						foundCurrentPos = true
						currentScrollpos = i

					}
				});
			}
		}

		countScrollFrame = countScrollFrame > 10 ? 0 : countScrollFrame + 1;


		logoDisable = false
	}

	let postItsData = postItsDB;

	let scrollPositionsDesktop = [];
	let scrollPositionsMobile = [];

	let lastCategory;
	postItsData.forEach((data, i) => {
		if (data.id != 'experience') {
			scrollPositionsDesktop.push(data.overwriteId ?
					{
						id: data.overwriteId.id,
						text: data.overwriteId.text,
						x: data.x,
						y: data.y,
						boxCollider: data.boxCollider
					}
					:
					{id: data.id, x: data.x, y: data.y, boxCollider: data.boxCollider});
		}
		data.postItGroups.forEach(group => {
			group.forEach(postit => {
				if (!postit.notScrollable) {
					let isFirstOfCategory = false;
					if (lastCategory !== i) {
						lastCategory = i;
						isFirstOfCategory = true;
					}
					scrollPositionsMobile.push(
							{
								id: postit.id,
								text: postit.overwriteScrollText || postit.id,
								category: data.id,
								isFirstOfCategory: isFirstOfCategory,
								x: postit.x,
								y: postit.y,
								boxCollider: {
									x1: postit.x - 200,
									y1: postit.y - (postit.hasExtraBox ? 300 : 200) - 40,
									x2: postit.x + 200,
									y2: postit.y + (postit.hasExtraBox ? 300 : 200) - 40,
								}
							}
					)
				}
			});
		});

		//move name first instead of contact
		scrollPositionsMobile[0].isFirstOfCategory = false;
		var element = scrollPositionsMobile[1];
		element.isFirstOfCategory = true;
		scrollPositionsMobile.splice(1, 1);
		scrollPositionsMobile.splice(0, 0, element);
	});

	let currentScrollpos = 0

	function scrollTo(x, y) {
		//var halfWidth = Math.round(window.innerWidth / 2)
		//var halfHeight = Math.round(window.innerHeight / 2)
		window.scrollTo(x, y)
	}

	let currentlyScrollingByButton

	function changeScrollPos(pos, isDesktop = null) {
		currentlyScrollingByButton = true
		var arr = isDesktop ? scrollPositionsDesktop : scrollPositionsMobile;
		if (pos > arr.length - 1) {
			pos = 0
		}
		if (pos < 0) {
			pos = arr.length - 1
		}
		currentScrollpos = pos


		if (currentScrollpos == 0) {
			window.history.pushState({}, "<name>", " ")
		} else {
			window.history.replaceState({}, '#', `#${arr[currentScrollpos].id}`);

		}


		setCssSmoothBehaviour(true)
		setTimeout(() => {
			setCssSmoothBehaviour()
			currentlyScrollingByButton = false
			logoDisable = pos == 0
		}, 600)
		scrollTo(arr[pos].x, arr[pos].y)
	}

	var menuExpanded;

	function expandMenu() {
		menuExpanded = !menuExpanded;
	}


	onMount(() => {
		var currentHash = window.location.hash.substring(1)
		var foundHash = false
		scrollPositionsMobile.forEach((pos, i) => {
			if (!foundHash && (pos.id == currentHash || pos.category == currentHash || pos.category.id == currentHash)) {
				var x = pos.x
				var y = pos.y
				var newPos = i
				if (pos.category == currentHash || pos.category.id == currentHash) {
					var currentPos = scrollPositionsDesktop.find(posDesktop => posDesktop.id === currentHash || (posDesktop.category && posDesktop.category.id == currentHash))
					newPos = scrollPositionsDesktop.findIndex(posDesktop => posDesktop.id === currentHash || (posDesktop.category && posDesktop.category.id == currentHash))
					if (isMobile()) {
						currentPos = pos
						newPos = i
					}
					x = currentPos.x
					y = currentPos.y
				}
				currentScrollpos = newPos
				foundHash = true
				scrollTo(x, y)
			}


			var drawColliders = false
			if (pos.boxCollider && drawColliders) {

				var box = pos.boxCollider
				var newBox = document.createElement("div");
				newBox.style = "border: 1px solid;\n" +
						"\t\tposition: absolute;\n" +
						"\t\twidth: " + (box.x2 - box.x1) +
						"px;\n" +
						"\t\theight: " + (box.y2 - box.y1) +
						"px;\n" +
						"\t\tleft: " + box.x1 +
						"px;\n" +
						"\t\ttop: " + box.y1 +
						"px;\n" +
						"\t\tz-index: 1232323;\n" +
						"\t\tcontent: ' ';" +
						"pointer-events: none"
				document.getElementsByClassName("postits-wrapper")[0].append(newBox)
			}


		})
		if (!foundHash) {
			var posArr = isMobile() ? scrollPositionsMobile : scrollPositionsDesktop
			scrollTo(posArr[0].x, posArr[0].y)
		}
		isMounted = true;
	});


	function setCssSmoothBehaviour(isSmooth) {
		var setTo = isSmooth ? 'smooth' : 'initial'
		document.documentElement.style.setProperty('scroll-behavior', setTo)

	}

	function changeTheme() {
		currentTheme != 0 ? currentTheme = 0 : currentTheme = 1
	}

	function returnToStart() {
		changeScrollPos(0, !isMobile())
	}

	function isMobile() {
		return window.innerWidth < breakpointMobile
	}


</script>
<svelte:window
		bind:innerHeight={innerHeight}
		bind:innerWidth={innerWidth}
		on:scroll={onScrollEvent}
		on:keyup={onKeyUp}
		on:keydown={onKeyDown}/>
<div class="body" class:spacebar={isPressingSpaceBar}>
	<div class="loader" class:hide-loader={isMounted}></div>
	<div class="logo" on:click={returnToStart} class:logo-disable={logoDisable}>
		<Logo/>
	</div>

	<div class="menu-wrapper" class:menu-is-expanded={menuExpanded}
		 class:currently-disabled-button={currentlyScrollingByButton}>
		<MediaQuery query="(max-width: {breakpointMobile}px)" let:matches>
			{#if matches}
				<div class="menu-button menu-flex">
					<div class="menu-flex menu-button-action" on:click={expandMenu}>
						<div class="menu-button-expand">
							<div></div>
						</div>
						<div>
							<div class="menu-category">{scrollPositionsMobile[currentScrollpos].category}</div>
							<div class="menu-title">{scrollPositionsMobile[currentScrollpos].text || scrollPositionsMobile[currentScrollpos].id}</div>
						</div>
						<div class="menu-button-counter">{currentScrollpos + 1}
							of {scrollPositionsMobile.length}</div>

					</div>
					<div class="menu-button-action menu-button-back menu-button-navigation"
						 on:click={() => changeScrollPos(currentScrollpos - 1)}></div>
					<div class="menu-button-action menu-button-forward menu-button-navigation"
						 on:click={() => changeScrollPos(currentScrollpos + 1)}></div>
				</div>
				<div class="menu-list-wrapper">
					<div class="menu-list">
						{#each postItsData as data, i}
							{#if postItsData[i - 1] ? !postItsData[i - 1].joinWithNextGroup : true}
								<div class="menu-list-category">
									{#each scrollPositionsMobile as post, j}
										{#if post.category === data.id || (data.joinWithNextGroup && post.category === postItsData[i + 1].id)}
											{#if post.isFirstOfCategory}
												<div class="menu-category">{post.category}</div>
											{/if}
											<div class="menu-title menu-list-item"
												 on:click={() => {
												changeScrollPos(j);
												menuExpanded = false;
											 }}
												 class:menu-list-item-current={post.id === scrollPositionsMobile[currentScrollpos].id}>
												{post.text}
											</div>
										{/if}
									{/each}
								</div>
							{/if}
						{/each}
					</div>
					<div class="menu-list-overlay" on:click={() => { menuExpanded = false; }}></div>

				</div>

			{:else}
				<div class="menu-button menu-flex">
					<div class="menu-button-action menu-button-back menu-button-navigation"
						 on:click={() => changeScrollPos(currentScrollpos - 1, true)}></div>
					<div class="menu-title capitilize menu-flex">
						{scrollPositionsDesktop[currentScrollpos] ? (scrollPositionsDesktop[currentScrollpos].text || scrollPositionsDesktop[currentScrollpos].id) : ''}
					</div>
					<div class="menu-button-action menu-button-forward menu-button-navigation"
						 on:click={() => changeScrollPos(currentScrollpos + 1, true)}></div>
				</div>


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

				<iframe title="ar-iframe" id="ar-iframe"
						src="https://app.vectary.com/viewer/v1/?model=4f7b7d5a-0875-4293-bbb6-1157a34bd36a&env=studio3&turntable=-3"
						frameborder="0" width="100%" height="480"></iframe>

			</div>


			{#each postItsData as postItData, i}
				<div id="group-{postItData.id}" class="group-container" class:container-padding-bottom={i === 0}>

					<div class="group-title" style="{postItData.customTitleStyle ? postItData.customTitleStyle : ''}">
						{postItData.id}
					</div>
					<div class="postits-group">
						{#each postItData.postItGroups as postItGroup}
							<div class="postits-group-column">
								{#each postItGroup as postIt, j (postIt.id)}
									<div class="postit-individual {postIt.href ? 'is-link' : ''}"
										 style="z-index: {postItGroup.length - j}">
										<Postit postData={postIt} currentTheme={currentTheme}/>
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
<!--
<div class="reticle">
	x: {auxX}
	y: {auxY}
</div>
-->

<style>
	.reticle {
		position: fixed;
		z-index: 2000;
		background: red;
		width: 2px;
		height: 2px;
		left: 50%;
		top: 44%;
	}

	:root {
		--dark: #859aac;
	}


	.logo {
		position: fixed;
		left: 2.5vh;
		bottom: 91%;
		width: 10vh;
		z-index: 100;
		cursor: pointer;
		transition: 0.2s;
		opacity: 0.5;
	}

	.logo-disable,
	.logo:hover {
		opacity: 1;
	}

	.logo-disable {
		pointer-events: none;
	}

	.menu-wrapper {

		width: 16em;
		right: 7vh;
		transition: cubic-bezier(0.61, 0.38, 0.13, 1.01) 2s;
	}

	.menu-right {
		right: calc(7vw + 20.5em);
	}

	.menu-list-overlay {
		position: fixed;
		left: 0;
		top: 0;
		height: 100%;
		width: 100%;
		background: rgba(38, 41, 53, .65);
		z-index: -2;
	}

	.menu-list-wrapper {
		opacity: 0;
		pointer-events: none;
		transition: cubic-bezier(0.61, 0.38, 0.13, 1.01) 0.6s;
	}

	.menu-list {
		display: flex;
		flex-wrap: wrap;
		position: absolute;
		left: -1em;
		background: white;
		top: 54%;
		border-radius: 0 0 1em 1em;
		padding: 0 1.3em;
		box-sizing: border-box;
		right: -0.5em;
		z-index: -1;
		transition: cubic-bezier(0.61, 0.38, 0.13, 1.01) 0.6s;
		box-shadow: 3px 2px 5px rgba(0, 0, 0, 0.15);
		line-height: 1.5em;
		color: var(--dark);
	}

	.menu-is-expanded .menu-list-wrapper {
		pointer-events: auto;
		opacity: 1;
	}

	.menu-is-expanded .menu-list {
		padding: 1.3em;
	}

	.menu-list-category .menu-category {
		margin-top: 2.1em;
	}

	.menu-list-category:nth-child(odd) {
		margin-right: 2em;
	}

	.menu-list-item {
		cursor: pointer;
	}

	.menu-list-item-current {
		text-decoration: underline;
		text-decoration-thickness: 3px;
	}

	.menu-wrapper,
	.menu-right {

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
			right: 4vh;
		}

		.menu-right {
			right: 2vw;
		}
	}

	.menu-flex {

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.menu-button-action {
		min-width: 50px;
		height: 50px;
		cursor: pointer;
	}

	.menu-button {
		background: #ffffff;
		color: #506163;
		margin-right: 8px;
		border-radius: 100px;
		text-align: center;
		box-sizing: border-box;
		box-shadow: 3px 5px 5px rgba(0, 0, 0, 0.15), -2px -2px 5px rgba(255, 255, 255, 0.45);
		user-select: none;
		position: relative;
		line-height: 1.2em;
		color: var(--dark);
		transition: 0.3s;
		z-index: 1;
	}

	.menu-button-expand {
		margin-left: 5px;
	}

	.menu-button-expand > div,
	.menu-button-expand:before,
	.menu-button-expand:after,
	.menu-button-back:before,
	.menu-button-forward:before,
	.menu-button-back:after,
	.menu-button-forward:after {
		content: ' ';
		position: absolute;
		width: 2px;
		height: 11px;
		background: var(--dark);
		border-radius: 59px;
		transform: rotate(45deg) translate(-4px, -2px);
		transition: ease-in-out 0.2s;
	}

	.menu-button-back:after {
		transform: rotate(-45deg) translate(-3px, 1px);
	}

	.menu-button-forward:before {
		transform: rotate(-45deg) translate(4px, -2px);
	}

	.menu-button-forward:after {
		transform: rotate(45deg) translate(3px, 1px);
	}

	.menu-button-expand:before {
		transform: rotate(90deg) translate(-16px, 0px);
	}

	.menu-button-expand > div {
		transform: rotate(90deg) translate(-4px, -20px);
	}

	.menu-button-expand:after {
		transform: rotate(90deg) translate(-10px, 0px);
	}

	.menu-button-expand:before,
	.menu-button-expand:after,
	.menu-button-expand > div {
		height: 16px;
	}

	.menu-is-expanded .menu-button-expand:before {
		transform: rotate(45deg) translate(-7px, -7px);
		height: 17.5px;
	}

	.menu-is-expanded .menu-button-expand > div {
		transform: rotate(135deg) translate(-21px, -8px);
	}

	.menu-is-expanded .menu-button-expand:after {
		height: 0;
		transform: rotate(90deg) translate(0px, 0px);
	}

	.menu-button:last-child {
		margin-right: 0;
	}

	.menu-button-counter,
	.menu-button-expand {
		width: 40px;
		font-size: 65%;
		letter-spacing: -.4px;
	}

	.menu-button-counter {
		text-align: right;
	}

	.menu-button-navigation {
		padding-top: 18px;
		box-sizing: border-box;
	}

	.menu-title {
		font-weight: 800;
		letter-spacing: -.6px;
		width: 95px;
		font-size: 90%;
	}

	.menu-category {
		font-size: 75%;
	}

	.postits-wrapper {
		flex-flow: row wrap;
		display: flex;
		position: relative;
	}

	.postits-group {
		display: flex;
	}

	#wrapper {
		width: 3366px;
		height: 1700px;
		user-select: none;
		padding: 50vh 42vw 42vh 50vw;
		transition: ease-in 0.2s;
	}

	.wrapper-theme-0 {

		background-color: var(--primary-color);
		background: linear-gradient(
				180deg,
				var(--primary-color) 0%,
				var(--secondary-color) 10.45%,
				var(--tertiary-color) 41.35%
		);
	}

	.wrapper-theme-1 {

		background-color: #545D62;
		background: #545D62;
	}

	.ar-iframe-container {

		filter: drop-shadow(20px 18px 7px rgba(0, 0, 0, .4));
		z-index: 2;
		position: absolute;
		top: 25.5em;
		left: 40em;
		transition: 0.2s;
	}

	#ar-iframe {
		width: 333px;
		height: 333px;
	}

	.arrow {
		position: absolute;
		color: black;
		right: 21px;
		top: 50px;
	}

	.ar-iframe-container:hover {
		filter: drop-shadow(10px 10px 3px rgba(0, 0, 0, .2));
	}

	.body {
		font-family: Poppins;
		color: #6C808E;
	}

	.group-container {
		position: relative;
		padding-right: 20em;
	}

	.group-container:last-child {
		padding: 0;
	}

	.postits-group-column {
		display: flex;
		flex-direction: column;
	}

	.group-title {
		position: absolute;
		font-size: 4em;
		font-weight: 800;
		top: -1.6em;
		z-index: 0;
		letter-spacing: -4px;

	}

	.body.spacebar {
		cursor: grab;
	}

	.container-padding-bottom {
		padding-bottom: 17em;
	}

	.postit-individual.is-link:hover {
		z-index: 10 !important;
	}

	.loader {
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

	.hide-loader {
		opacity: 0;
		pointer-events: none;
	}

	#group-portfolio {
		top: -18em;
	}

	.wip {
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

	.capitilize {
		text-transform: capitalize;
	}

	.currently-disabled-button .menu-button-back,
	.currently-disabled-button .menu-button-forward {
		opacity: .5;
		pointer-events: none;
	}
</style>
