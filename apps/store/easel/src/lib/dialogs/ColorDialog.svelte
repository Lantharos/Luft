<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { untrack } from 'svelte';
	import { fromHsv, toHsv } from '#lib/raster/hsv.js';

	interface Props {
		title: string;
		color: string;
		onchoose: (color: string) => void;
		onclose: () => void;
	}

	let { title, color, onchoose, onclose }: Props = $props();

	const SWATCHES = ['#000000', '#ffffff', '#e9e4da', '#8f8f88', '#e5484d', '#f08c3a', '#f2c94c', '#4caf7a', '#2fb7b0', '#2f6fde', '#6a76f5', '#b265e0'];
	const HEX = /^#?[0-9a-f]{6}$/i;

	let hsv = $state(untrack(() => toHsv(color)));
	let hex = $derived(fromHsv(hsv));
	let typed = $state<string | null>(null);

	function track(node: HTMLElement, update: (x: number, y: number) => void) {
		const handle = (event: PointerEvent) => {
			const rect = node.getBoundingClientRect();
			update(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)), Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)));
		};
		node.addEventListener('pointerdown', (event) => {
			node.setPointerCapture(event.pointerId);
			handle(event);
		});
		node.addEventListener('pointermove', (event) => node.hasPointerCapture(event.pointerId) && handle(event));
	}

	function type(value: string) {
		typed = value;
		if (HEX.test(value)) hsv = toHsv(value.startsWith('#') ? value : `#${value}`);
	}
</script>

<Dialog {title} {onclose}>
	<div class="flex flex-col gap-4">
		<div
			class="square"
			style:--hue={`hsl(${hsv.h} 100% 50%)`}
			role="slider"
			tabindex="0"
			aria-label={t('easel-color-shade')}
			aria-valuenow={Math.round(hsv.s * 100)}
			{@attach (node) => track(node, (x, y) => (hsv = { ...hsv, s: x, v: 1 - y }))}
		>
			<span class="knob" style:left="{hsv.s * 100}%" style:top="{(1 - hsv.v) * 100}%" style:background={hex}></span>
		</div>
		<div class="hue" role="slider" tabindex="0" aria-label={t('easel-color-hue')} aria-valuenow={Math.round(hsv.h)} {@attach (node) => track(node, (x) => (hsv = { ...hsv, h: x * 359.9 }))}>
			<span class="knob" style:left="{(hsv.h / 360) * 100}%" style:top="50%" style:background={`hsl(${hsv.h} 100% 50%)`}></span>
		</div>
		<div class="flex items-center gap-3">
			<span class="size-9 flex-none rounded-full" style:background={hex}></span>
			<input
				class="text-field font-mono"
				aria-label={t('easel-color-hex')}
				value={typed ?? hex}
				oninput={(event) => type(event.currentTarget.value)}
				onblur={() => (typed = null)}
				spellcheck="false"
			/>
		</div>
		<div class="grid grid-cols-12 gap-1.5">
			{#each SWATCHES as swatch (swatch)}
				<button type="button" class="swatch" style:background={swatch} aria-label={swatch} onclick={() => (hsv = toHsv(swatch))}></button>
			{/each}
		</div>
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={onclose}>{t('easel-cancel')}</button>
		<button
			type="button"
			class="button primary"
			onclick={() => {
				onchoose(hex);
				onclose();
			}}>{t('easel-color-use')}</button
		>
	{/snippet}
</Dialog>

<style>
	.square {
		position: relative;
		height: 180px;
		border-radius: 14px;
		background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, var(--hue));
		touch-action: none;
		cursor: crosshair;
	}

	.hue {
		position: relative;
		height: 14px;
		border-radius: var(--radius-pill);
		background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
		touch-action: none;
	}

	.knob {
		position: absolute;
		width: 18px;
		height: 18px;
		margin: -9px 0 0 -9px;
		border-radius: var(--radius-pill);
		box-shadow: 0 0 0 2.5px #fff, 0 1px 4px rgba(0, 0, 0, 0.45);
		pointer-events: none;
	}

	.swatch {
		aspect-ratio: 1;
		border-radius: var(--radius-pill);
		box-shadow: inset 0 0 0 1px var(--hairline);
	}
</style>
