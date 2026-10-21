<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Select, Slider, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';

	type Keyboard = { repeat: boolean; delay: number; 'repeat-interval': number };

	const SLOWEST_INTERVAL = 110;
	const FASTEST_INTERVAL = 10;
	const CAPS_LOCK = [
		{ value: '', label: 'settings-keys-caps-lock' },
		{ value: 'caps:ctrl_modifier', label: 'settings-keys-ctrl' },
		{ value: 'caps:escape', label: 'settings-keyboard-caps-lock-escape' },
		{ value: 'caps:swapescape', label: 'settings-keyboard-caps-lock-swap-escape' },
		{ value: 'caps:none', label: 'settings-keyboard-caps-lock-nothing' }
	];
	const CAPS_LOCK_OPTION = /^caps:|^ctrl:(nocaps|swapcaps)$/;

	const keyboard = useSettings<Keyboard>('org.gnome.desktop.peripherals.keyboard', ['repeat', 'delay', 'repeat-interval']);
	const inputSources = useSettings<{ 'xkb-options': string[] }>('org.gnome.desktop.input-sources', ['xkb-options']);
	const notices = useSettings<{ 'lock-key-notices': boolean }>('com.lantharos.kestrel.media-keys', ['lock-key-notices']);

	let repeat = $derived(keyboard.values.repeat ?? true);
	let options = $derived(inputSources.values['xkb-options'] ?? []);
	let capsLock = $derived(options.find((option) => CAPS_LOCK_OPTION.test(option)) ?? '');

	function setCapsLock(option: string) {
		const kept = options.filter((existing) => !CAPS_LOCK_OPTION.test(existing));
		void inputSources.set('xkb-options', option ? [...kept, option] : kept);
	}
</script>

<Section title={t('settings-keyboard-typing')}>
	<Row title={t('settings-keyboard-repeat')} description={t('settings-keyboard-repeat-description')}>
		<Switch label={t('settings-keyboard-repeat')} checked={repeat} onchange={(on) => keyboard.set('repeat', on)} />
	</Row>
	<Row title={t('settings-keyboard-repeat-delay')} disabled={!repeat}>
		{#snippet below()}
			<div class="flex items-center gap-3 text-[12.5px] text-[var(--text-muted)]">
				<span>{t('settings-keyboard-repeat-delay-shorter')}</span>
				<Slider
					label={t('settings-keyboard-repeat-delay')}
					min={100}
					max={2000}
					step={50}
					disabled={!repeat}
					value={keyboard.values.delay ?? 500}
					onchange={(delay) => keyboard.set('delay', delay)}
				/>
				<span>{t('settings-keyboard-repeat-delay-longer')}</span>
			</div>
		{/snippet}
	</Row>
	<Row title={t('settings-keyboard-repeat-speed')} disabled={!repeat}>
		{#snippet below()}
			<div class="flex items-center gap-3 text-[12.5px] text-[var(--text-muted)]">
				<span>{t('settings-keyboard-repeat-speed-slower')}</span>
				<Slider
					label={t('settings-keyboard-repeat-speed')}
					min={FASTEST_INTERVAL}
					max={SLOWEST_INTERVAL}
					step={5}
					disabled={!repeat}
					value={SLOWEST_INTERVAL + FASTEST_INTERVAL - (keyboard.values['repeat-interval'] ?? 30)}
					onchange={(speed) => keyboard.set('repeat-interval', SLOWEST_INTERVAL + FASTEST_INTERVAL - speed)}
				/>
				<span>{t('settings-keyboard-repeat-speed-faster')}</span>
			</div>
		{/snippet}
	</Row>
	<Row title={t('settings-keyboard-caps-lock')} description={t('settings-keyboard-caps-lock-description')}>
		<Select
			label={t('settings-keyboard-caps-lock')}
			options={CAPS_LOCK.map((option) => ({ ...option, label: t(option.label) }))}
			value={capsLock}
			placeholder={t('settings-keyboard-caps-lock-custom')}
			onchange={setCapsLock}
		/>
	</Row>
	<Row title={t('settings-keyboard-lock-notices')} description={t('settings-keyboard-lock-notices-description')}>
		<Switch
			label={t('settings-keyboard-lock-notices')}
			checked={notices.values['lock-key-notices'] ?? true}
			onchange={(on) => notices.set('lock-key-notices', on)}
		/>
	</Row>
</Section>
