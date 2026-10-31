<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Select, Slider, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { cursorSizes } from '../appearance/cursors/sizes';

	type Applications = {
		'screen-reader-enabled': boolean;
		'screen-magnifier-enabled': boolean;
	};

	type Interface = {
		'text-scaling-factor': number;
		'cursor-size': number;
		'enable-animations': boolean;
	};

	type A11yInterface = {
		'high-contrast': boolean;
		'reduced-motion': 'no-preference' | 'reduce';
	};

	const LARGE_TEXT = 1.25;

	const applications = useSettings<Applications>('org.gnome.desktop.a11y.applications', ['screen-reader-enabled', 'screen-magnifier-enabled']);
	const magnifier = useSettings<{ 'mag-factor': number }>('org.gnome.desktop.a11y.magnifier', ['mag-factor']);
	const a11y = useSettings<A11yInterface>('org.gnome.desktop.a11y.interface', ['high-contrast', 'reduced-motion']);
	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['text-scaling-factor', 'cursor-size', 'enable-animations']);

	let readerInstalled = $state(false);
	let zoomed = $derived(applications.values['screen-magnifier-enabled'] ?? false);

	let sizes = $derived(cursorSizes());

	const times = (factor: number) => t('settings-accessibility-zoom-factor', { factor });

	void commands.accessibilityScreenReader().then((installed) => (readerInstalled = installed));
</script>

<Section title={t('settings-accessibility-seeing')}>
	{#if readerInstalled}
		<Row title={t('settings-accessibility-screen-reader')}>
			<Switch
				label={t('settings-accessibility-screen-reader')}
				checked={applications.values['screen-reader-enabled'] ?? false}
				onchange={(on) => applications.set('screen-reader-enabled', on)}
			/>
		</Row>
	{/if}
	<Row title={t('settings-accessibility-zoom')}>
		<Switch label={t('settings-accessibility-zoom')} checked={zoomed} onchange={(on) => applications.set('screen-magnifier-enabled', on)} />
	</Row>
	{#if zoomed}
		<Row title={t('settings-accessibility-zoom-level')}>
			<span class="w-12 text-right tabular-nums">{times(magnifier.values['mag-factor'] ?? 2)}</span>
			{#snippet below()}
				<Slider
					label={t('settings-accessibility-zoom-level')}
					min={1.25}
					max={8}
					step={0.25}
					value={magnifier.values['mag-factor'] ?? 2}
					format={times}
					onchange={(factor) => magnifier.set('mag-factor', factor)}
				/>
			{/snippet}
		</Row>
	{/if}
	<Row title={t('settings-accessibility-large-text')}>
		<Switch
			label={t('settings-accessibility-large-text')}
			checked={(desktop.values['text-scaling-factor'] ?? 1) > 1}
			onchange={(on) => (on ? desktop.set('text-scaling-factor', LARGE_TEXT) : desktop.reset('text-scaling-factor'))}
		/>
	</Row>
	<Row title={t('settings-accessibility-high-contrast')}>
		<Switch label={t('settings-accessibility-high-contrast')} checked={a11y.values['high-contrast'] ?? false} onchange={(on) => a11y.set('high-contrast', on)} />
	</Row>
	<Row title={t('settings-accessibility-reduce-motion')} description={t('settings-accessibility-reduce-motion-description')}>
		<Switch
			label={t('settings-accessibility-reduce-motion')}
			checked={a11y.values['reduced-motion'] === 'reduce'}
			onchange={(on) => a11y.set('reduced-motion', on ? 'reduce' : 'no-preference')}
		/>
	</Row>
	<Row title={t('settings-accessibility-animations')} description={t('settings-accessibility-animations-description')}>
		<Switch label={t('settings-accessibility-animations')} checked={desktop.values['enable-animations'] ?? true} onchange={(on) => desktop.set('enable-animations', on)} />
	</Row>
	<Row title={t('settings-accessibility-cursor-size')}>
		<Select label={t('settings-accessibility-cursor-size')} options={sizes} value={desktop.values['cursor-size'] ?? 24} onchange={(size) => desktop.set('cursor-size', size)} />
	</Row>
</Section>
