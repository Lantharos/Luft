<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Rover</title>
</svelte:head>

{@render children()}
