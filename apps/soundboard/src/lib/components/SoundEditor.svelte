<script lang="ts">
	import Play from '@lucide/svelte/icons/play';
	import { untrack } from 'svelte';
	import { Dialog, Row, Segmented, Slider, Switch, TextField } from '@luft/ui';
	import { t } from '@luft/i18n';
	import { commands } from '#lib/bindings.js';
	import type { Look, Sound, Trigger } from '#lib/bindings.js';
	import { COLORS, ICONS } from '#lib/sounds/looks.js';
	import { app } from '#lib/state/app.svelte.js';
	import Waveform from './Waveform.svelte';

	interface Props {
		sound: Sound;
		onclose: () => void;
	}

	let { sound, onclose }: Props = $props();

	const opened = untrack(() => $state.snapshot(sound));
	let draft = $state<Sound>(opened);
	let emoji = $state(opened.look.kind === 'emoji' ? opened.look.value : '');
	let lookTab = $state<Look['kind']>(opened.look.kind);
	let keys = $derived(app.keysOf(sound));

	const lookOptions = $derived([
		{ value: 'plain', label: t('editor-look-none') },
		{ value: 'emoji', label: t('editor-look-emoji') },
		{ value: 'icon', label: t('editor-look-icon') },
		{ value: 'picture', label: t('editor-look-picture') }
	] as const);
	const triggerOptions = $derived([
		{ value: 'press', label: t('editor-trigger-press') },
		{ value: 'hold', label: t('editor-trigger-hold') }
	] as const);

	function lookOf(kind: Look['kind']): Look {
		if (kind === 'emoji') return { kind, value: emoji };
		if (kind === 'icon') return { kind, value: Object.keys(ICONS)[0] };
		return { kind: 'plain' };
	}

	function chooseLook(kind: Look['kind']) {
		lookTab = kind;
		if (kind !== 'picture') draft.look = lookOf(kind);
	}

	async function choosePicture() {
		await app.save($state.snapshot(draft));
		app.library = await commands.choosePicture({ sound: sound.id, title: t('editor-picture-choose'), filter: t('editor-picture-kind') }, { timeoutMs: 86_400_000 });
		const saved = app.library.boards.flatMap((board) => board.sounds).find((other) => other.id === sound.id);
		if (saved) draft.look = saved.look;
	}

	async function preview() {
		await app.save($state.snapshot(draft));
		void commands.press({ sound: sound.id, preview: true });
	}

	async function save() {
		await app.save({ ...$state.snapshot(draft), look: draft.look.kind === 'emoji' ? { kind: 'emoji', value: emoji } : $state.snapshot(draft.look) });
		onclose();
	}

	function changeHotkey() {
		void commands.configureHotkeys().catch(app.failed);
	}
</script>

<Dialog title={t('editor-title')} wide {onclose}>
	<div class="flex flex-col gap-4">
		<TextField bind:value={draft.name} label={t('editor-name')} showLabel />

		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<h3 class="text-[13px] font-medium">{t('editor-trim')}</h3>
				<button type="button" class="button" onclick={() => void preview()}><Play size={14} />{t('editor-preview')}</button>
			</div>
			<Waveform
				sound={sound.id}
				frames={sound.frames}
				start={draft.trimStart}
				end={draft.trimEnd}
				onchange={(start, end) => {
					draft.trimStart = start;
					draft.trimEnd = end;
				}}
			/>
		</div>

		<div class="flex flex-col gap-2">
			<h3 class="text-[13px] font-medium">{t('editor-look')}</h3>
			<Segmented options={[...lookOptions]} value={lookTab} label={t('editor-look')} onchange={chooseLook} />
			{#if lookTab === 'emoji'}
				<TextField bind:value={emoji} label={t('editor-emoji')} />
			{:else if lookTab === 'icon' && draft.look.kind === 'icon'}
				<div class="flex flex-wrap gap-1.5">
					{#each Object.entries(ICONS) as [name, Icon] (name)}
						<button
							type="button"
							class="swatch"
							class:chosen={draft.look.value === name}
							aria-label={name}
							aria-pressed={draft.look.value === name}
							onclick={() => (draft.look = { kind: 'icon', value: name })}
						>
							<Icon size={18} />
						</button>
					{/each}
				</div>
			{:else if lookTab === 'picture'}
				<button type="button" class="button self-start" onclick={() => void choosePicture()}>{t('editor-picture-choose')}</button>
			{/if}
		</div>

		<div class="flex flex-col gap-2">
			<h3 class="text-[13px] font-medium">{t('editor-color')}</h3>
			<div class="flex gap-1.5">
				{#each Object.entries(COLORS) as [name, color] (name)}
					<button
						type="button"
						class="swatch"
						class:chosen={draft.color === name}
						style:background={color}
						aria-label={name}
						aria-pressed={draft.color === name}
						onclick={() => (draft.color = name)}
					></button>
				{/each}
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<h3 class="text-[13px] font-medium">{t('editor-level')}</h3>
			<Slider value={draft.level} max={2} label={t('editor-level')} format={(value) => `${Math.round(value * 100)}%`} onchange={(level) => (draft.level = level)} />
		</div>

		<div class="flex flex-col">
			<Row title={t('editor-loop')} description={t('editor-loop-detail')}>
				<Switch checked={draft.looping} label={t('editor-loop')} onchange={(looping) => (draft.looping = looping)} />
			</Row>
			<Row title={t('editor-stop-others')} description={t('editor-stop-others-detail')}>
				<Switch checked={draft.stopOthers} label={t('editor-stop-others')} onchange={(stopOthers) => (draft.stopOthers = stopOthers)} />
			</Row>
			<Row title={t('editor-trigger')}>
				<Segmented options={[...triggerOptions]} value={draft.trigger} label={t('editor-trigger')} onchange={(trigger: Trigger) => (draft.trigger = trigger)} />
			</Row>
			<Row title={t('editor-hotkey')} description={app.hotkeysAvailable ? (keys ?? t('editor-hotkey-none')) : t('editor-hotkey-unavailable')}>
				{#if app.hotkeysAvailable}
					<button type="button" class="button" onclick={changeHotkey}>{t('editor-hotkey-change')}</button>
				{/if}
			</Row>
		</div>
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('editor-cancel')}</button>
		<button type="button" class="button primary" onclick={() => void save()}>{t('editor-save')}</button>
	{/snippet}
</Dialog>

<style>
	.swatch {
		display: grid;
		height: 32px;
		width: 32px;
		place-items: center;
		border-radius: var(--radius-pill);
		outline-offset: 2px;
	}

	.swatch.chosen {
		outline: 2px solid var(--text);
	}
</style>
