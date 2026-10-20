import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';

import { type Page, pageKeywords, type PageId } from '../../../../apps/settings/src/lib/panels/pages.js';
import { inEnglish, locale, t } from '../shared/i18n/index.js';

export { PAGES as SETTINGS_PAGES, type Page as SettingsPage, type PageId as SettingsPageId, pageTitle as settingsPageTitle } from '../../../../apps/settings/src/lib/panels/pages.js';

export const settingsPageKeywords = (page: Page, copilotKey: boolean): string[] =>
  pageKeywords(page, copilotKey, t, locale() === 'en' ? undefined : inEnglish);

export function openSettings(page: PageId | null = null): void {
  Gio.AppInfo.launch_default_for_uri(`kestrel-settings:${page ?? ''}`, (global as unknown as Shell.Global).create_app_launch_context(0, -1));
}
