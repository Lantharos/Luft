import type { Component } from 'svelte';
import Box from '@lucide/svelte/icons/box';
import Cpu from '@lucide/svelte/icons/cpu';
import Eye from '@lucide/svelte/icons/eye';
import File from '@lucide/svelte/icons/file';
import Globe from '@lucide/svelte/icons/globe';
import History from '@lucide/svelte/icons/history';
import RefreshCw from '@lucide/svelte/icons/refresh-cw';
import Shield from '@lucide/svelte/icons/shield';
import ShieldAlert from '@lucide/svelte/icons/shield-alert';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import SquareTerminal from '@lucide/svelte/icons/square-terminal';
import User from '@lucide/svelte/icons/user';
import Users from '@lucide/svelte/icons/users';
import { t } from '@luft/i18n';
import { bytes } from '@luft/ui';
import { describe } from '#lib/app/permissions.js';
import type { OpenedFile } from '#lib/bindings.js';
import type { FileInstall } from '#lib/files/install.svelte.js';

export interface Fact {
	icon: Component;
	text: string;
	warning?: boolean;
}

const host = (url: string) => new URL(url).host;

function version({ existing, versionChange }: FileInstall): Fact[] {
	if (!existing) return [];
	if (versionChange === 'none') return [{ icon: History, text: t('install-installed-same') }];
	if (versionChange === 'up') return [{ icon: History, text: t('install-installed-older', { version: existing.version ?? '' }) }];
	if (versionChange === 'down') return [{ icon: History, text: t('install-installed-newer', { version: existing.version ?? '' }) }];
	return [{ icon: History, text: t('install-installed') }];
}

function trust(file: OpenedFile, install: FileInstall): Fact[] {
	if (file.kind === 'package') {
		const facts: Fact[] = [];
		if (install.source && install.sourceName)
			facts.push({ icon: RefreshCw, text: t(install.source.added ? 'install-from-source' : 'install-adds-source', { source: install.sourceName }) });
		else if (file.repositoryError) facts.push({ icon: ShieldAlert, text: t('install-source-unusable'), warning: true });
		if (!install.source) facts.push(file.verified ? { icon: ShieldCheck, text: t('install-signed') } : { icon: ShieldAlert, text: t('install-unsigned'), warning: true });
		facts.push(file.system ? { icon: Users, text: t('install-for-everyone') } : { icon: SquareTerminal, text: t('install-tool') });
		return facts;
	}
	if (file.kind === 'deb') {
		return [file.runsHere ? { icon: Box, text: t('install-ubuntu') } : { icon: Cpu, text: t('install-wrong-computer'), warning: true }];
	}
	if (file.kind === 'appImage') {
		const sensitive = file.permissions ? describe(file.permissions).filter((entry) => entry.notable).length : 0;
		return [
			file.unsandboxed ? { icon: ShieldAlert, text: t('install-asks-full-access'), warning: true } : { icon: Shield, text: t('install-sandboxed') },
			...(sensitive ? [{ icon: Eye, text: t('install-sensitive', { count: sensitive }) }] : []),
			{ icon: User, text: t('install-for-you') }
		];
	}
	if (file.kind === 'flatpakBundle')
		return [
			install.broad.length ? { icon: ShieldAlert, text: t('install-asks-more'), warning: true } : { icon: Shield, text: t('install-sandboxed') },
			file.origin ? { icon: RefreshCw, text: t('install-updates-from', { host: host(file.origin) }) } : { icon: RefreshCw, text: t('install-updates-by-file') }
		];
	if (file.kind === 'flatpakRef') return [{ icon: Globe, text: t('install-installs-from', { host: host(file.url) }) }];
	return [{ icon: Globe, text: t('install-adds-flatpak-source', { host: host(file.url) }) }];
}

function origin(file: OpenedFile, path: string): Fact {
	const name = path.split('/').at(-1) ?? path;
	const size = 'size' in file ? file.size : null;
	return { icon: File, text: size ? t('install-file-size', { file: name, size: bytes(size) }) : name };
}

export function facts(install: FileInstall): Fact[] {
	const file = install.file;
	if (!file) return [];
	return [...version(install), ...trust(file, install), origin(file, install.path)];
}
