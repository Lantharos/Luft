<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import AppWindow from '@lucide/svelte/icons/app-window';

	interface Props {
		icon: string | null;
		size?: number;
	}

	let { icon, size = 32 }: Props = $props();
	let broken = $state(false);
</script>

{#if icon && !broken}
	<img src={fileUrl(icon)} alt="" width={size} height={size} loading="lazy" decoding="async" style:width="{size}px" style:height="{size}px" onerror={() => (broken = true)} />
{:else}
	<span class="fallback" style:width="{size}px" style:height="{size}px">
		<AppWindow size={size * 0.55} />
	</span>
{/if}

<style>
	img {
		flex: none;
		object-fit: contain;
	}

	.fallback {
		display: grid;
		flex: none;
		place-items: center;
		border-radius: 28%;
		background: var(--control);
		color: var(--text-muted);
	}
</style>
