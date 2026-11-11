
import { type Page, pageKeywords, type PageId } from '../../../../packages/web/settings-pages/pages.js';
import { inEnglish, locale, t } from '../shared/i18n/index.js';
import { openUri } from '../shared/apps/launch.js';

export { PAGES as SETTINGS_PAGES, type Page as SettingsPage, type PageId as SettingsPageId, pageTitle as settingsPageTitle } from '../../../../packages/web/settings-pages/pages.js';

export type SettingsLink = PageId | `${PageId}/${string}`;

export const settingsPageKeywords = (page: Page, copilotKey: boolean): string[] =>
  pageKeywords(page, copilotKey, t, locale() === 'en' ? undefined : inEnglish);

export function openSettings(page: SettingsLink | null = null): void {
  openUri(`kestrel-settings:${page ?? ''}`);
}
