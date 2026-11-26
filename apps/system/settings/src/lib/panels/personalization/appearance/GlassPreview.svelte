<script lang="ts">
	import type { GlassStyle } from './glass.js';

	interface Props {
		style: GlassStyle;
		wallpaper: string | null;
	}

	let { style, wallpaper }: Props = $props();
</script>

<span class="preview {style}" aria-hidden="true">
	{#if wallpaper}
		<img src={wallpaper} alt="" decoding="async" />
	{/if}
	<span class="glass">
		{#if wallpaper}
			<img class="behind" src={wallpaper} alt="" decoding="async" />
		{/if}
		<span class="lightness"></span>
		<span class="tint"></span>
	</span>
</span>

<style>
	.preview {
		--glass-surface: var(--kestrel-dark-surface, #121211);
		--maris-cover: 0.8;
		--niko-lightness: #2c2c2c;
		--niko-luminosity: 0.96;
		--niko-tint: 0.15;
		position: relative;
		display: block;
		width: 30px;
		height: 20px;
		flex: none;
		overflow: hidden;
		border-radius: 6px;
		background: var(--control);
	}

	:global(:root[data-scheme='light']) .preview {
		--glass-surface: var(--kestrel-light-surface, #fbfbf9);
		--maris-cover: 0.5;
		--niko-lightness: var(--glass-surface);
		--niko-luminosity: 0.85;
		--niko-tint: 0;
	}

	img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.glass {
		position: absolute;
		inset: 40% 0 0;
		overflow: hidden;
		isolation: isolate;
	}

	.behind {
		top: auto;
		height: calc(100% / 0.6);
		transform: scale(1.25);
	}

	.lightness,
	.tint {
		position: absolute;
		inset: 0;
	}

	.luca .behind {
		filter: blur(2px);
	}

	.luca .tint,
	.vesa .tint {
		background: var(--sidebar-glass);
	}

	.vesa .behind {
		filter: blur(0.5px);
	}

	.vesa .tint {
		box-shadow: inset 1px 1px 3px rgb(255 255 255 / 0.3);
	}

	.maris .behind {
		filter: blur(6px);
	}

	.maris .lightness {
		background: var(--glass-surface);
		mix-blend-mode: luminosity;
	}

	.maris .tint {
		background: var(--glass-surface);
		opacity: var(--maris-cover);
	}

	.niko .behind {
		filter: blur(3px);
	}

	.niko .lightness {
		background: var(--niko-lightness);
		mix-blend-mode: luminosity;
		opacity: var(--niko-luminosity);
	}

	.niko .tint {
		background: var(--glass-surface);
		mix-blend-mode: color;
		opacity: var(--niko-tint);
	}
</style>
