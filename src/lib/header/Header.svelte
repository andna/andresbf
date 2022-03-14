<script>
	import { page } from '$app/stores';
</script>

<header>

	<nav>
		<ul>
			<li class:active={$page.url.pathname === '/'}><a sveltekit:prefetch href="/">Home</a></li>
			<li class:active={$page.url.pathname === '/print'}><a sveltekit:prefetch href="/wip">WIP</a></li>
		</ul>
	</nav>

</header>

<style>
	header {
		position: fixed;
		bottom:0;
	}
</style>
