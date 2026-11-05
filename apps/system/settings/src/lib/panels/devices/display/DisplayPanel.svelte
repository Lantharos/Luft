<script lang="ts">
	import { t } from '@luft/i18n';
	import { onDestroy } from 'svelte';
	import { Row, Section, Select, Switch } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { Displays } from '#lib/bindings.js';
	import Arrangement from './Arrangement.svelte';
	import BrightnessSection from './BrightnessSection.svelte';
	import { commonResolutions, draftFrom, footprint, mirror, modeOf, monitorOf, toLogical, unmirror, type Draft } from './config';
	import NightLight from './NightLight.svelte';
	import OutputSettings from './OutputSettings.svelte';

	let displays = $state<Displays | null>(null);
	let draft = $state<Draft | null>(null);
	let selected = $state('');
	let applying = $state(false);
	let failed = $state(false);

	let baseline = $derived(displays ? JSON.stringify(draftFrom(displays)) : '');
	let changed = $derived(draft !== null && JSON.stringify(draft) !== baseline);
	let output = $derived(draft?.outputs.find((entry) => entry.connector === selected) ?? draft?.outputs[0]);
	let several = $derived((displays?.monitors.length ?? 0) > 1);
	let mirrorable = $derived(displays !== null && several && commonResolutions(displays).length > 0);
	let items = $derived(
		displays && draft && !draft.mirrored
			? draft.outputs
					.filter((entry) => entry.enabled)
					.map((entry) => ({ ...footprint(displays!, entry), name: monitorOf(displays!, entry.connector).name, primary: entry.primary }))
			: []
	);
	let active = $derived(displays?.monitors.filter((monitor) => displays!.logical.some((logical) => logical.monitors.includes(monitor.connector))) ?? []);
	let choices = $derived(displays?.monitors.map((monitor) => ({ value: monitor.connector, label: monitor.name })) ?? []);

	function receive(next: Displays) {
		displays = next;
		draft = draftFrom(next);
		failed = false;
		if (!next.monitors.some((monitor) => monitor.connector === selected)) {
			selected = next.logical.find((logical) => logical.primary)?.monitors[0] ?? next.monitors[0]?.connector ?? '';
		}
	}

	function move(connector: string, x: number, y: number) {
		const moved = draft!.outputs.find((entry) => entry.connector === connector)!;
		moved.x = x;
		moved.y = y;
		const rects = draft!.outputs.filter((entry) => entry.enabled).map((entry) => footprint(displays!, entry));
		const left = Math.min(...rects.map((rect) => rect.x));
		const top = Math.min(...rects.map((rect) => rect.y));
		for (const entry of draft!.outputs.filter((entry) => entry.enabled)) {
			entry.x -= left;
			entry.y -= top;
		}
	}

	function setMirrored(on: boolean) {
		if (!on) return unmirror(displays!, draft!);
		const sizes = commonResolutions(displays!);
		const lead = draft!.outputs.find((entry) => entry.primary) ?? draft!.outputs[0];
		const current = modeOf(displays!, lead);
		const size = sizes.find((option) => option.size.width === current.width && option.size.height === current.height) ?? sizes[0];
		mirror(displays!, draft!, size.size);
	}

	async function apply() {
		applying = true;
		failed = false;
		try {
			await commands.displayApply({ serial: displays!.serial, logical: toLogical(draft!) });
		} catch {
			failed = true;
		} finally {
			applying = false;
		}
	}

	onDestroy(events.displayChanged(receive));
	void commands.displayState().then(receive);
</script>

{#if displays && draft && output}
	{#if several}
		<Section>
			{#if !draft.mirrored}
				<div class="px-4 pt-4 pb-2">
					<Arrangement {items} selected={output.connector} onselect={(connector) => (selected = connector)} onmove={move} />
				</div>
			{/if}
			{#if mirrorable}
				<Row title={t('settings-display-mirror')} description={t('settings-display-mirror-description')}>
					<Switch label={t('settings-display-mirror')} checked={draft.mirrored} onchange={setMirrored} />
				</Row>
			{/if}
		</Section>
	{/if}

	<Section title={draft.mirrored ? t('settings-display-mirrored') : several ? undefined : monitorOf(displays, output.connector).name}>
		{#if several && !draft.mirrored}
			<Row title={t('settings-display-display')}>
				<Select label={t('settings-display-display')} options={choices} value={output.connector} onchange={(connector) => (selected = connector)} />
			</Row>
		{/if}
		<OutputSettings {displays} bind:draft {output} />
	</Section>

	{#if changed}
		<div class="apply-bar">
			{#if failed}
				<span class="px-2 text-[13px] text-[var(--danger)]">{t('settings-display-apply-failed')}</span>
			{/if}
			<button type="button" class="plain-button" disabled={applying} onclick={() => (draft = draftFrom(displays!))}>{t('settings-display-reset')}</button>
			<button type="button" class="button primary" disabled={applying} onclick={apply}>{t('settings-display-apply')}</button>
		</div>
	{/if}

	<BrightnessSection monitors={active} />

	{#if displays.nightLight}
		<NightLight />
	{/if}
{/if}

<style>
	.apply-bar {
		position: sticky;
		bottom: 16px;
		z-index: 2;
		display: flex;
		align-items: center;
		align-self: flex-end;
		gap: 6px;
		padding: 6px;
		border-radius: var(--radius-pill);
		background: var(--popover);
		box-shadow: 0 12px 40px var(--shadow-soft);
		animation: rise var(--motion-standard) var(--ease-decelerate);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}
</style>
