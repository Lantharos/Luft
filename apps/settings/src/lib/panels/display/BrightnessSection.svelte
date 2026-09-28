<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Row, Section, Slider } from '@luft/ui';
	import { percent } from '$lib/format';
	import { loadBrightness, onBrightnessChanged, setBrightness, type Brightness, type ExternalBrightness, type Monitor } from './api';

	const SETUP: Partial<Record<ExternalBrightness, string>> = {
		'missing-tool': 'Install ddcutil to change the brightness of external displays from here.',
		'needs-restart': 'Restart your computer to finish setting up brightness control for external displays.',
		'no-access': "Your account isn't allowed to adjust external displays yet. Logging out and back in usually fixes this. If it doesn't, your account needs access to the i2c devices your displays are connected through."
	};
	const UNSUPPORTED = "This display doesn't accept brightness changes from the computer. Turning on DDC/CI in the display's own menu might help.";
	const UNRESPONSIVE = "This display isn't responding right now. Settings will try again shortly.";
	const SETTLED = 0.02;
	const HOLD = 1500;

	let { monitors }: { monitors: Monitor[] } = $props();

	let brightness = $state<Brightness | null>(null);
	let pending = $state<Record<string, number>>({});
	const timers = new Map<string, ReturnType<typeof setTimeout>>();

	let setup = $derived(brightness ? SETUP[brightness.external] : undefined);
	let shown = $derived(monitors.filter((monitor) => brightness?.displays[monitor.connector]));
	let waiting = $derived(setup ? monitors.filter((monitor) => !monitor.builtin && !brightness?.displays[monitor.connector]) : []);

	function release(connector: string) {
		clearTimeout(timers.get(connector));
		timers.delete(connector);
		delete pending[connector];
	}

	function receive(next: Brightness) {
		for (const [connector, level] of Object.entries(pending)) {
			const control = next.displays[connector];
			if (control?.state !== 'ready' || Math.abs(control.level - level) < SETTLED) release(connector);
		}
		brightness = next;
	}

	function change(connector: string, level: number) {
		clearTimeout(timers.get(connector));
		pending[connector] = level;
		timers.set(
			connector,
			setTimeout(() => release(connector), HOLD)
		);
		void setBrightness(connector, level);
	}

	onDestroy(onBrightnessChanged(receive));
	onDestroy(() => timers.forEach(clearTimeout));
	void loadBrightness().then(receive);
</script>

{#if shown.length || waiting.length}
	<Section title="Brightness">
		{#each shown as monitor (monitor.connector)}
			{@const control = brightness!.displays[monitor.connector]}
			{#if control.state === 'ready'}
				{@const level = pending[monitor.connector] ?? control.level}
				<Row title={monitor.name}>
					<span class="w-11 text-right tabular-nums">{percent(level)}</span>
					{#snippet below()}
						<Slider
							label="{monitor.name} brightness"
							value={level}
							format={percent}
							oninput={(value) => change(monitor.connector, value)}
							onchange={(value) => change(monitor.connector, value)}
						/>
					{/snippet}
				</Row>
			{:else}
				<Row title={monitor.name} description={control.state === 'unsupported' ? UNSUPPORTED : UNRESPONSIVE} />
			{/if}
		{/each}
		{#if waiting.length}
			<Row title={waiting.length === 1 ? waiting[0].name : 'External displays'} description={setup} />
		{/if}
	</Section>
{/if}
