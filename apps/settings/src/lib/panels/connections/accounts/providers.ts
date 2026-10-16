import type { Component } from 'svelte';
import Cloud from '@lucide/svelte/icons/cloud';
import Server from '@lucide/svelte/icons/server';
import type { Provider } from './api';
import DropboxMark from './marks/DropboxMark.svelte';
import ICloudMark from './marks/ICloudMark.svelte';
import NextcloudMark from './marks/NextcloudMark.svelte';

export type SignInKind = 'browser' | 'apple' | 'nextcloud' | 'password';

export interface ProviderInfo {
	id: Provider;
	name: string;
	description: string;
	icon: Component<{ size?: number }>;
	signIn: SignInKind;
}

export const PROVIDERS: ProviderInfo[] = [
	{ id: 'icloud', name: 'iCloud Drive', description: 'Your Apple Account, confirmed with a code from your iPhone, iPad or Mac', icon: ICloudMark, signIn: 'apple' },
	{ id: 'onedrive', name: 'OneDrive', description: 'A personal, work or school Microsoft account, in your browser', icon: Cloud, signIn: 'browser' },
	{ id: 'dropbox', name: 'Dropbox', description: 'A Dropbox account, in your browser', icon: DropboxMark, signIn: 'browser' },
	{ id: 'nextcloud', name: 'Nextcloud', description: 'Your own or your organization’s server', icon: NextcloudMark, signIn: 'nextcloud' },
	{ id: 'webdav', name: 'WebDAV', description: 'Any server that speaks WebDAV', icon: Server, signIn: 'password' }
];

export const provider = (id: Provider) => PROVIDERS.find((entry) => entry.id === id)!;
