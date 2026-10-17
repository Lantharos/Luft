import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';

export { PAGES as SETTINGS_PAGES, type Page as SettingsPage, type PageId as SettingsPageId } from '../../../../apps/settings/src/lib/panels/pages.js';
import type { PageId } from '../../../../apps/settings/src/lib/panels/pages.js';

export function openSettings(page: PageId | null = null): void {
  Gio.AppInfo.launch_default_for_uri(`kestrel-settings:${page ?? ''}`, (global as unknown as Shell.Global).create_app_launch_context(0, -1));
}
