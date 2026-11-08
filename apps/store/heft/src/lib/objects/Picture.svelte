<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import Crop from '@lucide/svelte/icons/crop';
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import { WHOLE, type PageObject } from '#lib/page/objects.js';

	let {
		object,
		zoom,
		assets,
		arranging,
		ongrab,
		onmove,
		ondrop,
		oncrop
	}: {
		object: PageObject;
		zoom: number;
		assets: string;
		arranging: boolean;
		ongrab: (event: PointerEvent, resize: boolean) => void;
		onmove: (event: PointerEvent) => void;
		ondrop: (event: PointerEvent) => void;
		oncrop: () => void;
	} = $props();

	let crop = $derived(object.crop ?? WHOLE);
</script>

<div
	class="picture"
	class:arranging
	role="img"
	style:left="{object.x * zoom}px"
	style:top="{object.y * zoom}px"
	style:width="{object.width * zoom}px"
	style:height="{object.height * zoom}px"
	onpointerdown={(event) => ongrab(event, false)}
	onpointermove={onmove}
	onpointerup={ondrop}
>
	<span class="frame">
		<img
			src={fileUrl(`${assets}/${object.asset}`)}
			alt=""
			draggable="false"
			style:width="{100 / crop.width}%"
			style:height="{100 / crop.height}%"
			style:left="{(-crop.x / crop.width) * 100}%"
			style:top="{(-crop.y / crop.height) * 100}%"
		/>
	</span>
	{#if arranging}
		<button
			type="button"
			class="crop"
			aria-label={t('picture-crop')}
			{@attach tooltip(t('picture-crop'))}
			onpointerdown={(event) => event.stopPropagation()}
			onclick={oncrop}
		>
			<Crop size={15} />
		</button>
		<span class="corner" role="presentation" onpointerdown={(event) => ongrab(event, true)}></span>
	{/if}
</div>

<style>
	.picture {
		position: absolute;
	}

	.frame {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	.frame img {
		position: absolute;
		max-width: none;
	}

	.picture.arranging {
		pointer-events: auto;
		cursor: move;
		outline: 1.5px dashed #3d7bd9;
		touch-action: none;
	}

	.crop {
		position: absolute;
		left: 6px;
		top: 6px;
		display: grid;
		height: 30px;
		width: 30px;
		place-items: center;
		border-radius: var(--radius-pill);
		background: var(--popover);
		color: var(--text);
		box-shadow: 0 4px 14px var(--shadow-soft);
	}

	:global([data-posture='tablet']) .crop {
		height: 42px;
		width: 42px;
	}

	.corner {
		position: absolute;
		right: -9px;
		bottom: -9px;
		height: 18px;
		width: 18px;
		border-radius: var(--radius-pill);
		background: white;
		box-shadow: 0 0 0 1.5px #3d7bd9;
		cursor: nwse-resize;
	}
</style>
