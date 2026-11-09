<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { cameraFrame } from '#lib/app/flatbed.svelte.js';

	let { onclose }: { onclose: () => void } = $props();

	/** How quickly the outline follows the paper; lower is steadier. */
	const FOLLOW = 0.35;

	let canvas: HTMLCanvasElement;
	let phase: 'opening' | 'live' | 'refused' | 'failed' = $state('opening');
	let problem = $state('');
	let size = $state({ width: 0, height: 0 });
	let corners = $state<number[] | null>(null);
	let taken = $state(0);
	let taking = $state(false);
	let flash = $state(false);

	$effect(() => {
		let alive = true;
		const show = async () => {
			while (alive) {
				const latest = await cameraFrame();
				if (latest && alive) {
					draw(latest.frame);
					follow(latest.corners);
				}
				await new Promise(requestAnimationFrame);
			}
		};
		commands.cameraOpen().then(
			(allowed) => {
				phase = allowed ? 'live' : 'refused';
				if (allowed && alive) void show();
			},
			(error) => {
				phase = 'failed';
				problem = errorText(error);
			}
		);
		return () => {
			alive = false;
			void commands.cameraClose();
		};
	});

	function draw(frame: ImageBitmap | ImageData) {
		if (canvas.width !== frame.width || canvas.height !== frame.height) {
			canvas.width = frame.width;
			canvas.height = frame.height;
			size = { width: frame.width, height: frame.height };
		}
		const context = canvas.getContext('2d')!;
		if (frame instanceof ImageData) context.putImageData(frame, 0, 0);
		else {
			context.drawImage(frame, 0, 0);
			frame.close();
		}
	}

	function follow(found: number[] | null) {
		if (!found) {
			corners = null;
			return;
		}
		corners = corners ? corners.map((value, index) => value + (found[index] - value) * FOLLOW) : found;
	}

	async function take() {
		taking = true;
		flash = true;
		setTimeout(() => (flash = false), 180);
		try {
			await commands.cameraCapture();
			taken += 1;
		} catch (error) {
			problem = errorText(error);
		} finally {
			taking = false;
		}
	}

	let outline = $derived(corners ? [0, 1, 2, 3].map((index) => `${corners![index * 2] * size.width},${corners![index * 2 + 1] * size.height}`).join(' ') : '');
</script>

<Dialog title={t('camera-title')} description={phase === 'live' ? t('camera-description') : undefined} wide {onclose}>
	<div class="stage">
		<div class="view" class:hidden={phase !== 'live'}>
			<canvas bind:this={canvas}></canvas>
			{#if outline}
				<svg viewBox="0 0 {size.width} {size.height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
					<polygon points={outline} />
				</svg>
			{/if}
			<div class="flash" class:on={flash}></div>
		</div>
		{#if phase === 'opening'}
			<p class="note">{t('camera-opening')}</p>
		{:else if phase === 'refused'}
			<p class="note">{t('camera-refused')}</p>
		{:else if phase === 'failed'}
			<p class="note">{t('camera-failed', { reason: problem })}</p>
		{/if}
	</div>
	{#snippet actions()}
		{#if taken}
			<p class="mr-auto text-[13px] text-[var(--text-soft)]">{t('camera-taken', { count: taken })}</p>
		{/if}
		<button type="button" class="button" onclick={onclose}>{taken ? t('dialog-done') : t('dialog-cancel')}</button>
		<button type="button" class="button primary" disabled={phase !== 'live' || taking} onclick={() => void take()}>{t('camera-take')}</button>
	{/snippet}
</Dialog>

<style>
	.stage {
		display: grid;
		height: min(60vh, 520px);
		place-items: center;
		overflow: hidden;
		border-radius: 14px;
		background: var(--control);
	}

	.view {
		position: relative;
		display: grid;
		max-height: 100%;
		max-width: 100%;
	}

	.view.hidden {
		display: none;
	}

	canvas,
	svg {
		grid-area: 1 / 1;
		max-height: min(60vh, 520px);
		max-width: 100%;
	}

	svg {
		height: 100%;
		width: 100%;
	}

	polygon {
		fill: color-mix(in oklab, var(--accent) 16%, transparent);
		stroke: var(--accent);
		stroke-width: 3;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}

	.flash {
		grid-area: 1 / 1;
		background: #fff;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.18s ease-out;
	}

	.flash.on {
		opacity: 0.6;
		transition: none;
	}

	.note {
		max-width: 360px;
		padding: 16px;
		text-align: center;
		font-size: 13px;
		color: var(--text-soft);
	}
</style>
