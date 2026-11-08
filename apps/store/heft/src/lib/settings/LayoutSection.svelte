<script lang="ts">
	import { t } from '@luft/i18n';
	import { appearance, Segmented } from '@luft/ui';
	import { settings, type PageFlow, type ToolbarPlace } from '#lib/app/settings.svelte.js';

	const places = (): { value: ToolbarPlace; label: string }[] => [
		{ value: 'top', label: t('settings-toolbar-top') },
		{ value: 'side', label: t('settings-toolbar-side') },
		{ value: 'dock', label: t('settings-toolbar-dock') }
	];

	const flows = (): { value: PageFlow; label: string }[] => [
		{ value: 'continuous', label: t('settings-pages-continuous') },
		{ value: 'single', label: t('settings-pages-single') }
	];
</script>

<section class="flex flex-col gap-2">
	<h3 class="text-[14px] font-semibold">{t('settings-toolbar')}</h3>
	<Segmented label={t('settings-toolbar')} value={settings.values.toolbar} options={places()} onchange={(value) => settings.set('toolbar', value)} />
	<p class="text-[12px] text-(--text-muted)">{appearance.posture === 'tablet' ? t('settings-toolbar-tablet-now') : t('settings-toolbar-tablet')}</p>
	<h3 class="mt-2 text-[14px] font-semibold">{t('settings-pages')}</h3>
	<Segmented label={t('settings-pages')} value={settings.values.pages} options={flows()} onchange={(value) => settings.set('pages', value)} />
	<p class="text-[12px] text-(--text-muted)">{t('settings-pages-body')}</p>
</section>
