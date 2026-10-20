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
	{ id: 'icloud', name: 'iCloud Drive', description: 'settings-accounts-provider-icloud', icon: ICloudMark, signIn: 'apple' },
	{ id: 'onedrive', name: 'OneDrive', description: 'settings-accounts-provider-onedrive', icon: Cloud, signIn: 'browser' },
	{ id: 'dropbox', name: 'Dropbox', description: 'settings-accounts-provider-dropbox', icon: DropboxMark, signIn: 'browser' },
	{ id: 'nextcloud', name: 'Nextcloud', description: 'settings-accounts-provider-nextcloud', icon: NextcloudMark, signIn: 'nextcloud' },
	{ id: 'webdav', name: 'WebDAV', description: 'settings-accounts-provider-webdav', icon: Server, signIn: 'password' }
];

export const provider = (id: Provider) => PROVIDERS.find((entry) => entry.id === id)!;
