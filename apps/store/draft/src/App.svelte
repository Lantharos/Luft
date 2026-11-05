<script lang="ts">
	import { App } from '#lib/app/app.svelte.js';
	import Shell from '#lib/components/Shell.svelte';

	const app = new App();
	void app.start();
</script>

<Shell {app} />
