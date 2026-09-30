<script lang="ts">
	import { Dialog, Slider } from '@luft/ui';
	import { tasks } from './actions.svelte';

	interface Props {
		pid: number;
		name: string;
		nice: number;
	}

	const PRESETS = [
		{ value: -15, label: 'Highest' },
		{ value: -5, label: 'High' },
		{ value: 0, label: 'Normal' },
		{ value: 5, label: 'Low' },
		{ value: 15, label: 'Lowest' }
	];

	let { pid, name, nice }: Props = $props();

	let value = $state(0);
	let saving = $state(false);

	$effect.pre(() => {
		value = nice;
	});

	async function apply() {
		saving = true;
		await tasks.setPriority(pid, value);
		saving = false;
	}
</script>

<Dialog
	title={`Priority of ${name}`}
	description="Higher priority gets this process more processor time when others want it too. Raising it above normal asks for your password."
	onclose={() => (tasks.priority = null)}
>
	<div class="flex flex-col gap-4">
		<div class="presets" role="radiogroup" aria-label="Priority">
			{#each PRESETS as preset (preset.value)}
				<button type="button" role="radio" aria-checked={value === preset.value} class:active={value === preset.value} onclick={() => (value = preset.value)}>
					{preset.label}
				</button>
			{/each}
		</div>
		<div class="flex items-center gap-4">
			<Slider label="Niceness" min={-20} max={19} step={1} {value} oninput={(next) => (value = next)} onchange={(next) => (value = next)} />
			<span class="w-10 flex-none text-right tabular-nums">{value}</span>
		</div>
		<p class="text-[12px] text-[var(--text-muted)]">Niceness from −20, the highest priority, to 19, the lowest.</p>
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={() => (tasks.priority = null)}>Cancel</button>
		<button type="button" class="button primary" disabled={saving || value === nice} onclick={apply}>Change</button>
	{/snippet}
</Dialog>

<style>
	.presets {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 4px;
		padding: 3px;
		border-radius: var(--radius-pill);
		background: var(--control);
	}

	.presets button {
		min-height: 30px;
		border-radius: var(--radius-pill);
		font-size: 12.5px;
		font-weight: 500;
		color: var(--text-muted);
		transition:
			background-color 180ms var(--ease),
			color 180ms var(--ease);
	}

	.presets button:hover,
	.presets .active {
		color: var(--text);
	}

	.presets .active {
		background: var(--control-hover);
	}
</style>
