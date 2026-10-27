import * as KestrelUi from '../../../kestrelUi.js';
import * as Main from '../../../core/main.js';

import { Source } from './notification.js';

let systemNotificationSource: Source | null = null;

export function getSystemSource(): Source {
  if (systemNotificationSource) return systemNotificationSource;

  const source = new Source({ iconName: 'cog-wheel-symbolic' });
  KestrelUi.localized(source, () => (source.title = KestrelUi.t('messages-system-source')));
  systemNotificationSource = source;
  source.connect('destroy', () => {
    systemNotificationSource = null;
  });
  Main.messageTray.add(source);
  return source;
}
