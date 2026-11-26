<script lang="ts">
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import ColorDialog from '#lib/dialogs/ColorDialog.svelte';
	import type { ToolSettings } from './settings.svelte';

	let { settings }: { settings: ToolSettings } = $props();
	let editing = $state<'primary' | 'secondary' | null>(null);
</script>

<div class="relative h-[46px] w-[42px] flex-none">
	<button type="button" class="well right-0.5 bottom-0.5" style:background={settings.secondary} aria-label={t('easel-color-secondary')} onclick={() => (editing = 'secondary')} {@attach tooltip(t('easel-color-secondary'))}></button>
	<button type="button" class="well top-0.5 left-0.5" style:background={settings.primary} aria-label={t('easel-color-primary')} onclick={() => (editing = 'primary')} {@attach tooltip(t('easel-color-primary'))}></button>
</div>

{#if editing}
	{@const which = editing}
	<ColorDialog
		title={t(which === 'primary' ? 'easel-color-primary' : 'easel-color-secondary')}
		color={settings[which]}
		onchoose={(color) => (settings[which] = color)}
		onclose={() => (editing = null)}
	/>
{/if}

<style>
	.well {
		position: absolute;
		height: 24px;
		width: 24px;
		border-radius: var(--radius-pill);
		box-shadow: 0 0 0 2px var(--sidebar-solid), inset 0 0 0 1px rgba(255, 255, 255, 0.12);
	}
</style>
