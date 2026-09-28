<script lang="ts">
	import { Row, Section, Segmented, Slider, Switch } from '@luft/ui';
	import { setKeyboard, type Keyboard } from './api';

	const STEPS: Record<number, string[]> = {
		2: ['Off', 'Low', 'High'],
		3: ['Off', 'Low', 'Medium', 'High']
	};

	let { keyboard }: { keyboard: Keyboard } = $props();

	let steps = $derived(STEPS[keyboard.max]?.map((label, value) => ({ value, label })));
	const share = (level: number) => (level === 0 ? 'Off' : `${Math.round((level / keyboard.max) * 100)}%`);
	const set = (level: number) => setKeyboard(keyboard.id, level);
</script>

<Section title="Keyboard">
	{#if keyboard.max === 1}
		<Row title="Keyboard backlight">
			<Switch label="Keyboard backlight" checked={keyboard.level > 0} onchange={(on) => set(on ? 1 : 0)} />
		</Row>
	{:else if steps}
		<Row title="Keyboard backlight">
			<Segmented label="Keyboard backlight" options={steps} value={keyboard.level} onchange={set} />
		</Row>
	{:else}
		<Row title="Keyboard backlight">
			<span class="w-11 text-right tabular-nums">{share(keyboard.level)}</span>
			{#snippet below()}
				<Slider label="Keyboard backlight" value={keyboard.level} max={keyboard.max} step={1} format={share} oninput={set} onchange={set} />
			{/snippet}
		</Row>
	{/if}
</Section>
