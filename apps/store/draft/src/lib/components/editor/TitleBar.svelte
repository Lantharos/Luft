<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import { t } from '@luft/i18n';
	import { tooltip, WindowControls } from '@luft/ui';
	import { useApp } from '#lib/app/context.js';
	import TabStrip from './TabStrip.svelte';

	const app = useApp();
	let settings = $derived(app.settings.value);
</script>

<header class="drag-region flex h-[52px] flex-none items-center gap-1 pr-4 pl-3">
	{#if app.workspace.browsing}
		<button
			type="button"
			class="icon-button"
			aria-label={settings.sidebar ? t('draft-sidebar-hide') : t('draft-sidebar-show')}
			aria-pressed={settings.sidebar}
			onclick={() => app.settings.update({ sidebar: !settings.sidebar })}
			{@attach tooltip(settings.sidebar ? t('draft-sidebar-hide') : t('draft-sidebar-show'))}
		>
			<PanelLeft size={17} />
		</button>
	{/if}
	<TabStrip />
	{#if app.markdown}
		<button
			type="button"
			class={['icon-button', settings.preview && 'is-on']}
			aria-label={t('draft-preview')}
			aria-pressed={settings.preview}
			onclick={() => app.togglePreview()}
			{@attach tooltip(t('draft-preview'))}
		>
			<BookOpen size={17} />
		</button>
	{/if}
	<div class="ml-2">
		<WindowControls onclose={() => void app.quit()} />
	</div>
</header>

<style>
	.icon-button.is-on {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
