import type { Popup, PopupAnchor, View } from '@luft/extension-api';

import { deviceIcon, size } from './format.js';
import type { Peer, Pigeon, Transfer } from './pigeon.js';

const WIDTH = 360;

/** The panel from the taskbar and quick settings: what's on the way, who's nearby, and sending to them. */
export class Panel {
  private popup: Popup | null = null;
  private chosen: string | null = null;
  private dropped: string[] = [];
  private draft = '';

  constructor(private readonly pigeon: Pigeon) {
    pigeon.onChanged(() => this.refresh());
  }

  /** Opens on the devices, with files dropped on the taskbar waiting to go. */
  show(anchor: PopupAnchor, { dropped = [] }: { dropped?: string[] } = {}): void {
    this.dropped = dropped;
    this.chosen = null;
    this.draft = '';
    this.popup?.dispose();
    this.pigeon.scan();
    this.popup = this.pigeon.extension.popups.open({
      anchor, title: this.pigeon.extension.t('pigeon'), width: WIDTH, content: this.view(),
      onClosed: () => (this.popup = null),
    });
  }

  private refresh(): void {
    if (this.popup?.open) this.popup.update(this.view());
  }

  private close(): void {
    this.popup?.dispose();
  }

  private view(): View {
    const transfers = [...this.pigeon.transfers.values()].map(transfer => this.transfer(transfer));
    const device = this.chosen && this.pigeon.devices.find(peer => peer.id === this.chosen);
    const body = this.chosen ? this.device(device || null) : this.nearby();
    return {
      type: 'column', spacing: 12,
      children: [...transfers, ...transfers.length ? [{ type: 'separator' } as const] : [], ...body, { type: 'separator' }, this.receiving()],
    };
  }

  private transfer(transfer: Transfer): View {
    const { t } = this.pigeon.extension;
    const title = transfer.direction === 'out'
      ? transfer.text ? t('sending-text', { device: transfer.device }) : t('sending', { count: transfer.files, device: transfer.device })
      : t('receiving', { count: transfer.files, device: transfer.device });
    const moving = transfer.stage === 'moving';
    const caption = moving
      ? t('progress', { done: size(transfer.done), size: size(transfer.size) })
      : transfer.stage === 'waiting' ? t('waiting-for', { device: transfer.device }) : t('asks-for-pin', { device: transfer.device });
    return {
      type: 'column', spacing: 6,
      children: [
        {
          type: 'row', spacing: 8,
          children: [
            ...transfer.stage === 'waiting' ? [{ type: 'spinner' } as const] : [],
            { type: 'column', spacing: 2, children: [{ type: 'text', text: title, maxWidth: 250 }, { type: 'text', text: caption, style: 'caption' }] },
            { type: 'spacer' },
            { type: 'button', icon: 'window-close-symbolic', label: t('cancel'), iconOnly: true, style: 'flat', onActivate: () => this.pigeon.cancel(transfer.id) },
          ],
        },
        ...moving ? [{ type: 'progress', value: transfer.size ? transfer.done / transfer.size : 1 } as const] : [],
      ],
    };
  }

  private nearby(): View[] {
    const { t } = this.pigeon.extension;
    const { devices, scanning, listening } = this.pigeon;
    const intro: View[] = this.dropped.length ? [{ type: 'text', text: t('send-dropped', { count: this.dropped.length }), style: 'title' }] : [];
    const warning: View[] = listening ? [] : [{ type: 'text', text: t('port-taken'), style: 'caption' }];
    if (!devices.length) return [...intro, ...warning, scanning ? this.looking() : this.nobody()];
    return [...intro, { type: 'column', spacing: 2, children: devices.map(peer => this.peer(peer)) }, ...warning];
  }

  private peer(peer: Peer): View {
    return {
      type: 'item', title: peer.alias, subtitle: peer.model, icon: deviceIcon(peer),
      onActivate: () => {
        if (!this.dropped.length) {
          this.chosen = peer.id;
          this.refresh();
          return;
        }
        this.pigeon.send(peer.id, this.dropped);
        this.close();
      },
    };
  }

  private looking(): View {
    return { type: 'row', spacing: 8, children: [{ type: 'spinner' }, { type: 'text', text: this.pigeon.extension.t('looking') }] };
  }

  private nobody(): View {
    const { t } = this.pigeon.extension;
    return {
      type: 'column', spacing: 8,
      children: [
        { type: 'text', text: t('nobody') },
        { type: 'text', text: t('nobody-hint'), style: 'caption', maxWidth: WIDTH - 40 },
        { type: 'row', children: [{ type: 'button', label: t('look-again'), onActivate: () => this.pigeon.scan() }] },
      ],
    };
  }

  private device(peer: Peer | null): View[] {
    const { t, chooseFiles } = this.pigeon.extension;
    const back: View = {
      type: 'row', spacing: 8,
      children: [
        { type: 'button', icon: 'go-previous-symbolic', label: t('back'), iconOnly: true, style: 'flat', onActivate: () => this.back() },
        ...peer ? [{ type: 'icon', icon: deviceIcon(peer), size: 20 } as const] : [],
        { type: 'text', text: peer?.alias ?? t('gone'), style: 'title', maxWidth: 260 },
      ],
    };
    if (!peer) return [back];
    const choose = async (folder: boolean) => {
      const paths = await chooseFiles({ title: t('choose-for', { device: peer.alias }), folder, multiple: true });
      if (paths.length) this.pigeon.send(peer.id, paths);
    };
    const sendText = () => {
      if (!this.draft.trim()) return;
      this.pigeon.sendText(peer.id, this.draft);
      this.close();
    };
    return [
      back,
      {
        type: 'row', spacing: 8,
        children: [
          { type: 'button', icon: 'document-open-symbolic', label: t('send-files'), onActivate: () => void choose(false) },
          { type: 'button', icon: 'folder-symbolic', label: t('send-folder'), onActivate: () => void choose(true) },
        ],
      },
      {
        type: 'row', spacing: 8,
        children: [
          { type: 'entry', label: t('message'), placeholder: t('message-placeholder'), text: '', onChanged: text => this.typed(text), onSubmit: sendText },
          { type: 'button', icon: 'mail-send-symbolic', label: t('send-text'), iconOnly: true, style: 'primary', disabled: !this.draft.trim(), onActivate: sendText },
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

  private receiving(): View {
    const { t, settings } = this.pigeon.extension;
    const label = this.pigeon.alias ? t('receive-as', { name: this.pigeon.alias }) : t('receive');
    return { type: 'switch', label, checked: settings.get<boolean>('receive'), onToggled: on => settings.set('receive', on) };
  }
}
