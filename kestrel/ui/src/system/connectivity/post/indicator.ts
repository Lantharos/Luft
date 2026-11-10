import Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { ContextMenus } from '../../../desktop/menus/contextMenus.js';
import type { DragDelegate } from '../../../shared/popups/dndTargets.js';
import { localized, t } from '../../../shared/i18n/index.js';
import { sendDropped } from '../send/dropped.js';
import { ICON, percent } from './format.js';
import { PostPanel } from './panel.js';
import type { Post } from './post.js';

const ICON_SIZE = 16;

function moving(post: Post): number | null {
  const transfers = [...post.client.transfers.values()].filter(transfer => transfer.stage === 'moving');
  if (!transfers.length) return null;
  const size = transfers.reduce((sum, transfer) => sum + transfer.size, 0);
  return size ? transfers.reduce((sum, transfer) => sum + transfer.done, 0) / size : 1;
}

export class PostIndicator {
  readonly actor: St.Button;
  private readonly label = new St.Label({ style_class: 'kestrel-post-progress', y_align: Clutter.ActorAlign.CENTER, visible: false });
  private readonly box = new St.BoxLayout({ style_class: 'kestrel-post-icons', y_align: Clutter.ActorAlign.CENTER });
  private readonly panel: PostPanel;
  private readonly stopWatching: () => void;

  constructor(private readonly post: Post, menus: ContextMenus) {
    this.panel = new PostPanel(post);
    this.box.add_child(new St.Icon({ icon_name: ICON, icon_size: ICON_SIZE }));
    this.box.add_child(this.label);
    this.actor = new St.Button({
      name: 'kestrel-taskbar-post', style_class: 'kestrel-status-button kestrel-panel-status kestrel-post-button', child: this.box,
      can_focus: true, track_hover: true,
    });
    localized(this.actor, () => (this.actor.accessible_name = t('post')));
    this.actor.connect('clicked', () => this.panel.toggle(this.actor));
    menus.bind(this.actor, () => [{ label: t('post-settings'), run: () => menus.settings('post') }]);
    (this.actor as St.Button & { _delegate?: DragDelegate })._delegate = {
      fileDrop: {
        takes: () => true,
        hover: over => (over ? this.actor.add_style_pseudo_class('dropping') : this.actor.remove_style_pseudo_class('dropping')),
        drop: paths => sendDropped(paths),
      },
    };
    this.stopWatching = post.client.onChanged(() => this.sync());
    this.actor.connect('destroy', () => {
      this.stopWatching();
      this.panel.destroy();
    });
    this.sync();
  }

  orient(orientation: Clutter.Orientation): void {
    this.box.orientation = orientation;
  }

  private sync(): void {
    this.actor.visible = this.post.client.open;
    const fraction = moving(this.post);
    this.label.visible = fraction !== null;
    if (fraction !== null) this.label.text = percent(fraction);
  }
}
