<script lang="ts">
	import { onDestroy } from 'svelte';
	import Row from '$lib/components/controls/Row.svelte';
	import Section from '$lib/components/controls/Section.svelte';
	import Select from '$lib/components/controls/Select.svelte';
	import Switch from '$lib/components/controls/Switch.svelte';
	import { applyDisplays, loadDisplays, onDisplaysChanged, type Displays } from './api';
	import Arrangement from './Arrangement.svelte';
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
			await applyDisplays(displays!.serial, toLogical(draft!));
		} catch {
			failed = true;
		} finally {
			applying = false;
		}
	}

	onDestroy(onDisplaysChanged(receive));
	void loadDisplays().then(receive);
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
				<Row title="Mirror displays" description="Shows the same picture on every display">
					<Switch label="Mirror displays" checked={draft.mirrored} onchange={setMirrored} />
				</Row>
			{/if}
		</Section>
	{/if}

	<Section title={draft.mirrored ? 'Mirrored displays' : several ? undefined : monitorOf(displays, output.connector).name}>
		{#if several && !draft.mirrored}
			<Row title="Display">
				<Select label="Display" options={choices} value={output.connector} onchange={(connector) => (selected = connector)} />
			</Row>
		{/if}
		<OutputSettings {displays} bind:draft {output} />
	</Section>

	{#if changed}
		<div class="apply-bar">
			{#if failed}
				<span class="px-2 text-[13px] text-[var(--danger)]">These settings didn't work. Try a different setup.</span>
			{/if}
			<button type="button" class="plain-button" disabled={applying} onclick={() => (draft = draftFrom(displays!))}>Reset</button>
			<button type="button" class="button primary" disabled={applying} onclick={apply}>Apply</button>
		</div>
	{/if}

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
		animation: rise 220ms var(--ease);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}
</style>
