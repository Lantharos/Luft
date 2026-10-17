<script lang="ts">
	import { maker } from '#lib/state/stick.svelte.js';

	let made = $derived(maker.made);
</script>

<section class="flex h-full flex-col justify-end px-14 pb-14">
	<h1 class="text-[40px] leading-none font-semibold tracking-[-0.01em]">
		{made?.ventoy ? 'Luft is on your Ventoy stick' : 'Your Luft stick is ready'}
	</h1>
	<p class="mt-5 max-w-[500px] text-[16px] leading-relaxed text-[var(--text-soft)]">
		{made?.ejected ? 'You can take it out now.' : 'Eject it before you take it out.'}
		To start from it, plug it in and choose it in the computer’s start menu, which opens with a key like F12, F8 or Esc right after switching on.
	</p>
	{#if made?.ventoy}
		<p class="mt-3 max-w-[500px] text-[14px] leading-relaxed text-[var(--text-muted)]">
			With Secure Boot on, Ventoy asks once to enroll its own key the first time it starts.
		</p>
	{/if}
	<div class="mt-9 flex gap-3">
		<button type="button" class="button primary large px-6" onclick={() => maker.back()}>Done</button>
		<button type="button" class="button large px-6" onclick={() => maker.open()}>Make another</button>
	</div>
</section>
