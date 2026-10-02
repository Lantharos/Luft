<script lang="ts">
	import MailPlus from '@lucide/svelte/icons/mail-plus';

	interface Props {
		onadd: () => void;
	}

	let { onadd }: Props = $props();
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-5 px-10 pb-16 text-center">
	<span class="mark"><MailPlus size={30} /></span>
	<div class="flex max-w-[380px] flex-col gap-2">
		<h1 class="text-[22px] font-semibold">Your mail, without the noise</h1>
		<p class="text-[14px] leading-relaxed text-[var(--text-muted)]">
			Add an account to bring in your mail. New senders wait in the Screener, newsletters and receipts get bundled, and everything is a keystroke away.
		</p>
	</div>
	<button type="button" class="button primary large" onclick={onadd}>Add an account</button>
</div>

<style>
	.mark {
		display: grid;
		height: 68px;
		width: 68px;
		place-items: center;
		border-radius: 22px;
		background: var(--accent-soft);
		color: var(--accent);
	}
</style>
