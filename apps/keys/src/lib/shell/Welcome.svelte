<script lang="ts">
	import { app } from '#lib/state/app.svelte.js';
	import Page from './Page.svelte';
</script>

<Page title="">
	<div class="flex flex-col items-start gap-5 pt-[14vh]">
		<div class="flex max-w-[460px] flex-col gap-2">
			<h2 class="text-[26px] font-semibold">Type the way you want</h2>
			<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">
				Change what each key types, add accents and symbols where your fingers expect them, or make an input method that turns what you type into
				other scripts and words.
			</p>
		</div>
		<div class="flex gap-2">
			<button type="button" class="button primary" onclick={() => (app.creating = { kind: 'layout', from: null })}>Make a layout</button>
			<button type="button" class="button" onclick={() => (app.creating = { kind: 'method' })}>Make an input method</button>
		</div>
	</div>
</Page>
