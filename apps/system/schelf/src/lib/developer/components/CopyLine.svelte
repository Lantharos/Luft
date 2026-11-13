<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import { IconButton } from '@luft/ui';

	const COPIED_MS = 1600;

	let { text, label }: { text: string; label: string } = $props();
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		await navigator.clipboard.writeText(text);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), COPIED_MS);
	}
</script>

<div class="line">
	<code class="min-w-0 flex-1 truncate">{text}</code>
	<IconButton icon={copied ? Check : Copy} label={copied ? 'Copied' : label} onclick={copy} />
</div>

<style>
	.line {
		display: flex;
		align-items: center;
		gap: 8px;
		border-radius: 12px;
		background: var(--control);
		padding: 4px 4px 4px 14px;
	}

	code {
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--text-soft);
	}
</style>
