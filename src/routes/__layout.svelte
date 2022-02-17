<script>
	import '../app.css';
</script>


<div class="pdf-iframe-container">
	<iframe class="pdf-iframe" src="https://drive.google.com/file/d/1XjziWOSzHyRlqZ8iv-W2mGXrcFQ_1mnl/preview" frameborder="0" height="100%" width="100%">
	</iframe>
</div>

<style>
	.pdf-iframe-container{
		height: 100vh;
		width: 100vw;
	}
	.pdf-iframe{
		margin: 0 auto;
	}
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
