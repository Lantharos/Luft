<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Select } from '@luft/ui';
	import {
		BUILT_IN_ELEMENTS,
		completeArrangement,
		DEFAULT_ARRANGEMENT,
		ELEMENT_PLACES,
		parseArrangement,
		placeElement,
		placeOf,
		storeArrangement,
		type ElementPlace,
		type StoredArrangement
	} from '@luft/ui/taskbar';
	import { app } from '#lib/state/app.svelte.js';
	import { KESTREL_SCHEMA, SettingsGroup } from '#lib/state/gsettings.svelte.js';

	let { element }: { element: string } = $props();

	const taskbar = new SettingsGroup<{ 'taskbar-style': string; 'taskbar-arrangement': StoredArrangement }>(KESTREL_SCHEMA, [
		'taskbar-style',
		'taskbar-arrangement'
	]);

	let separate = $derived(taskbar.values['taskbar-style'] === 'separate');
	let arrangement = $derived(
		completeArrangement(parseArrangement(taskbar.values['taskbar-arrangement'] ?? storeArrangement(DEFAULT_ARRANGEMENT)), [...BUILT_IN_ELEMENTS, element])
	);
	const LABELS: Record<ElementPlace, string> = {
		'before-apps': 'settings-extensions-place-before-apps',
		'after-apps': 'settings-extensions-place-after-apps',
		'beside-tray': 'settings-extensions-place-beside-tray',
		start: 'settings-extensions-place-start',
		end: 'settings-extensions-place-end'
	};

	let options = $derived(ELEMENT_PLACES.map((value) => ({ value, label: t(LABELS[value]) })));

	function place(value: string) {
		void taskbar.set('taskbar-arrangement', storeArrangement(placeElement(arrangement, element, value as ElementPlace)));
	}
</script>

{#if !taskbar.loaded}
	<Row title={t('settings-extensions-place')} />
{:else if separate}
	<Row title={t('settings-extensions-place')} description={t('settings-extensions-place-islands')}>
		<button type="button" class="button" onclick={() => app.open('taskbar')}>{t('settings-extensions-place-edit')}</button>
	</Row>
{:else}
	<Row title={t('settings-extensions-place')}>
		<Select label={t('settings-extensions-place')} {options} value={placeOf(arrangement, element) ?? ''} placeholder={t('settings-extensions-place-elsewhere')} onchange={place} />
	</Row>
{/if}
