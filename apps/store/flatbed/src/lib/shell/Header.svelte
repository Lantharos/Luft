<script lang="ts">
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem, Segmented, TitleBar } from '@luft/ui';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import type { Mode } from '#lib/bindings.js';
	import { flatbed } from '#lib/app/flatbed.svelte.js';

	let { onsave, onclear }: { onsave: () => void; onclear: () => void } = $props();

	const modes = $derived<{ value: Mode; label: string }[]>([
		{ value: 'colour', label: t('mode-colour') },
		{ value: 'grey', label: t('mode-grey') },
		{ value: 'blackAndWhite', label: t('mode-black-and-white') }
	]);
	let count = $derived(flatbed.pages.length);
</script>

<TitleBar compact title={t('document-title')} detail={count ? t('document-pages', { count }) : t('document-empty')}>
	{#snippet actions()}
		<Segmented label={t('mode-label')} options={modes} value={flatbed.document.mode} onchange={(mode) => flatbed.setMode(mode)} />
		<button type="button" class="button primary" disabled={!count || flatbed.scanning} onclick={onsave}>{t('save-open')}</button>
		<MenuButton label={t('more')} align="end" class="icon-button">
			{#snippet trigger()}<Ellipsis size={18} />{/snippet}
			{#snippet children(close)}
				<MenuItem
					danger
					disabled={!count || flatbed.scanning}
					onclick={() => {
						close();
						onclear();
					}}>{t('document-clear')}</MenuItem
				>
			{/snippet}
		</MenuButton>
	{/snippet}
</TitleBar>
