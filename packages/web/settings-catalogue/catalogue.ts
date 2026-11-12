import type { PageId } from '@luft/settings-pages';
import source from './catalogue.json' with { type: 'json' };

export type Value = boolean | number | string;

export type Condition = { in: Value[] } | { not: Value[] } | { above: number } | { 'not-above': number };

export interface Option {
	value: Value;
	label?: string;
	name?: string;
	note?: string;
	when?: Record<string, Condition>;
	set?: Record<string, Value | null>;
}

export type SystemSetting = 'developer-tools' | 'usb-protection' | 'update-channel' | 'update-schedule' | 'download-updates' | 'time-zone' | 'automatic-time';

export type ServiceSetting = 'crash-reports';

export interface Setting {
	id: string;
	page?: PageId;
	title?: string;
	name?: string;
	developer?: boolean;
	type?: 'switch' | 'choice' | 'text';
	key?: string;
	unit?: 'seconds' | 'milliseconds';
	range?: { min: number; max: number };
	system?: SystemSetting;
	service?: ServiceSetting;
	options?: Option[];
}

export interface SettingsOnly {
	id: string;
	page: PageId;
	title: string;
	why: string;
}

export const SYSTEM_SETTINGS: SystemSetting[] = ['developer-tools', 'usb-protection', 'update-channel', 'update-schedule', 'download-updates', 'time-zone', 'automatic-time'];

export const SETTINGS = source.settings as Setting[];

export const SETTINGS_ONLY = source.settingsOnly as SettingsOnly[];

export function splitKey(key: string): { schema: string; key: string } {
	const [schema, name] = key.split(' ');
	return { schema, key: name };
}

export const isMapped = (setting: Setting) => !!setting.options?.some((option) => option.set);

export function matches(condition: Condition, value: Value): boolean {
	if ('in' in condition) return condition.in.includes(value);
	if ('not' in condition) return !condition.not.includes(value);
	if ('above' in condition) return typeof value === 'number' && value > condition.above;
	return typeof value === 'number' && value <= condition['not-above'];
}
