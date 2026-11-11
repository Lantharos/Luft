import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import * as Main from '../../../core/main.js';
import { askFileChooser } from '../../../extensions/api/v1/desktop/picking.js';
import type { ExtensionHost } from '../../../extensions/host.js';
import { t } from '../../../shared/i18n/index.js';
import * as MessageTray from '../../../surfaces/notifications/tray/messageTray.js';
import { PostClient } from './client.js';
import { addFileAction } from './fileAction.js';
import { ICON } from './format.js';
import { Incoming } from './incoming.js';
import { Messages } from './messages.js';
import { NetworkType } from './network.js';
import { Outgoing } from './outgoing.js';
import { openUri } from '../../../shared/apps/launch.js';

Gio._promisify(Gio.File.prototype, 'load_contents_async');

interface Notice {
  title: string;
  body?: string;
  actions?: { label: string; onActivate(): void }[];
}

const PICTURES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };

export class Post {
  readonly client: PostClient;
  readonly network: NetworkType;
  private source: MessageTray.Source | null = null;
  private readonly stops: (() => void)[] = [];

  constructor(readonly desktop: ExtensionHost) {
    const incoming = new Incoming(this);
    const outgoing = new Outgoing(this);
    const messages = new Messages(this);
    this.client = new PostClient({
      text: (from, text, trusted) => {
        incoming.clearEnded();
        messages.received(from, text, trusted);
      },
      offer: offer => incoming.offer(offer),
      transfer: transfer => (transfer.direction === 'in' ? incoming.transfer(transfer) : outgoing.transfer(transfer)),
      finished: (finished, last) => (finished.direction === 'in' ? incoming.finished(finished, last) : outgoing.finished(finished, last)),
    });
    this.network = new NetworkType(() => this.client.changed());
    this.stops.push(addFileAction(this));
  }

  notify({ title, body, actions = [] }: Notice): void {
    const notification = new MessageTray.Notification({
      source: this.notificationSource(), title, body: body ?? '', gicon: new Gio.ThemedIcon({ name: ICON }),
    });
    for (const action of actions) notification.addAction(action.label, () => action.onActivate());
    notification.source!.addNotification(notification);
  }

  open(uri: string): void {
    openUri(uri);
  }

  async chooseFiles(title: string, folder: boolean): Promise<string[]> {
    const uris = await askFileChooser('OpenFile', title, { multiple: GLib.Variant.new_boolean(true), directory: GLib.Variant.new_boolean(folder) });
    return uris.map(uri => Gio.File.new_for_uri(uri).get_path()).filter((path): path is string => path !== null);
  }

  copyText(text: string): void {
    St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, text);
  }

  async copyPicture(path: string): Promise<void> {
    const type = PICTURES[path.slice(path.lastIndexOf('.') + 1).toLowerCase()];
    if (!type) return;
    const [contents] = await Gio.File.new_for_path(path).load_contents_async(null);
    St.Clipboard.get_default().set_content(St.ClipboardType.CLIPBOARD, type, new GLib.Bytes(contents));
  }

  private notificationSource(): MessageTray.Source {
    if (this.source) return this.source;
    const source = this.source = new MessageTray.Source({ title: t('post'), iconName: ICON });
    source.connect('destroy', () => {
      if (this.source === source) this.source = null;
    });
    Main.messageTray.add(source);
    return source;
  }

  destroy(): void {
    for (const stop of this.stops.splice(0)) stop();
    this.network.destroy();
    this.client.destroy();
    this.source?.destroy();
    if (current === this) current = null;
  }
}

let current: Post | null = null;

export function createPost(desktop: ExtensionHost): Post {
  return current = new Post(desktop);
}

export const currentPost = (): Post | null => current;
