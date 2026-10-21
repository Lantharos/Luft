<script lang="ts">
	import { app } from '#lib/state/app.svelte.js';
	import AboutPage from './about/AboutPage.svelte';
	import UpdatesOverview from './updates/UpdatesOverview.svelte';
</script>

{#if app.section === 'about'}
	<AboutPage onclose={() => (app.section = null)} />
{:else}
	<UpdatesOverview onabout={() => (app.section = 'about')} />
{/if}
