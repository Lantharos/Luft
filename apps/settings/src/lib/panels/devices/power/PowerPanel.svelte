<script lang="ts">
	import { Row, Section, Segmented, Select, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { onPowerChanged, powerState, setProfile, type PowerState } from './api';
	import BatterySection from './BatterySection.svelte';
	import DevicesSection from './DevicesSection.svelte';
	import { durationOptions } from './format';
	import KeyboardSection from './KeyboardSection.svelte';

	type Power = {
		'idle-dim': boolean;
		'sleep-inactive-ac-type': string;
		'sleep-inactive-ac-timeout': number;
		'sleep-inactive-battery-type': string;
		'sleep-inactive-battery-timeout': number;
		'power-button-action': string;
		'power-saver-profile-on-low-battery': boolean;
	};
	type Source = 'ac' | 'battery';

	const MINUTE = 60;
	const SCREEN_DELAYS = [1, 2, 3, 5, 10, 15].map((minutes) => minutes * MINUTE);
	const SUSPEND_DELAYS = [15, 20, 30, 45, 60, 90, 120].map((minutes) => minutes * MINUTE);
	const PROFILES = [
		{ value: 'power-saver', label: 'Power saver', description: 'Slower, and uses less power' },
		{ value: 'balanced', label: 'Balanced', description: 'Standard performance and power use' },
		{ value: 'performance', label: 'Performance', description: 'Faster, and uses more power' }
	];
	const DEGRADED: Record<string, string> = {
		'lap-detected': 'on your lap',
		'high-operating-temperature': 'too hot'
	};

	const session = useSettings<{ 'idle-delay': number }>('org.gnome.desktop.session', ['idle-delay']);
	const power = useSettings<Power>('com.lantharos.kestrel.power', [
		'idle-dim',
		'sleep-inactive-ac-type',
		'sleep-inactive-ac-timeout',
		'sleep-inactive-battery-type',
		'sleep-inactive-battery-timeout',
		'power-button-action',
		'power-saver-profile-on-low-battery'
	]);

	let state = $state<PowerState | null>(null);

	let profiles = $derived(state?.profiles ?? null);
	let profileOptions = $derived(PROFILES.filter((profile) => profiles?.available.includes(profile.value)));
	let profileDescription = $derived.by(() => {
		if (!profiles) return undefined;
		if (profiles.degraded.length && profiles.active === 'performance') return limitation(profiles.degraded);
		return PROFILES.find((profile) => profile.value === profiles.active)?.description;
	});
	let buttonActions = $derived([
		{ value: 'suspend', label: 'Suspend' },
		...(state?.canHibernate ? [{ value: 'hibernate', label: 'Hibernate' }] : []),
		{ value: 'interactive', label: 'Ask what to do' },
		{ value: 'nothing', label: 'Do nothing' }
	]);

	function limitation(reasons: string[]) {
		const known = reasons.flatMap((reason) => DEGRADED[reason] ?? []);
		return known.length ? `Performance is limited because the computer is ${known.join(' and ')}` : 'Performance is limited right now';
	}

	$effect(() => {
		void powerState().then((current) => (state = current));
		return onPowerChanged((current) => (state = current));
	});

	async function chooseProfile(profile: string) {
		if (!state?.profiles) return;
		const previous = state.profiles.active;
		state.profiles.active = profile;
		try {
			await setProfile(profile);
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
	<Section title="Power mode">
		<Row title="Mode" description={profileDescription} truncate>
			<Segmented label="Power mode" options={profileOptions} value={profiles.active} onchange={chooseProfile} />
		</Row>
		{#if state?.battery}
			<Row title="Power saver on low battery" description="Switches to power saver when the battery runs low">
				<Switch
					label="Power saver on low battery"
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

<Section title="Screen">
	<Row title="Turn off the screen after" description="When you haven't used the computer for a while">
		<Select
			label="Turn off the screen after"
			options={durationOptions(SCREEN_DELAYS, session.values['idle-delay'] ?? 0)}
			value={session.values['idle-delay'] ?? 0}
			onchange={(seconds) => session.set('idle-delay', seconds)}
		/>
	</Row>
	<Row title="Dim when inactive" description="Lowers the brightness shortly before the screen turns off">
		<Switch label="Dim when inactive" checked={power.values['idle-dim'] ?? true} onchange={(on) => power.set('idle-dim', on)} />
	</Row>
</Section>

<Section title="Sleep">
	<Row title={state?.battery ? 'Suspend when plugged in' : 'Suspend when inactive'} description="Puts the computer to sleep after a while without use">
		<Select
			label="Suspend when plugged in"
			options={durationOptions(SUSPEND_DELAYS, suspendDelay('ac'))}
			value={suspendDelay('ac')}
			onchange={(seconds) => setSuspendDelay('ac', seconds)}
		/>
	</Row>
	{#if state?.battery}
		<Row title="Suspend on battery">
			<Select
				label="Suspend on battery"
				options={durationOptions(SUSPEND_DELAYS, suspendDelay('battery'))}
				value={suspendDelay('battery')}
				onchange={(seconds) => setSuspendDelay('battery', seconds)}
			/>
		</Row>
	{/if}
	<Row title="Power button">
		<Select
			label="Power button"
			options={buttonActions}
			value={power.values['power-button-action'] ?? 'interactive'}
			onchange={(action) => power.set('power-button-action', action)}
		/>
	</Row>
</Section>
