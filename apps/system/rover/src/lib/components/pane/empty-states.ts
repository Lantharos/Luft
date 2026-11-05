import CircleAlert from '@lucide/svelte/icons/circle-alert';
import Clock from '@lucide/svelte/icons/clock';
import FolderOpen from '@lucide/svelte/icons/folder-open';
import FolderX from '@lucide/svelte/icons/folder-x';
import Lock from '@lucide/svelte/icons/lock';
import Search from '@lucide/svelte/icons/search';
import type { Component } from 'svelte';
import type { EntryContext } from '#lib/file-manager/view/entry-props.js';

export type EmptyAction = {
	label: string;
	run: () => unknown;
};

export type EmptyStateProps = {
	icon: Component;
	title: string;
	message?: string;
	action?: EmptyAction;
	tone?: 'neutral' | 'danger';
};

const PERMISSION = /permission denied|os error 13|not permitted/i;
const MISSING = /does not exist|no such file|os error 2\b/i;

export function emptyStateFor({ manager, chooser }: EntryContext): EmptyStateProps {
	const back: EmptyAction = manager.tabs.canGoBack
		? { label: 'Go back', run: manager.goBack }
		: { label: 'Go home', run: () => manager.navigate(manager.homePath) };
	if (manager.error && PERMISSION.test(manager.error)) {
		return { icon: Lock, title: 'You can’t open this folder', message: 'You don’t have permission to see what’s inside.', action: back };
	}
	if (manager.error && MISSING.test(manager.error)) {
		return { icon: FolderX, title: 'This folder isn’t here anymore', message: 'It may have been moved, renamed or deleted.', action: back };
	}
	if (manager.error) return { icon: CircleAlert, title: 'This folder couldn’t be opened', message: manager.error, action: back, tone: 'danger' };
	if (manager.searchQuery.trim()) {
		return {
			icon: Search,
			title: 'No matches',
			message: `Nothing here matches “${manager.searchQuery.trim()}”.`,
			action: { label: 'Clear search', run: () => (manager.searchQuery = '') }
		};
	}
	if (manager.view === 'recent') return { icon: Clock, title: 'Nothing recent yet', message: 'Files you open show up here.' };
	if (chooser) return { icon: FolderOpen, title: 'This folder is empty' };
	return { icon: FolderOpen, title: 'This folder is empty', action: { label: 'New folder', run: () => manager.startCreate('folder') } };
}
