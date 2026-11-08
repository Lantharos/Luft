<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Row, Switch } from '@luft/ui';
	import type { Monitor, PenDevice } from '#lib/bindings.js';
	import RowValue from '#lib/components/RowValue.svelte';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import ChoiceDialog from './ChoiceDialog.svelte';

	interface Props {
		tablet: PenDevice;
		monitors: Monitor[];
	}

	let { tablet, monitors }: Props = $props();

	type Tablet = { output: string[]; 'keep-aspect': boolean };

	const ALL = '';

	const settings = useSettings<Tablet>('org.gnome.desktop.peripherals.tablet', ['output', 'keep-aspect'], untrack(() => `/org/gnome/desktop/peripherals/tablets/${tablet.id}/`));

	let choosing = $state(false);

	const edid = (key: string) => {
		const first = key.indexOf(':');
		const last = key.lastIndexOf(':');
		return [key.slice(0, first), key.slice(first + 1, last), key.slice(last + 1)];
	};

	let mapped = $derived((settings.values.output ?? []).join(':'));
	let display = $derived(monitors.find((monitor) => monitor.key === mapped));
	let options = $derived([{ value: ALL, label: t('settings-pen-tablet-all-displays') }, ...monitors.map((monitor) => ({ value: monitor.key, label: monitor.name }))]);

	async function choose(key: string) {
		choosing = false;
		await settings.set('output', key === ALL ? ['', '', ''] : edid(key));
	}
</script>

<Row title={tablet.name} description={t('settings-pen-tablet-description')} onclick={() => (choosing = true)}>
	<RowValue text={display?.name ?? t('settings-pen-tablet-all-displays')} />
</Row>
<Row title={t('settings-pen-tablet-proportions')} description={t('settings-pen-tablet-proportions-description')}>
	<Switch label={t('settings-pen-tablet-proportions')} checked={settings.values['keep-aspect'] ?? false} onchange={(on) => settings.set('keep-aspect', on)} />
</Row>

{#if choosing}
	<ChoiceDialog
		title={t('settings-pen-tablet-choose', { name: tablet.name })}
		description={t('settings-pen-tablet-choose-description')}
		{options}
		current={display ? mapped : ALL}
		keys=""
		onchoose={choose}
		onclose={() => (choosing = false)}
	/>
{/if}
