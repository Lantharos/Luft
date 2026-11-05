<script lang="ts">
	import { t } from '@luft/i18n';
	import { basename, Segmented } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { session } from '#lib/state/session.svelte.js';
	import Field from './fields/Field.svelte';
	import Toggle from './fields/Toggle.svelte';

	const places = $derived([
		{ value: 'beside', label: t('output-beside') },
		{ value: 'folder', label: session.preferences.folder ? basename(session.preferences.folder) : t('output-folder') }
	]);

	async function choosePlace(place: string) {
		if (place === 'beside') return session.setPreferences({ folder: null });
		const [folder] = await commands.chooseFolder();
		if (folder) session.setPreferences({ folder });
	}
</script>

<Field label={t('output-where')}>
	<Segmented label={t('output-where')} options={places} value={session.preferences.folder ? 'folder' : 'beside'} onchange={choosePlace} />
</Field>
<Toggle label={t('output-keep-times')} checked={session.preferences.keepTimes} onchange={(value) => session.setPreferences({ keepTimes: value })} />
