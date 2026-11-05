<script lang="ts">
	import { t } from '@luft/i18n';
	import { commands } from '#lib/bindings.js';
	import { session } from '#lib/state/session.svelte.js';

	interface Props {
		over: boolean;
	}

	let { over }: Props = $props();

	async function chooseFiles() {
		await session.open(await commands.chooseFiles());
	}

	async function chooseFolder() {
		await session.open(await commands.chooseFolder());
	}
</script>

<section class="drop" class:over aria-label={t('home-drop')}>
	<svg class="mark" viewBox="0 0 96 96" aria-hidden="true">
		<path d="M20 38a30 30 0 0 1 54-14l7-8 3 29-29-3 9-8a19 19 0 0 0-34 8z" />
		<path class="second" d="M76 58a30 30 0 0 1-54 14l-7 8-3-29 29 3-9 8a19 19 0 0 0 34-8z" />
	</svg>
	<h1>{t('home-title')}</h1>
	<p>{t('home-body')}</p>
	<div class="mt-5 flex gap-2">
		<button type="button" class="button primary" onclick={chooseFiles}>{t('home-choose-files')}</button>
		<button type="button" class="button" onclick={chooseFolder}>{t('home-choose-folder')}</button>
	</div>
</section>

<style>
	.drop {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 0 12px 12px;
		padding: 24px;
		border-radius: var(--radius-group);
		text-align: center;
		transition: background-color 160ms ease;
	}

	.drop.over {
		background: var(--accent-soft);
	}

	.mark {
		width: 72px;
		height: 72px;
		margin-bottom: 18px;
		fill: var(--text);
		transition: transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.drop.over .mark {
		transform: rotate(90deg);
	}

	.mark .second {
		fill: var(--text-muted);
	}

	h1 {
		font-size: 26px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	p {
		max-width: 420px;
		margin-top: 8px;
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-soft);
	}
</style>
