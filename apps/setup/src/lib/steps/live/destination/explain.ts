import { t } from '@luft/i18n';
import { bytes } from '@luft/ui';
import type { Drive, LinuxSystem, WindowsVolume } from '#lib/api/installer.js';

const GIB = 1024 ** 3;

const WINDOWS_BLOCKS = {
	bitlocker: 'setup-windows-bitlocker',
	hibernated: 'setup-windows-hibernated',
	dirty: 'setup-windows-dirty'
} as const;

const SYSTEM_BLOCKS = {
	startup: 'setup-replace-blocked-startup',
	'no-account': 'setup-replace-blocked-no-account',
	running: 'setup-replace-blocked-running',
	'read-only': 'setup-replace-blocked-read-only'
} as const;

const LAYOUT_BLOCKS: Partial<Record<LinuxSystem['layout'], string>> = {
	encrypted: 'setup-replace-blocked-encrypted',
	single: 'setup-replace-blocked-single'
};

export function windowsName(windows: WindowsVolume) {
	return windows.version ?? 'Windows';
}

export function whyWindowsCantShrink(windows: WindowsVolume, needed: number): string {
	if (!windows.blocked) return '';
	if (windows.blocked === 'full') return t('setup-windows-full', { size: bytes(Math.max(needed - windows.room, GIB)) });
	return t(WINDOWS_BLOCKS[windows.blocked]);
}

export function describeDrive(drive: Drive) {
	if (drive.windows) return t('setup-drive-has-windows', { windows: windowsName(drive.windows) });
	if (drive.partitions === 0) return t('setup-drive-empty');
	return t('setup-drive-partitions', { count: drive.partitions });
}

export function whyNotReplaced(system: LinuxSystem): string {
	if (!system.blocked) return '';
	if (system.blocked === 'layout') return t(LAYOUT_BLOCKS[system.layout] ?? 'setup-replace-blocked-layout');
	return t(SYSTEM_BLOCKS[system.blocked]);
}
