import type { Popup, View } from '@luft/extension-api';

import { deviceIcon, ICON, link } from './format.js';
import type { Peer, Pigeon } from './pigeon.js';

const WIDTH = 380;
const SHOWN_IN_NOTIFICATION = 240;

/**
 * Text someone sends. From a trusted device it goes straight to the clipboard, when people want that; from anyone
 * else it waits in a window until they copy it.
 */
export class Messages {
  constructor(private readonly pigeon: Pigeon) {}

  received(from: Peer, text: string, trusted: boolean): void {
    const { settings, clipboard } = this.pigeon.extension;
    if (trusted && settings.get<boolean>('copy-text')) {
      clipboard.setText(text);
      this.notifyCopied(from, text);
    } else {
      this.show(from, text);
    }
  }

  private notifyCopied(from: Peer, text: string): void {
    const { t, notifications, open } = this.pigeon.extension;
    const url = link(text);
    notifications.send({
      icon: ICON,
      title: t('text-copied', { device: from.alias }),
      body: text.length > SHOWN_IN_NOTIFICATION ? `${text.slice(0, SHOWN_IN_NOTIFICATION)}…` : text,
      actions: url ? [{ label: t('open-link'), onActivate: () => open(url) }] : [],
    });
  }

  private show(from: Peer, text: string): void {
    const { t, popups, clipboard, open } = this.pigeon.extension;
    const url = link(text);
    let popup: Popup | null = null;
    const content: View = {
      type: 'column', spacing: 12,
      children: [
        {
          type: 'row', spacing: 10,
          children: [{ type: 'icon', icon: deviceIcon(from), size: 24 }, { type: 'text', text: t('sent-text', { device: from.alias }), style: 'title', maxWidth: WIDTH - 80 }],
        },
        { type: 'text', text, maxWidth: WIDTH - 40 },
        {
          type: 'row', spacing: 8,
          children: [
            { type: 'spacer' },
            ...url ? [{ type: 'button', label: t('open-link'), onActivate: () => open(url) } as const] : [],
            {
              type: 'button', label: t('copy'), style: 'primary',
              onActivate: () => {
                clipboard.setText(text);
                popup?.dispose();
              },
            },
          ],
        },
      ],
    };
    popup = popups.open({ anchor: 'top-right', kind: 'window', width: WIDTH, title: t('pigeon'), content });
  }
}
