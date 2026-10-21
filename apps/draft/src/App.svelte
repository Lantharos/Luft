<script lang="ts">
	import { App } from '#lib/app/app.svelte.js';
	import { backend } from '#lib/bridge/index.js';
	import Shell from '#lib/components/Shell.svelte';

	const app = new App(backend);
	void app.start();
</script>

<Shell {app} />
