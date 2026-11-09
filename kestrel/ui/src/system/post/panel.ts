import type Clutter from 'gi://Clutter';

import { t } from '../../shared/i18n/index.js';
import { openSettings } from '../settingsPages.js';
import type { Peer, Transfer, Visibility } from './client.js';
import { deviceIcon, size } from './format.js';
import type { Post } from './post.js';
import { openPopup, type Popup, type View } from './popups.js';

const WIDTH = 360;

/** Post's panel from the taskbar: what's on the way, who's nearby and sending to them, and who can find this computer. */
export class PostPanel {
  private popup: Popup | null = null;
  private chosen: string | null = null;
  private draft = '';
  private readonly stopWatching: () => void;

  constructor(private readonly post: Post) {
    this.stopWatching = post.client.onChanged(() => this.refresh());
  }

  get open(): boolean {
    return !!this.popup?.open;
  }

  toggle(anchor: Clutter.Actor): void {
    if (this.popup?.open) {
      this.popup.dispose();
      return;
    }
    this.chosen = null;
    this.draft = '';
    this.post.client.scan();
    this.popup = openPopup(this.post.desktop, {
      anchor, kind: 'panel', title: t('post'), width: WIDTH, content: this.view(),
      onClosed: () => (this.popup = null),
    });
  }

  destroy(): void {
    this.stopWatching();
    this.popup?.dispose();
  }

  private refresh(): void {
    if (this.popup?.open) this.popup.update(this.view());
  }

  private close(): void {
    this.popup?.dispose();
  }

  private view(): View {
    const transfers = [...this.post.client.transfers.values()].map(transfer => this.transfer(transfer));
    const device = this.chosen && this.post.client.devices.find(peer => peer.id === this.chosen);
    const body = this.chosen ? this.device(device || null) : this.nearby();
    return {
      type: 'column', spacing: 12,
      children: [...transfers, ...transfers.length ? [{ type: 'separator' } as const] : [], ...body, { type: 'separator' }, ...this.visibility()],
    };
  }

  private transfer(transfer: Transfer): View {
    const title = transfer.direction === 'out'
      ? transfer.text ? t('post-sending-text', { device: transfer.device }) : t('post-sending', { count: transfer.files, device: transfer.device })
      : t('post-receiving', { count: transfer.files, device: transfer.device });
    const moving = transfer.stage === 'moving';
    const caption = moving
      ? t('post-progress', { done: size(transfer.done), size: size(transfer.size) })
      : transfer.stage === 'waiting' ? t('post-waiting-for', { device: transfer.device }) : t('post-asks-for-pin', { device: transfer.device });
    return {
      type: 'column', spacing: 6,
      children: [
        {
          type: 'row', spacing: 8,
          children: [
            ...transfer.stage === 'waiting' ? [{ type: 'spinner' } as const] : [],
            { type: 'column', spacing: 2, children: [{ type: 'text', text: title, maxWidth: 250 }, { type: 'text', text: caption, style: 'caption' }] },
            { type: 'spacer' },
            { type: 'button', icon: 'window-close-symbolic', label: t('post-cancel'), iconOnly: true, style: 'flat', onActivate: () => this.post.client.cancel(transfer.id) },
          ],
        },
        ...moving ? [{ type: 'progress', value: transfer.size ? transfer.done / transfer.size : 1 } as const] : [],
      ],
    };
  }

  private nearby(): View[] {
    const { devices, scanning } = this.post.client;
    const notes = this.notes();
    if (!devices.length) return [scanning ? this.looking() : this.nobody(), ...notes];
    return [{ type: 'column', spacing: 2, children: devices.map(peer => this.peer(peer)) }, ...notes];
  }

  /** Why devices nearby may not find this computer: a public network, or another app on LocalSend's port. */
  private notes(): View[] {
    const { client, network } = this.post;
    return [
      ...network.public ? [t('post-public-network')] : [],
      ...client.listening ? [] : [t('post-port-taken')],
    ].map(text => ({ type: 'text', text, style: 'caption', maxWidth: WIDTH - 40 }) as const);
  }

