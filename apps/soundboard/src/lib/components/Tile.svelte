<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import { commands } from '#lib/bindings.js';
	import type { Sound } from '#lib/bindings.js';
	import { ICONS, COLORS } from '#lib/sounds/looks.js';
	import { app } from '#lib/state/app.svelte.js';

	const RATE = 48000;
	const SIDE_BUTTON = 2;

	interface Props {
		sound: Sound;
		onmenu: (at: { x: number; y: number }) => void;
	}

	let { sound, onmenu }: Props = $props();

	let playing = $derived(app.status.playing.includes(sound.id));
	let keys = $derived(app.keysOf(sound));
	let seconds = $derived((sound.trimEnd - sound.trimStart) / RATE);
	let color = $derived(COLORS[sound.color] ?? COLORS.sand);
	let Icon = $derived(sound.look.kind === 'icon' ? ICONS[sound.look.value] : null);

	const held = () => sound.trigger === 'hold';

	function down(event: PointerEvent) {
		if (event.button === SIDE_BUTTON) return;
		void commands.press({ sound: sound.id, preview: false });
	}

	function up() {
		if (held()) void commands.release({ sound: sound.id });
	}

	function key(event: KeyboardEvent) {
		if ((event.key !== 'Enter' && event.key !== ' ') || event.repeat) return;
		event.preventDefault();
		void commands.press({ sound: sound.id, preview: false });
	}

	function keyUp(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') up();
	}

	function menu(event: MouseEvent) {
		event.preventDefault();
		onmenu({ x: event.clientX, y: event.clientY });
	}
</script>

<button
	type="button"
	class="tile"
	class:playing
	style:--tile={color}
	aria-pressed={playing}
	onpointerdown={down}
	onpointerup={up}
	onpointerleave={() => playing && up()}
	onkeydown={key}
	onkeyup={keyUp}
	oncontextmenu={menu}
>
	{#if sound.look.kind === 'picture'}
		<img src={fileUrl(`${app.soundsFolder}/${sound.look.value}`)} alt="" draggable="false" />
	{/if}
	<span class="glyph">
		{#if sound.look.kind === 'emoji'}{sound.look.value}{:else if Icon}<Icon size={26} />{/if}
	</span>
	<span class="name">{sound.name}</span>
	{#if keys}<span class="keys">{keys}</span>{/if}
	{#if playing}
		<span class="progress" class:looping={sound.looping} style:animation-duration="{seconds}s"></span>
	{/if}
</button>

<style>
	.tile {
		position: relative;
		display: flex;
		aspect-ratio: 4 / 3;
		flex-direction: column;
		justify-content: flex-end;
		gap: 2px;
		overflow: hidden;
		border-radius: var(--radius-group);
		padding: 12px;
		text-align: left;
		color: var(--text);
		background: color-mix(in oklab, var(--tile) 30%, var(--content));
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			transform var(--motion-tap) var(--ease-decelerate);
	}

	.tile:hover {
		background: color-mix(in oklab, var(--tile) 42%, var(--content));
	}

	.tile:active {
		transform: scale(0.97);
	}

	.tile.playing {
		background: color-mix(in oklab, var(--tile) 62%, var(--content));
	}

	img {
		position: absolute;
		inset: 0;
		height: 100%;
		width: 100%;
		object-fit: cover;
		opacity: 0.55;
	}

	.glyph {
		position: relative;
		flex: 1;
		font-size: 26px;
		line-height: 1;
	}

	.name {
		position: relative;
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.25;
		overflow-wrap: anywhere;
	}

	.keys {
		position: relative;
		font-size: 12px;
		color: var(--text-muted);
	}

	.progress {
		position: absolute;
		inset: auto 0 0;
		height: 3px;
		background: var(--tile);
		transform-origin: left;
		animation: play linear forwards;
	}

	.progress.looping {
		animation-iteration-count: infinite;
	}

	@keyframes play {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}
</style>
