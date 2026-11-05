import type { Extension, PageItem, PageSection } from '@luft/extension-api';

export const APPS = ['spotify', 'steam', 'vesktop'] as const;
export type AppId = (typeof APPS)[number];
export type States = Partial<Record<AppId, string>>;
export type Report = { found: string[] } | { app: string; state: string };

const RETRYABLE = ['no-spicetify', 'no-spotify', 'first-run', 'failed'];

const messages = ({ t }: Extension<'helper'>): Record<AppId, Record<string, string>> => ({
  spotify: {
    'no-spicetify': t('spotify-no-spicetify'),
    'no-spotify': t('spotify-no-spotify'),
    failed: t('spotify-failed'),
    restart: t('spotify-restart'),
    ready: t('spotify-ready'),
    connected: t('spotify-connected'),
  },
  steam: {
    'first-run': t('steam-first-run'),
    failed: t('steam-failed'),
    ready: t('steam-ready'),
  },
  vesktop: {
    'first-run': t('vesktop-first-run'),
    failed: t('vesktop-failed'),
    'quit-once': t('vesktop-quit-once'),
    ready: t('vesktop-ready'),
  },
});

function status(extension: Extension<'helper'>, app: AppId, state: string, retry: () => void): PageItem {
  const title = messages(extension)[app][state] ?? '';
  return RETRYABLE.includes(state)
    ? { type: 'button', title, label: extension.t('try-again'), onActivate: retry }
    : { type: 'row', title };
}

export function describePage(extension: Extension<'helper'>, states: States, retry: () => void): void {
  const { settings, settingsPage, t } = extension;
  settingsPage.describe((): PageSection[] => {
    const found = settings.get<string[]>('found');
    if (!found.length) return [{ items: [{ type: 'text', text: t('nothing-found') }] }];
    return APPS.filter(app => found.includes(app)).map((app): PageSection => {
      const state = states[app];
      const items: PageItem[] = [{ setting: app }];
      if (state && settings.get<boolean>(app)) items.push(status(extension, app, state, retry));
      return { items };
    });
  });
}
