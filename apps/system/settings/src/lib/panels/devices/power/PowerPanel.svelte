<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Select, Switch } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { PowerState } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import BatterySection from './BatterySection.svelte';
	import DevicesSection from './DevicesSection.svelte';
	import { durationOptions } from './format';
	import KeyboardSection from './KeyboardSection.svelte';
	import LongSleep from './LongSleep.svelte';

	type Power = {
		'idle-dim': boolean;
		'sleep-inactive-ac-type': string;
		'sleep-inactive-ac-timeout': number;
		'sleep-inactive-battery-type': string;
		'sleep-inactive-battery-timeout': number;
		'power-button-action': string;
		'power-saver-profile-on-low-battery': boolean;
		'power-saver-battery-level': number;
	};
	type Source = 'ac' | 'battery';

	const MINUTE = 60;
	const SCREEN_DELAYS = [1, 2, 3, 5, 10, 15].map((minutes) => minutes * MINUTE);
	const SUSPEND_DELAYS = [15, 20, 30, 45, 60, 90, 120].map((minutes) => minutes * MINUTE);
	const PROFILES = [
		{ value: 'power-saver', label: 'settings-power-profile-saver', description: 'settings-power-profile-saver.description' },
		{ value: 'balanced', label: 'settings-power-profile-balanced', description: 'settings-power-profile-balanced.description' },
		{ value: 'performance', label: 'settings-power-profile-performance', description: 'settings-power-profile-performance.description' }
	];
	const SAVER_LEVELS = [20, 30, 40, 50];
	const LAP = 'lap-detected';
	const HOT = 'high-operating-temperature';

	const session = useSettings<{ 'idle-delay': number }>('org.gnome.desktop.session', ['idle-delay']);
	const power = useSettings<Power>('com.lantharos.kestrel.power', [
		'idle-dim',
		'sleep-inactive-ac-type',
		'sleep-inactive-ac-timeout',
		'sleep-inactive-battery-type',
		'sleep-inactive-battery-timeout',
		'power-button-action',
		'power-saver-profile-on-low-battery',
		'power-saver-battery-level'
	]);

	let state = $state<PowerState | null>(null);

	let profiles = $derived(state?.profiles ?? null);
	let saverLevels = $derived(SAVER_LEVELS.map((level) => ({ value: level, label: percent(level / 100) })));
	let profileOptions = $derived(
		PROFILES.filter((profile) => profiles?.available.includes(profile.value)).map((profile) => ({ value: profile.value, label: t(profile.label) }))
	);
	let profileDescription = $derived.by(() => {
		if (!profiles) return undefined;
		if (profiles.degraded.length && profiles.active === 'performance') return limitation(profiles.degraded);
		const active = PROFILES.find((profile) => profile.value === profiles.active);
		return active && t(active.description);
	});
	let buttonActions = $derived([
		{ value: 'suspend', label: t('settings-power-button-suspend') },
		...(state?.canHibernate ? [{ value: 'hibernate', label: t('settings-power-button-hibernate') }] : []),
		{ value: 'interactive', label: t('settings-power-button-ask') },
		{ value: 'nothing', label: t('settings-power-button-nothing') }
	]);

	function limitation(reasons: string[]) {
		const lap = reasons.includes(LAP);
		const hot = reasons.includes(HOT);
		if (lap && hot) return t('settings-power-limited-lap-hot');
		if (lap) return t('settings-power-limited-lap');
		if (hot) return t('settings-power-limited-hot');
		return t('settings-power-limited');
	}

	$effect(() => {
		void commands.powerState().then((current) => (state = current));
		return events.powerChanged((current) => (state = current));
	});

	async function chooseProfile(profile: string) {
		if (!state?.profiles) return;
		const previous = state.profiles.active;
		state.profiles.active = profile;
		try {
			await commands.powerSetProfile({ profile });
		} catch {
			state.profiles.active = previous;
		}
	}

	const suspendKeys = (source: Source) => [`sleep-inactive-${source}-type`, `sleep-inactive-${source}-timeout`] as const;

	function suspendDelay(source: Source) {
		const [type, timeout] = suspendKeys(source);
		return power.values[type] === 'nothing' ? 0 : (power.values[timeout] ?? 0);
	}

	async function setSuspendDelay(source: Source, seconds: number) {
		const [type, timeout] = suspendKeys(source);
		if (seconds === 0) return power.set(type, 'nothing');
		await power.set(timeout, seconds);
		await power.set(type, 'suspend');
	}
