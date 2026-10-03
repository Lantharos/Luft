<script lang="ts">
	import { onMount } from 'svelte';
	import { App } from '#lib/app.svelte.js';
	import { connect } from '#lib/bridge/index.js';
	import Shell from '#lib/components/Shell.svelte';

	let app = $state<App | null>(null);

	onMount(() => {
		void connect().then((backend) => {
			app = new App(backend);
			void app.start();
		});
	});
</script>

{#if app}
	<Shell {app} />
{/if}
