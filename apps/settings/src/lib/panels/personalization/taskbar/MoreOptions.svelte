<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Select, Switch } from '@luft/ui';
	import type { SettingsGroup } from '#lib/state/gsettings.svelte.js';
	import { alignments, AUTO_HIDE, type TaskbarSettings } from './options';

	interface Props {
		settings: SettingsGroup<TaskbarSettings>;
		displays: number;
	}

	let { settings, displays }: Props = $props();

	let values = $derived(settings.values);
	let shown = $derived(values['taskbar-shown'] ?? true);
	let everyDisplay = $derived((values['taskbar-displays'] ?? 'all') === 'all');
	let alignmentOptions = $derived(alignments(values['taskbar-position'] ?? 'bottom').map((option) => ({ value: option.value, label: t(option.label) })));
	let autoHide = $derived(AUTO_HIDE.map((option) => ({ value: option.value, label: t(option.label) })));
</script>

<Section>
	<Row title={t('settings-taskbar-shown')} description={shown ? undefined : t('settings-taskbar-hidden-description')}>
		<Switch label={t('settings-taskbar-shown')} checked={shown} onchange={(on) => settings.set('taskbar-shown', on)} />
	</Row>
	{#if shown}
		<Row title={t('settings-taskbar-alignment')}>
			<Segmented label={t('settings-taskbar-alignment')} options={alignmentOptions} value={values['taskbar-alignment'] ?? 'center'} onchange={(value) => settings.set('taskbar-alignment', value)} />
		</Row>
		<Row title={t('settings-taskbar-auto-hide')}>
			<Select label={t('settings-taskbar-auto-hide')} options={autoHide} value={values['taskbar-auto-hide'] ?? 'never'} onchange={(value) => settings.set('taskbar-auto-hide', value)} />
		</Row>
	{/if}
</Section>

{#if shown}
	<Section>
		<Row title={t('settings-taskbar-show-pinned')}>
			<Switch label={t('settings-taskbar-show-pinned')} checked={values['taskbar-show-pinned'] ?? true} onchange={(on) => settings.set('taskbar-show-pinned', on)} />
		</Row>
		<Row title={t('settings-taskbar-per-workspace')}>
			<Switch label={t('settings-taskbar-per-workspace')} checked={values['taskbar-windows-per-workspace'] ?? false} onchange={(on) => settings.set('taskbar-windows-per-workspace', on)} />
		</Row>
		{#if displays > 1}
			<Row title={t('settings-taskbar-every-display')}>
				<Switch label={t('settings-taskbar-every-display')} checked={everyDisplay} onchange={(on) => settings.set('taskbar-displays', on ? 'all' : 'primary')} />
			</Row>
			{#if everyDisplay}
				<Row title={t('settings-taskbar-per-display')}>
					<Switch label={t('settings-taskbar-per-display')} checked={values['taskbar-windows-per-display'] ?? false} onchange={(on) => settings.set('taskbar-windows-per-display', on)} />
				</Row>
			{/if}
		{/if}
	</Section>
{/if}
