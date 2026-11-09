import { t } from '../../shared/i18n/index.js';
import type { Peer } from './client.js';
import { deviceIcon, link } from './format.js';
import type { Post } from './post.js';
import { openPopup, type Popup, type View } from './popups.js';

const WIDTH = 380;
const SHOWN_IN_NOTIFICATION = 240;

/**
 * Text someone sends. From one of your devices it goes straight to the clipboard, when people want that; from anyone
 * else it waits in a window until they copy it.
 */
export class Messages {
  constructor(private readonly post: Post) {}

  received(from: Peer, text: string, trusted: boolean): void {
    if (trusted && this.post.client.settings.get_boolean('copy-text')) {
      this.post.copyText(text);
      this.notifyCopied(from, text);
    } else {
      this.show(from, text);
    }
  }

  private notifyCopied(from: Peer, text: string): void {
    const url = link(text);
    this.post.notify({
      title: t('post-text-copied', { device: from.alias }),
      body: text.length > SHOWN_IN_NOTIFICATION ? `${text.slice(0, SHOWN_IN_NOTIFICATION)}…` : text,
      actions: url ? [{ label: t('post-open-link'), onActivate: () => this.post.open(url) }] : [],
    });
  }

  private show(from: Peer, text: string): void {
    const url = link(text);
    let popup: Popup | null = null;
    const content: View = {
      type: 'column', spacing: 12,
      children: [
        {
          type: 'row', spacing: 10,
          children: [{ type: 'icon', icon: deviceIcon(from), size: 24 }, { type: 'text', text: t('post-sent-text', { device: from.alias }), style: 'title', maxWidth: WIDTH - 80 }],
        },
        { type: 'text', text, maxWidth: WIDTH - 40 },
        {
          type: 'row', spacing: 8,
          children: [
            { type: 'spacer' },
            ...url ? [{ type: 'button', label: t('post-open-link'), onActivate: () => this.post.open(url) } as const] : [],
            {
              type: 'button', label: t('post-copy'), style: 'primary',
              onActivate: () => {
                this.post.copyText(text);
                popup?.dispose();
              },
            },
          ],
        },
      ],
    };
    popup = openPopup(this.post.desktop, { anchor: 'top-right', kind: 'window', width: WIDTH, chime: true, title: t('post'), content });
  }
}
