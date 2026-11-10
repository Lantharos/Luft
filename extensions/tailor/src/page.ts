import type { Extension, PageItem, PageSection } from '@luft/extension-api';

export const APPS = ['spotify', 'steam', 'vesktop'] as const;
export type AppId = (typeof APPS)[number];
export type Status = { state: string; detail?: string };
export type States = Partial<Record<AppId, Status>>;
export type Report = { found: string[] } | ({ app: string } & Status);

const SPOTIFY_IN_SCHELF = 'schelf:app/com.spotify.Client';
const RETRYABLE = ['no-spicetify', 'no-spotify', 'no-prefs', 'read-only', 'not-stock', 'too-new', 'first-run', 'failed', 'stopped'];

const messages = ({ t }: Extension<'helper'>): Record<AppId, Record<string, string>> => ({
  spotify: {
    'no-spicetify': t('spotify-no-spicetify'),
    'no-spotify': t('spotify-no-spotify'),
    'no-prefs': t('spotify-no-prefs'),
    'read-only': t('spotify-read-only'),
    'not-stock': t('spotify-not-stock'),
    'too-new': t('spotify-too-new'),
    working: t('spotify-working'),
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

function status(extension: Extension<'helper'>, app: AppId, { state, detail }: Status, retry: () => void): PageItem[] {
  const { t, open } = extension;
  const title = state === 'stopped' ? t('stopped') : messages(extension)[app][state] ?? '';
  const described = detail ? { description: detail } : {};
  if (!RETRYABLE.includes(state)) return [{ type: 'row', title, ...described }];
  const again: PageItem = { type: 'button', title, ...described, label: t('try-again'), onActivate: retry };
  if (app !== 'spotify' || state !== 'read-only') return [again];
  return [again, { type: 'button', title: t('spotify-for-you'), label: t('open-schelf'), onActivate: () => open(SPOTIFY_IN_SCHELF) }];
}

export function describePage(extension: Extension<'helper'>, states: States, retry: () => void): void {
  const { settings, settingsPage, t } = extension;
  settingsPage.describe((): PageSection[] => {
    const found = settings.get<string[]>('found');
    if (!found.length) return [{ items: [{ type: 'text', text: t('nothing-found') }] }];
    return APPS.filter(app => found.includes(app)).map((app): PageSection => {
      const state = states[app];
      const items: PageItem[] = [{ setting: app }];
      if (state && settings.get<boolean>(app)) items.push(...status(extension, app, state, retry));
      return { items };
    });
  });
}
