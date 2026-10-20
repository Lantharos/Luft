<script lang="ts">
	import { t } from '@luft/i18n';
	import type { Component, Snippet } from 'svelte';
	import { Row, Slider } from '@luft/ui';
	import { percent } from '#lib/format.js';

	interface Props {
		title: string;
		volume: number;
		muted: boolean;
		max: number;
		icon: Component;
		mutedIcon: Component;
		onvolume: (volume: number) => void;
		onsettle?: () => void;
		onmute: (muted: boolean) => void;
		controls?: Snippet;
		children?: Snippet;
	}

	let { title, volume, muted, max, icon: Icon, mutedIcon: MutedIcon, onvolume, onsettle, onmute, controls, children }: Props = $props();
</script>

<Row {title}>
	{@render controls?.()}
	<span class="w-11 text-right tabular-nums">{percent(volume)}</span>
	<button type="button" class="mute" class:muted aria-pressed={muted} aria-label={muted ? t('settings-sound-unmute', { name: title }) : t('settings-sound-mute', { name: title })} onclick={() => onmute(!muted)}>
		{#if muted}
			<MutedIcon size={18} />
		{:else}
			<Icon size={18} />
		{/if}
	</button>
	{#snippet below()}
		<Slider
			label={title}
			value={Math.min(volume, max)}
			{max}
			format={percent}
			disabled={muted}
			oninput={onvolume}
			onchange={(next) => {
				onvolume(next);
				onsettle?.();
			}}
		/>
		{@render children?.()}
	{/snippet}
</Row>

<style>
	.mute {
		display: grid;
		height: 32px;
		width: 32px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-soft);
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate);
	}

	.mute:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.mute.muted {
		background: var(--control);
		color: var(--text-muted);
	}
</style>
