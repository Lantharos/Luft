import type { Extension, PageSection } from '@luft/extension-api';

export type State = 'starting' | 'no-spicetify' | 'no-spotify' | 'failed' | 'restart' | 'ready' | 'connected';

const RETRYABLE: readonly State[] = ['no-spicetify', 'no-spotify', 'failed'];

const message = ({ t }: Extension<'helper'>, state: State) => ({
  starting: t('state-starting'),
  'no-spicetify': t('state-no-spicetify'),
  'no-spotify': t('state-no-spotify'),
  failed: t('state-failed'),
  restart: t('state-restart'),
  ready: t('state-ready'),
  connected: t('state-connected'),
})[state];

export function describePage(extension: Extension<'helper'>, state: () => State, retry: () => void): void {
  const { t } = extension;
  extension.settingsPage.describe((): PageSection[] => {
    const title = message(extension, state());
    return [{
      items: [RETRYABLE.includes(state())
        ? { type: 'button', title, label: t('try-again'), onActivate: retry }
        : { type: 'row', title }],
    }];
  });
}
