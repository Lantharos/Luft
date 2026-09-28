<script lang="ts">
	import { Row, Select, Switch } from '@luft/ui';
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
		<Row title="Variable refresh rate" description="Matches the display to games and video for smoother motion">
			<Switch label="Variable refresh rate" checked={mode.variable} onchange={(on) => (output.mode = pickMode(monitor, mode, mode.refresh, on).id)} />
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
