<script lang="ts">
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem, Segmented, WindowControls } from '@luft/ui';
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

<header class="drag-region flex h-[60px] flex-none items-center gap-3 pr-4 pl-6">
	<div class="min-w-0 flex-1">
		<h1 class="truncate text-[14px] font-semibold">{t('document-title')}</h1>
		<p class="truncate text-[12px] text-[var(--text-muted)]">
			{count ? t('document-pages', { count }) : t('document-empty')}
		</p>
	</div>
	<div class="flex items-center gap-2" data-no-drag>
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
	</div>
	<div class="ml-1"><WindowControls /></div>
</header>
