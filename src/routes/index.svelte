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

	let currentTheme = 0
	let currentUrl = ''

	let postItsData = postItsDB;

	onMount(() => {
		currentUrl = window.location.href;
		isMounted = true;
	});

</script>
<div class="body">
	<div class="loader" class:hide-loader={isMounted}></div>
	<div class="logo">
		<Logo/>
	</div>

	<div id="wrapper"
		 class="wrapper-theme-{currentTheme}">


		<div class="postits-wrapper">


			<div class="ar-iframe-container">
				<span class="arrow blink_5s">⬆</span>

				<iframe title="ar-iframe" id="ar-iframe"
						src="https://app.vectary.com/viewer/v1/?model=4f7b7d5a-0875-4293-bbb6-1157a34bd36a&env=studio3&turntable=-3"
						frameborder="0" width="100%" height="480"></iframe>

			</div>


			{#each postItsData as postItData, i}
				<div id="group-{postItData.id}" class="group-container">

					<div class="group-title">
						{postItData.id}
					</div>
					<div class="postits-group">
						{#each postItData.postItGroups as postItGroup}
							<div class="postits-group-column">
								{#each postItGroup as postIt, j (postIt.id)}
									<div class="postit-individual {postIt.href ? 'is-link' : ''}">
										<Postit postData={postIt}
												currentUrl={currentUrl}
												currentTheme={currentTheme}/>
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
		width: 10vh;
		cursor: pointer;
		transition: 0.2s;
		opacity: 0.5;
	}

	.logo:hover {
		opacity: 1;
	}

	.postits-wrapper {
		display: flex;
		flex-direction: column;
	}

	.postits-group {
		display: flex;
		flex-wrap: wrap;
	}

	#wrapper {
		user-select: none;
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
		transition: 0.2s;
	}

	#ar-iframe {
		width: 333px;
		height: 333px;
	}

	.arrow {
		color: black;
	}

	.ar-iframe-container:hover {
		filter: drop-shadow(10px 10px 3px rgba(0, 0, 0, .2));
	}

	.body {
		font-family: Poppins;
		color: #6C808E;
	}

	.group-container {
		padding-bottom: 4em;
	}

	.postits-group-column {
		display: flex;
		flex-direction: column;
	}

	.group-title {
		font-size: 4em;
		font-weight: 800;
		letter-spacing: -4px;

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
