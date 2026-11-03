<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Select } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import { KESTREL_SCHEMA, SettingsGroup } from '#lib/state/gsettings.svelte.js';

	const PLACES = ['before-apps', 'after-apps', 'beside-tray', 'start', 'end'] as const;
	const DEFAULT_PLACE = 'beside-tray';

	let { element }: { element: string } = $props();

	const taskbar = new SettingsGroup<{ 'taskbar-style': string; 'taskbar-element-places': Record<string, string> }>(KESTREL_SCHEMA, [
		'taskbar-style',
		'taskbar-element-places'
	]);

	let separate = $derived(taskbar.values['taskbar-style'] === 'separate');
	let places = $derived(taskbar.values['taskbar-element-places'] ?? {});
	let options = $derived(PLACES.map((value) => ({ value, label: t(`settings-extensions-place-${value}`) })));

	function place(value: string) {
		void taskbar.set('taskbar-element-places', { ...places, [element]: value });
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
		<Select label={t('settings-extensions-place')} {options} value={places[element] ?? DEFAULT_PLACE} onchange={place} />
	</Row>
{/if}
