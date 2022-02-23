<script>
	import { page } from '$app/stores';
	import logo from './svelte-logo.svg';
</script>

<header style="position:fixed; bottom: 0; z-index: 1;">
	<nav>
		<ul>
			<li class:active={$page.url.pathname === '/'}><a sveltekit:prefetch href="/">Home</a></li>
			<li class:active={$page.url.pathname === '/wip'}>
				<a sveltekit:prefetch href="/wip">WIP</a>
			</li>
		</ul>
	</nav>

</header>
