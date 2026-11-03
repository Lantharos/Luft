import type { Enable, Popup } from '@luft/extension-api';

import { compact, expanded } from './element.js';
import { Following } from './following.js';
import { describePage } from './page.js';
import { nowPlaying } from './popup.js';

type Granted = 'taskbar' | 'media' | 'popups';

const enable: Enable<Granted> = extension => {
  const { media, settings } = extension;
  let popup: Popup | null = null;
  let stopWatching: (() => void) | null = null;

  const shown = () => {
    const player = following.player;
    return !!player && (player.playing || !settings.get<boolean>('hide-paused'));
  };
  const changed = () => {
    element.update({ shown: shown() });
    if (popup?.open) popup.update(nowPlaying(extension, following));
  };
  const following = new Following(extension, () => changed());

  const element = extension.taskbar.addElement({
    key: 'now-playing',
    label: extension.t('now-playing'),
    shown: shown(),
    content: layout => compact(extension, following, layout),
    expanded: layout => expanded(extension, following, layout),
    onExpandedChanged: grown => {
      if (grown) stopWatching ??= following.watch();
      else if (!popup?.open) {
        stopWatching?.();
        stopWatching = null;
      }
    },
    onClick: () => {
      if (popup?.open) {
        popup.dispose();
        return;
      }
      const watching = following.watch();
      popup = extension.popups.open({
        anchor: element,
        title: extension.t('now-playing'),
        width: 340,
        content: nowPlaying(extension, following),
        onClosed: () => watching(),
      });
    },
    menu: ['settings'],
  });

  media.onChanged(() => {
    following.sync();
    changed();
  });
  media.output.onChanged(() => {
    if (popup?.open) popup.update(nowPlaying(extension, following));
  });
  settings.onChanged(changed);
  describePage(extension, following);
  following.sync();
};

export default enable;
