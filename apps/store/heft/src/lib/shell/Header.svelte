<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import Settings from '@lucide/svelte/icons/settings-2';
	import { t } from '@luft/i18n';
	import { IconButton, WindowControls } from '@luft/ui';
	import SettingsDialog from '#lib/settings/SettingsDialog.svelte';
	import { session } from '#lib/app/session.svelte.js';
	import Tabs from './Tabs.svelte';

	let settingsOpen = $state(false);

	async function close() {
		await session.settle();
		await appWindow.close();
	}
</script>

<header class="drag-region flex h-[50px] flex-none items-center gap-3 pr-4 pl-3">
	<Tabs />
	<div class="flex-1"></div>
	<div data-no-drag>
		<IconButton icon={Settings} label={t('settings-title')} onclick={() => (settingsOpen = true)} />
	</div>
	<WindowControls onclose={() => void close()} />
</header>

{#if settingsOpen}
	<SettingsDialog onclose={() => (settingsOpen = false)} />
{/if}
