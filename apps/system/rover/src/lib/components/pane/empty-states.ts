import { t } from '@luft/i18n';
import CircleAlert from '@lucide/svelte/icons/circle-alert';
import Clock from '@lucide/svelte/icons/clock';
import FolderOpen from '@lucide/svelte/icons/folder-open';
import FolderX from '@lucide/svelte/icons/folder-x';
import Lock from '@lucide/svelte/icons/lock';
import Search from '@lucide/svelte/icons/search';
import type { EmptyAction, EmptyStateProps } from '@luft/ui';
import type { EntryContext } from '#lib/file-manager/view/entry-props.js';

const PERMISSION = /permission denied|os error 13|not permitted/i;
const MISSING = /does not exist|no such file|os error 2\b/i;

export function emptyStateFor({ manager, chooser }: EntryContext): EmptyStateProps {
	const back: EmptyAction = manager.tabs.canGoBack
		? { label: t('rover-empty-go-back'), run: manager.goBack }
		: { label: t('rover-empty-go-home'), run: () => manager.navigate(manager.homePath) };
	if (manager.error && PERMISSION.test(manager.error)) {
		return { icon: Lock, title: t('rover-empty-denied-title'), message: t('rover-empty-denied-message'), action: back };
	}
	if (manager.error && MISSING.test(manager.error)) {
		return { icon: FolderX, title: t('rover-empty-missing-title'), message: t('rover-empty-missing-message'), action: back };
	}
	if (manager.error) return { icon: CircleAlert, title: t('rover-empty-failed-title'), message: manager.error, action: back, tone: 'danger' };
	if (manager.searchQuery.trim()) {
		return {
			icon: Search,
			title: t('rover-empty-no-matches-title'),
			message: t('rover-empty-no-matches-message', { query: manager.searchQuery.trim() }),
			action: { label: t('rover-empty-clear-search'), run: () => (manager.searchQuery = '') }
		};
	}
	if (manager.view === 'recent') return { icon: Clock, title: t('rover-empty-recent-title'), message: t('rover-empty-recent-message') };
	if (chooser) return { icon: FolderOpen, title: t('rover-empty-folder-title') };
	return { icon: FolderOpen, title: t('rover-empty-folder-title'), action: { label: t('rover-new-folder'), run: () => manager.startCreate('folder') } };

}