  private peer(peer: Peer): View {
    return {
      type: 'item', title: peer.alias, subtitle: peer.model || undefined, icon: deviceIcon(peer),
      onActivate: () => {
        this.chosen = peer.id;
        this.refresh();
      },
    };
  }

  private looking(): View {
    return { type: 'row', spacing: 8, children: [{ type: 'spinner' }, { type: 'text', text: t('post-looking') }] };
  }

  private nobody(): View {
    return {
      type: 'column', spacing: 8,
      children: [
        { type: 'text', text: t('post-nobody') },
        { type: 'text', text: t('post-nobody-hint'), style: 'caption', maxWidth: WIDTH - 40 },
        { type: 'row', children: [{ type: 'button', label: t('post-look-again'), onActivate: () => this.post.client.scan() }] },
      ],
    };
  }

  private device(peer: Peer | null): View[] {
    const back: View = {
      type: 'row', spacing: 8,
      children: [
        { type: 'button', icon: 'go-previous-symbolic', label: t('post-back'), iconOnly: true, style: 'flat', onActivate: () => this.back() },
        ...peer ? [{ type: 'icon', icon: deviceIcon(peer), size: 20 } as const] : [],
        { type: 'text', text: peer?.alias ?? t('post-gone'), style: 'title', maxWidth: 260 },
      ],
    };
    if (!peer) return [back];
    const choose = async (folder: boolean) => {
      const paths = await this.post.chooseFiles(t('post-choose-for', { device: peer.alias }), folder);
      if (paths.length) this.post.client.send(peer.id, paths);
    };
    const sendText = () => {
      if (!this.draft.trim()) return;
      this.post.client.sendText(peer.id, this.draft);
      this.close();
    };
    return [
      back,
      {
        type: 'row', spacing: 8,
        children: [
          { type: 'button', icon: 'document-open-symbolic', label: t('post-send-files'), onActivate: () => void choose(false).catch(logError) },
          { type: 'button', icon: 'folder-symbolic', label: t('post-send-folder'), onActivate: () => void choose(true).catch(logError) },
        ],
      },
      {
        type: 'row', spacing: 8,
        children: [
          { type: 'entry', label: t('post-message'), placeholder: t('post-message-placeholder'), text: '', onChanged: text => this.typed(text), onSubmit: sendText },
          { type: 'button', icon: 'mail-send-symbolic', label: t('post-send-text'), iconOnly: true, style: 'primary', disabled: !this.draft.trim(), onActivate: sendText },
        ],
      },
    ];
  }

  private typed(text: string): void {
    const wasEmpty = !this.draft.trim();
    this.draft = text;
    if (wasEmpty !== !text.trim()) this.refresh();
  }

  private back(): void {
    this.chosen = null;
    this.draft = '';
    this.refresh();
  }

  private visibility(): View[] {
    const { client } = this.post;
    const shown = client.visibility;
    const choices: [Visibility, string][] = [
      ['no-one', t('post-visibility-no-one')], ['your-devices', t('post-visibility-your-devices')], ['everyone', t('post-visibility-everyone')],
    ];
    return [
      { type: 'text', text: t('post-who-finds', { name: client.alias }), style: 'caption', maxWidth: WIDTH - 40 },
      {
        type: 'column', spacing: 2,
        children: choices.map(([visibility, title]) => ({
          type: 'item', title, checked: visibility === shown,
          onActivate: () => (client.visibility = visibility),
        }) as const),
      },
      {
        type: 'row', children: [{ type: 'spacer' }, {
          type: 'button', label: t('post-settings'), style: 'flat',
          onActivate: () => {
            this.close();
            openSettings('post');
          },
        }],
      },
    ];
  }
}
