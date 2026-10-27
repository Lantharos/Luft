<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Select, Switch } from '@luft/ui';
	import type { Displays } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
	import {
		commonResolutions,
		hasVariant,
		mirror,
		mirroredScales,
		modeOf,
		monitorOf,
		orientations,
		pickMode,
		refreshRates,
		reshape,
		resolutions,
		setEnabled,
		setPrimary,
		setScale,
		type Draft,
		type Output
	} from './config';

	interface Props {
		displays: Displays;
		draft: Draft;
		output: Output;
	}

	let { displays, draft = $bindable(), output }: Props = $props();

	type VariableRefresh = 'off' | 'games' | 'fullscreen';


	const kestrel = useSettings<{ 'variable-refresh': Exclude<VariableRefresh, 'off'> }>(KESTREL_SCHEMA, ['variable-refresh']);

	let monitor = $derived(monitorOf(displays, output.connector));
	let mode = $derived(modeOf(displays, output));
	let several = $derived(displays.monitors.length > 1 && !draft.mirrored);
	let enabledCount = $derived(draft.outputs.filter((other) => other.enabled).length);
	let sizes = $derived(draft.mirrored ? commonResolutions(displays) : resolutions(monitor.modes));
	let rates = $derived(refreshRates(monitor, mode));
	let scales = $derived((draft.mirrored ? mirroredScales(displays, draft) : mode.scales).map((scale) => ({ value: scale, label: percent(scale) })));
	let variableRefresh = $derived<{ value: VariableRefresh; label: string }[]>([
		{ value: 'off', label: t('settings-display-variable-refresh-off') },
		{ value: 'games', label: t('settings-display-variable-refresh-games') },
		{ value: 'fullscreen', label: t('settings-display-variable-refresh-fullscreen') }
	]);
	let orientable = $derived(!(monitor.builtin && displays.orientationManaged));

	function setSize(key: string) {
		const size = sizes.find((option) => option.value === key)!.size;
		if (draft.mirrored) return mirror(displays, draft, size);
		reshape(displays, draft, output, (changed) => {
			const next = pickMode(monitor, size, mode.refresh, mode.variable);
			changed.mode = next.id;
			if (!next.scales.includes(changed.scale)) changed.scale = next.preferredScale;
		});
	}

	function setVariableRefresh(choice: VariableRefresh) {
		if (choice !== 'off') kestrel.set('variable-refresh', choice);
		if (mode.variable !== (choice !== 'off')) output.mode = pickMode(monitor, mode, mode.refresh, choice !== 'off').id;
	}

	function setOrientation(transform: number) {
		for (const target of draft.mirrored ? draft.outputs : [output]) {
			reshape(displays, draft, target, (changed) => (changed.transform = transform));
		}
	}
</script>

{#if several}
	<Row title={t('settings-display-use')}>
		<Switch
			label={t('settings-display-use')}
			checked={output.enabled}
			disabled={output.enabled && enabledCount === 1}
			onchange={(on) => setEnabled(displays, draft, output, on)}
		/>
	</Row>
{/if}
{#if output.enabled}
	{#if several && enabledCount > 1}
		<Row title={t('settings-display-main')} description={t('settings-display-main-description')}>
			<Switch label={t('settings-display-main')} checked={output.primary} disabled={output.primary} onchange={() => setPrimary(draft, output)} />
		</Row>
	{/if}
	<Row title={t('settings-display-resolution-title')}>
		<Select label={t('settings-display-resolution-title')} options={sizes} value="{mode.width}x{mode.height}" onchange={setSize} />
	</Row>
	{#if !draft.mirrored && rates.length > 1}
		<Row title={t('settings-display-refresh-rate-title')}>
			<Select label={t('settings-display-refresh-rate-title')} options={rates} value={rates.find((rate) => Math.abs(rate.value - mode.refresh) < 0.01)?.value ?? mode.refresh} onchange={(rate) => (output.mode = pickMode(monitor, mode, rate, mode.variable).id)} />
		</Row>
	{/if}
	{#if !draft.mirrored && hasVariant(monitor, mode)}
		<Row title={t('settings-display-variable-refresh')} description={t('settings-display-variable-refresh-description')}>
			<Select
				label={t('settings-display-variable-refresh')}
				options={variableRefresh}
				value={mode.variable ? (kestrel.values['variable-refresh'] ?? 'games') : 'off'}
				onchange={setVariableRefresh}
			/>
		</Row>
	{/if}
	{#if scales.length > 1}
		<Row title={t('settings-display-scale')} description={t('settings-display-scale-description')}>
			<Select label={t('settings-display-scale')} options={scales} value={output.scale} onchange={(scale) => setScale(displays, draft, output, scale)} />
		</Row>
	{/if}
	{#if orientable}
		<Row title={t('settings-display-orientation')}>
			<Select label={t('settings-display-orientation')} options={orientations()} value={output.transform} onchange={setOrientation} />
		</Row>
	{/if}
{/if}
