<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import AppWindow from '@lucide/svelte/icons/app-window';
	import { appearance, type AppIconStyle } from '../appearance.svelte';
	import { appIconLook, FITTED_PLATE } from './iconStyle';

	interface Props {
		icon: string | null;
		id?: string;
		size?: number;
		style?: AppIconStyle;
	}

	let { icon, id, size = 32, style }: Props = $props();
	let broken = $state(false);
	let missingGlyph = $state<string | null>(null);

	const source = $derived(icon?.startsWith('http') ? icon : icon && fileUrl(icon));
	const icons = $derived(appearance.appIcons);
	const requested = $derived(style ?? icons?.style ?? 'default');
	const look = $derived(appIconLook(id, requested));
	const box = $derived(Math.round(size * FITTED_PLATE));
	const paint = $derived(icons && (look === 'tinted' || look === 'clear') ? icons[look] : null);
	const glyphUrl = $derived(icons && id && look !== 'default' ? fileUrl(`${icons.glyphs}/${id.replace(/\.desktop$/, '')}.png`) : null);
	const glyph = $derived(glyphUrl && glyphUrl !== missingGlyph ? `url("${glyphUrl}")` : null);

	$effect(() => {
		const url = glyphUrl;
		if (!url) return;
		const probe = new Image();
		probe.onerror = () => (missingGlyph = url);
		probe.src = url;
	});
</script>

{#if look === 'plain' && glyph}
	<span class="glyph bare" style:width="{box}px" style:height="{box}px" style:margin="{(size - box) / 2}px" style:--glyph={glyph}>
		<span class="shade"></span>
		<span class="ink"></span>
	</span>
{:else if paint && glyph}
	<span
		class="glyph plated"
		class:rim={paint.rim > 0}
		style:width="{size}px"
		style:height="{size}px"
		style:--plate={paint.plate}
		style:--glyph-ink={paint.ink}
		style:--glyph-shade={paint.shade}
		style:--rim-top="rgb(255 255 255 / {paint.rim})"
		style:--rim-middle="rgb(255 255 255 / {paint.rim / 4})"
		style:--glyph={glyph}
	>
		<span class="shade"></span>
		<span class="ink"></span>
	</span>
{:else if source && !broken}
	<img src={source} alt="" width={size} height={size} loading="lazy" decoding="async" style:width="{size}px" style:height="{size}px" onerror={() => (broken = true)} />
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

	.glyph {
		position: relative;
		display: block;
		flex: none;
	}

	.bare {
		--glyph-ink: currentColor;
		--glyph-shade: color-mix(in srgb, currentColor 50%, transparent);
		--glyph-box: 100%;
	}

	.plated {
		--glyph-box: 64%;
		border-radius: 22.5%;
		background: var(--plate);
	}

	.shade,
	.ink {
		position: absolute;
		inset: 0;
		mask: var(--glyph) center / var(--glyph-box) no-repeat;
	}

	.shade {
		background: var(--glyph-shade);
	}

	.ink {
		background: var(--glyph-ink);
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