</script>

{#if state?.battery}
	<BatterySection battery={state.battery} />
{/if}

{#if state?.devices.length}
	<DevicesSection devices={state.devices} />
{/if}

{#if profiles && profileOptions.length > 1}
	<Section title={t('settings-power-mode')}>
		<Row title={t('settings-power-mode-row')} description={profileDescription} truncate>
			<Segmented label={t('settings-power-mode')} options={profileOptions} value={profiles.active} onchange={chooseProfile} />
		</Row>
		{#if state?.battery}
			<Row title={t('settings-power-saver-low-battery')} description={t('settings-power-saver-low-battery-description')}>
				{#if power.values['power-saver-profile-on-low-battery'] ?? true}
					<Segmented
						label={t('settings-power-saver-level')}
						options={saverLevels}
						value={power.values['power-saver-battery-level'] ?? 30}
						onchange={(level) => power.set('power-saver-battery-level', level)}
					/>
				{/if}
				<Switch
					label={t('settings-power-saver-low-battery')}
					checked={power.values['power-saver-profile-on-low-battery'] ?? true}
					onchange={(on) => power.set('power-saver-profile-on-low-battery', on)}
				/>
			</Row>
		{/if}
	</Section>
{/if}

{#if state?.keyboard}
	<KeyboardSection keyboard={state.keyboard} />
{/if}

<Section title={t('settings-power-screen')}>
	<Row title={t('settings-power-screen-off')} description={t('settings-power-screen-off-description')}>
		<Select
			label={t('settings-power-screen-off')}
			options={durationOptions(SCREEN_DELAYS, session.values['idle-delay'] ?? 0)}
			value={session.values['idle-delay'] ?? 0}
			onchange={(seconds) => session.set('idle-delay', seconds)}
		/>
	</Row>
	<Row title={t('settings-power-dim')} description={t('settings-power-dim-description')}>
		<Switch label={t('settings-power-dim')} checked={power.values['idle-dim'] ?? true} onchange={(on) => power.set('idle-dim', on)} />
	</Row>
</Section>

<Section title={t('settings-power-sleep')}>
	<Row
		title={state?.battery ? t('settings-power-suspend-plugged-in') : t('settings-power-suspend-inactive')}
		description={t('settings-power-suspend-description')}
	>
		<Select
			label={state?.battery ? t('settings-power-suspend-plugged-in') : t('settings-power-suspend-inactive')}
			options={durationOptions(SUSPEND_DELAYS, suspendDelay('ac'))}
			value={suspendDelay('ac')}
			onchange={(seconds) => setSuspendDelay('ac', seconds)}
		/>
	</Row>
	{#if state?.battery}
		<Row title={t('settings-power-suspend-battery')}>
			<Select
				label={t('settings-power-suspend-battery')}
				options={durationOptions(SUSPEND_DELAYS, suspendDelay('battery'))}
				value={suspendDelay('battery')}
				onchange={(seconds) => setSuspendDelay('battery', seconds)}
			/>
		</Row>
		<LongSleep />
	{/if}
	<Row title={t('settings-power-button')}>
		<Select
			label={t('settings-power-button')}
			options={buttonActions}
			value={power.values['power-button-action'] ?? 'interactive'}
			onchange={(action) => power.set('power-button-action', action)}
		/>
	</Row>
</Section>
