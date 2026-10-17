<script lang="ts">
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';
</script>

<section class="flex h-full flex-col justify-end px-14 pb-14">
	<h1 class="text-[52px] leading-none font-semibold tracking-[-0.02em]">Meet Luft</h1>
	<p class="mt-5 max-w-[470px] text-[17px] leading-relaxed text-[var(--text-soft)]">
		{#if session.platform === 'linux'}
			Try Luft right from here, without a USB stick. When you like it, Luft can take this system’s place and keep your files.
		{:else}
			Luft can live right next to Windows. Try it first without installing anything, and bring your things along when you’re ready.
		{/if}
	</p>
	<div class="mt-9 flex items-center gap-3">
		<button type="button" class="button primary large px-6" onclick={() => session.check()}>
			Check this {session.platform === 'linux' ? 'computer' : 'PC'}
		</button>
		<button type="button" class="plain-button large" onclick={() => maker.open()}>Make a USB stick</button>
	</div>
</section>
