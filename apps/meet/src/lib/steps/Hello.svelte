<script lang="ts">
	import { session } from '#lib/state/meet.svelte.js';
</script>

<section class="flex h-full flex-col justify-end px-14 pb-14">
	<h1 class="text-[52px] leading-none font-semibold tracking-[-0.02em]">Meet Luft</h1>
	<p class="mt-5 max-w-[470px] text-[17px] leading-relaxed text-[var(--text-soft)]">
		Luft can live right next to Windows. Try it first without installing anything, and bring your things along when you’re ready.
	</p>
	<div class="mt-9 flex items-center gap-3">
		<button type="button" class="button primary large px-6" onclick={() => session.check()}>Check this PC</button>
		<span class="text-[13px] text-[var(--text-muted)]">Nothing changes until you say so.</span>
	</div>
</section>
