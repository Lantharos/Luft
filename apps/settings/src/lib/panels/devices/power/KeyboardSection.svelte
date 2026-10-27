<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Slider, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Keyboard } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';

	const STEPS: Record<number, string[]> = {
		2: ['settings-power-backlight-off', 'settings-power-backlight-low', 'settings-power-backlight-high'],
		3: ['settings-power-backlight-off', 'settings-power-backlight-low', 'settings-power-backlight-medium', 'settings-power-backlight-high']
	};

	let { keyboard }: { keyboard: Keyboard } = $props();

	let steps = $derived(STEPS[keyboard.max]?.map((label, value) => ({ value, label: t(label) })));
	const share = (level: number) => (level === 0 ? t('settings-power-backlight-off') : percent(level / keyboard.max));
	const set = (level: number) => commands.powerSetKeyboard({ id: keyboard.id, level });
</script>

<Section title={t('settings-power-keyboard')}>
	{#if keyboard.max === 1}
		<Row title={t('settings-power-backlight')}>
			<Switch label={t('settings-power-backlight')} checked={keyboard.level > 0} onchange={(on) => set(on ? 1 : 0)} />
		</Row>
	{:else if steps}
		<Row title={t('settings-power-backlight')}>
			<Segmented label={t('settings-power-backlight')} options={steps} value={keyboard.level} onchange={set} />
		</Row>
	{:else}
		<Row title={t('settings-power-backlight')}>
			<span class="w-11 text-right tabular-nums">{share(keyboard.level)}</span>
			{#snippet below()}
				<Slider label={t('settings-power-backlight')} value={keyboard.level} max={keyboard.max} step={1} format={share} oninput={set} onchange={set} />
			{/snippet}
		</Row>
	{/if}
</Section>
