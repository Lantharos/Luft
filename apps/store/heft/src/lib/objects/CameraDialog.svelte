<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText } from '@luft/ui';
	import { cameraFrame, closeCamera, openCamera } from './camera';

	let { onphoto, onclose }: { onphoto: (bytes: Uint8Array) => void; onclose: () => void } = $props();

	let canvas: HTMLCanvasElement;
	let phase: 'opening' | 'live' | 'refused' | 'failed' = $state('opening');
	let problem = $state('');

	$effect(() => {
		let alive = true;
		const show = async () => {
			while (alive) {
				const frame = await cameraFrame();
				if (frame && alive) draw(frame);
				await new Promise(requestAnimationFrame);
			}
		};
		openCamera().then(
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
			void closeCamera();
		};
	});

	function draw(frame: ImageBitmap | ImageData) {
		if (canvas.width !== frame.width || canvas.height !== frame.height) {
			canvas.width = frame.width;
			canvas.height = frame.height;
		}
		const context = canvas.getContext('2d')!;
		if (frame instanceof ImageData) context.putImageData(frame, 0, 0);
		else {
			context.drawImage(frame, 0, 0);
			frame.close();
		}
	}

	async function take() {
		const blob = await new Promise<Blob>((resolve) => canvas.toBlob((made) => resolve(made!), 'image/jpeg', 0.92));
		onphoto(new Uint8Array(await blob.arrayBuffer()));
		onclose();
	}
</script>

<Dialog title={t('camera-title')} wide {onclose}>
	<div class="stage">
		<canvas bind:this={canvas} class:hidden={phase !== 'live'}></canvas>
		{#if phase === 'opening'}
			<p class="note">{t('camera-opening')}</p>
		{:else if phase === 'refused'}
			<p class="note">{t('camera-refused')}</p>
		{:else if phase === 'failed'}
			<p class="note">{t('camera-failed', { error: problem })}</p>
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="button" class="button primary" disabled={phase !== 'live'} onclick={() => void take()}>{t('camera-take')}</button>
	{/snippet}
</Dialog>

<style>
	.stage {
		display: grid;
		height: min(56vh, 460px);
		place-items: center;
		overflow: hidden;
		border-radius: 14px;
		background: var(--control);
	}

	canvas {
		max-height: 100%;
		max-width: 100%;
	}

	.note {
		max-width: 340px;
		padding: 16px;
		text-align: center;
		font-size: 13px;
		color: var(--text-soft);
	}
</style>
