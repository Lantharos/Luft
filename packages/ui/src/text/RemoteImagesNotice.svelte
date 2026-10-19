<script lang="ts">
	import ImageOff from '@lucide/svelte/icons/image-off';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		class?: ClassValue;
		onshow: () => void;
	}

	let { class: className, onshow }: Props = $props();
</script>

<div class={['remote-images', className]}>
	<ImageOff size={15} class="flex-none" />
	<span class="min-w-0 flex-1 truncate">Pictures from the web are hidden</span>
	<button type="button" class="plain-button" onclick={onshow}>Show</button>
</div>

<style>
	.remote-images {
		display: flex;
		align-items: center;
		gap: 8px;
		border-radius: 12px;
		background: var(--surface);
		padding: 4px 4px 4px 12px;
		font-size: 12.5px;
		color: var(--text-muted);
	}

	.plain-button {
		min-height: 28px;
		padding-inline: 10px;
		font-size: 12.5px;
	}
</style>
