<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import AppWindow from '@lucide/svelte/icons/app-window';
	import { appearance, type AppIconStyle } from '../appearance.svelte';

	interface Props {
		icon: string | null;
		id?: string;
		size?: number;
		style?: AppIconStyle;
	}

	let { icon, id, size = 32, style }: Props = $props();
	let broken = $state(false);

	const icons = $derived(appearance.appIcons);
	const chosen = $derived(style ?? icons?.style ?? 'default');
	const paint = $derived(icons && id && chosen !== 'default' ? icons[chosen] : null);
	const glyph = $derived(icons && id ? `url("${fileUrl(`${icons.glyphs}/${id.replace(/\.desktop$/, '')}.png`)}")` : null);
</script>

{#if paint && glyph}
	<span
		class="styled"
		class:rim={paint.rim > 0}
		style:width="{size}px"
		style:height="{size}px"
		style:--plate={paint.plate}
		style:--ink={paint.ink}
		style:--shade={paint.shade}
		style:--rim-top="rgb(255 255 255 / {paint.rim})"
		style:--rim-middle="rgb(255 255 255 / {paint.rim / 4})"
		style:--glyph={glyph}
	>
		<span class="shade"></span>
		<span class="ink"></span>
	</span>
{:else if icon && !broken}
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

	.styled {
		position: relative;
		display: block;
		flex: none;
		border-radius: 22.5%;
		background: var(--plate);
	}

	.shade,
	.ink {
		position: absolute;
		inset: 0;
		mask: var(--glyph) center / contain no-repeat;
	}

	.shade {
		background: var(--shade);
	}

	.ink {
		background: var(--ink);
		mask-mode: luminance;
	}

	.rim::after {
		position: absolute;
		inset: 0;
		padding: 1px;
		border-radius: inherit;
		background: linear-gradient(var(--rim-top), var(--rim-middle) 50%, transparent);
		content: '';
		mask:
			linear-gradient(#000 0 0) content-box exclude,
			linear-gradient(#000 0 0);
	}
</style>
