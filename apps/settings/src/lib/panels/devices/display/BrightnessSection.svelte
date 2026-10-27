<script lang="ts">
	import { t } from '@luft/i18n';
	import { onDestroy } from 'svelte';
	import { Row, Section, Slider } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { Brightness, ExternalBrightness, Monitor } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';

	const SETUP: Partial<Record<ExternalBrightness, string>> = {
		'missing-tool': 'settings-display-brightness-missing-tool',
		'needs-restart': 'settings-display-brightness-needs-restart',
		'no-access': 'settings-display-brightness-no-access'
	};
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
		void commands.displaySetBrightness({ connector, level });
	}

	onDestroy(events.displayBrightness(receive));
	onDestroy(() => timers.forEach(clearTimeout));
	void commands.displayBrightness().then(receive);
</script>

{#if shown.length || waiting.length}
	<Section title={t('settings-display-brightness')}>
		{#each shown as monitor (monitor.connector)}
			{@const control = brightness!.displays[monitor.connector]}
			{#if control.state === 'ready'}
				{@const level = pending[monitor.connector] ?? control.level}
				<Row title={monitor.name}>
					<span class="w-11 text-right tabular-nums">{percent(level)}</span>
					{#snippet below()}
						<Slider
							label={t('settings-display-brightness-label', { name: monitor.name })}
							value={level}
							format={percent}
							oninput={(value) => change(monitor.connector, value)}
							onchange={(value) => change(monitor.connector, value)}
						/>
					{/snippet}
				</Row>
			{:else}
				<Row title={monitor.name} description={control.state === 'unsupported' ? t('settings-display-brightness-unsupported') : t('settings-display-brightness-unresponsive')} />
			{/if}
		{/each}
		{#if waiting.length}
			<Row title={waiting.length === 1 ? waiting[0].name : t('settings-display-brightness-external')} description={setup && t(setup)} />
		{/if}
	</Section>
{/if}
