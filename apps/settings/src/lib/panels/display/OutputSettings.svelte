<script lang="ts">
	import { Row, Select, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import type { Displays } from './api';
	import {
		ORIENTATIONS,
		commonResolutions,
		hasVariant,
		mirror,
		mirroredScales,
		modeOf,
		monitorOf,
		percentScale,
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

	const VARIABLE_REFRESH: { value: VariableRefresh; label: string }[] = [
		{ value: 'off', label: 'Off' },
		{ value: 'games', label: 'In games' },
		{ value: 'fullscreen', label: 'In all fullscreen apps' }
	];

	const kestrel = useSettings<{ 'variable-refresh': Exclude<VariableRefresh, 'off'> }>('com.lantharos.kestrel', ['variable-refresh']);

	let monitor = $derived(monitorOf(displays, output.connector));
	let mode = $derived(modeOf(displays, output));
	let several = $derived(displays.monitors.length > 1 && !draft.mirrored);
	let enabledCount = $derived(draft.outputs.filter((other) => other.enabled).length);
	let sizes = $derived(draft.mirrored ? commonResolutions(displays) : resolutions(monitor.modes));
	let rates = $derived(refreshRates(monitor, mode));
	let scales = $derived((draft.mirrored ? mirroredScales(displays, draft) : mode.scales).map((scale) => ({ value: scale, label: percentScale(scale) })));
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
	<Row title="Use this display">
		<Switch
			label="Use this display"
			checked={output.enabled}
			disabled={output.enabled && enabledCount === 1}
			onchange={(on) => setEnabled(displays, draft, output, on)}
		/>
	</Row>
{/if}
{#if output.enabled}
	{#if several && enabledCount > 1}
		<Row title="Main display" description="The top bar and new windows show up here">
			<Switch label="Main display" checked={output.primary} disabled={output.primary} onchange={() => setPrimary(draft, output)} />
		</Row>
	{/if}
	<Row title="Resolution">
		<Select label="Resolution" options={sizes} value="{mode.width}x{mode.height}" onchange={setSize} />
	</Row>
	{#if !draft.mirrored && rates.length > 1}
		<Row title="Refresh rate">
			<Select label="Refresh rate" options={rates} value={rates.find((rate) => Math.abs(rate.value - mode.refresh) < 0.01)?.value ?? mode.refresh} onchange={(rate) => (output.mode = pickMode(monitor, mode, rate, mode.variable).id)} />
		</Row>
	{/if}
	{#if !draft.mirrored && hasVariant(monitor, mode)}
		<Row title="Variable refresh rate" description="Lets the display follow the frame rate of fullscreen games for smoother motion">
			<Select
				label="Variable refresh rate"
				options={VARIABLE_REFRESH}
				value={mode.variable ? (kestrel.values['variable-refresh'] ?? 'games') : 'off'}
				onchange={setVariableRefresh}
			/>
		</Row>
	{/if}
	{#if scales.length > 1}
		<Row title="Scale" description="Makes text, apps, and everything else bigger or smaller">
			<Select label="Scale" options={scales} value={output.scale} onchange={(scale) => setScale(displays, draft, output, scale)} />
		</Row>
	{/if}
	{#if orientable}
		<Row title="Orientation">
			<Select label="Orientation" options={ORIENTATIONS} value={output.transform} onchange={setOrientation} />
		</Row>
	{/if}
{/if}
