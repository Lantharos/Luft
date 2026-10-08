<script lang="ts">
	import { Row, Section, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import DelayRow from './DelayRow.svelte';

	type Keyboard = {
		'stickykeys-enable': boolean;
		'slowkeys-enable': boolean;
		'slowkeys-delay': number;
		'bouncekeys-enable': boolean;
		'bouncekeys-delay': number;
	};

	const applications = useSettings<{ 'screen-keyboard-enabled': boolean }>('org.gnome.desktop.a11y.applications', ['screen-keyboard-enabled']);
	const keyboard = useSettings<Keyboard>('org.gnome.desktop.a11y.keyboard', [
		'stickykeys-enable',
		'slowkeys-enable',
		'slowkeys-delay',
		'bouncekeys-enable',
		'bouncekeys-delay'
	]);

	let opened = $state<boolean | null>(null);

	let slow = $derived(keyboard.values['slowkeys-enable'] ?? false);
	let bounce = $derived(keyboard.values['bouncekeys-enable'] ?? false);
	let assists = $derived([keyboard.values['stickykeys-enable'], slow, bounce].filter(Boolean).length);
	let expanded = $derived(opened ?? assists > 0);

	const seconds = (milliseconds: number | undefined) => (milliseconds ?? 300) / 1000;
	const milliseconds = (seconds: number) => Math.round(seconds * 1000);
</script>

<Section title="Typing">
	<Row title="On-screen keyboard">
		<Switch
			label="On-screen keyboard"
			checked={applications.values['screen-keyboard-enabled'] ?? false}
			onchange={(on) => applications.set('screen-keyboard-enabled', on)}
		/>
	</Row>
	<Row title="Typing assist" {expanded} onclick={() => (opened = !expanded)}>
		{assists ? `${assists} on` : 'Off'}
	</Row>
	{#if expanded}
		<Row title="Sticky keys">
			<Switch
				label="Sticky keys"
				checked={keyboard.values['stickykeys-enable'] ?? false}
				onchange={(on) => keyboard.set('stickykeys-enable', on)}
			/>
		</Row>
		<Row title="Slow keys">
			<Switch label="Slow keys" checked={slow} onchange={(on) => keyboard.set('slowkeys-enable', on)} />
		</Row>
		{#if slow}
			<DelayRow
				title="Slow keys delay"
				seconds={seconds(keyboard.values['slowkeys-delay'])}
				min={0.1}
				max={2}
				onchange={(value) => keyboard.set('slowkeys-delay', milliseconds(value))}
			/>
		{/if}
		<Row title="Bounce keys">
			<Switch label="Bounce keys" checked={bounce} onchange={(on) => keyboard.set('bouncekeys-enable', on)} />
		</Row>
		{#if bounce}
			<DelayRow
				title="Bounce keys delay"
				seconds={seconds(keyboard.values['bouncekeys-delay'])}
				min={0.1}
				max={2}
				onchange={(value) => keyboard.set('bouncekeys-delay', milliseconds(value))}
			/>
		{/if}
	{/if}
</Section>
