<script lang="ts">
	import { t } from '@luft/i18n';
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import type { TerminalSession } from '#lib/terminal/session.svelte.js';
	import type { TerminalMenu, Workspace } from '#lib/workspace/workspace.svelte.js';

	interface Props {
		menu: TerminalMenu;
		workspace: Workspace;
	}

	let { menu, workspace }: Props = $props();

	let hasSelection = $derived(menu.session.terminal.hasSelection());

	function run(action: (session: TerminalSession) => unknown) {
		const { session } = menu;
		workspace.menu = null;
		action(session);
		if (workspace.searching !== session) session.focus();
	}
</script>

<ContextMenu at={{ x: menu.x, y: menu.y }} onclose={() => (workspace.menu = null)}>
	<MenuItem disabled={!hasSelection} onclick={() => run((session) => session.copySelection())}>{t('tern-menu-copy')}</MenuItem>
	<MenuItem onclick={() => run(async (session) => workspace.paste(session, await navigator.clipboard.readText()))}>{t('tern-menu-paste')}</MenuItem>
	<MenuItem onclick={() => run((session) => session.terminal.selectAll())}>{t('tern-menu-select-all')}</MenuItem>
	<MenuItem onclick={() => run((session) => (workspace.searching = session))}>{t('tern-menu-find')}</MenuItem>
	<MenuSeparator />
	<MenuItem onclick={() => run(() => workspace.split('row'))}>{t('tern-menu-split-right')}</MenuItem>
	<MenuItem onclick={() => run(() => workspace.split('column'))}>{t('tern-menu-split-down')}</MenuItem>
	<MenuSeparator />
	<MenuItem onclick={() => run((session) => session.terminal.clear())}>{t('tern-menu-clear')}</MenuItem>
	<MenuItem danger onclick={() => run((session) => workspace.closeSession(session))}>{t('tern-menu-close')}</MenuItem>
</ContextMenu>
