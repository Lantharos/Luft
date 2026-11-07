import type { Popup, View } from '@luft/extension-api';

import { deviceIcon, fileName, fileUri, folderOf, ICON, size } from './format.js';
import type { Finished, Offer, Pigeon, Transfer } from './pigeon.js';

const FILES_LISTED = 4;
const WIDTH = 380;
const PICTURE = /\.(png|jpe?g|webp|gif)$/i;

type Stage =
  | { kind: 'asking'; trust: boolean }
  | { kind: 'moving'; transfer: Transfer | null }
  | { kind: 'ended'; finished: Finished };

/** One transfer someone offers: whether to take it, then how far it got, then where it went. */
class OfferWindow {
  private stage: Stage = { kind: 'asking', trust: false };
  private readonly popup: Popup;

  constructor(private readonly pigeon: Pigeon, private readonly offer: Offer, closed: () => void) {
    this.popup = pigeon.extension.popups.open({
      anchor: 'top-right', kind: 'window', width: WIDTH, chime: true, title: pigeon.extension.t('pigeon'), content: this.view(),
      onClosed: () => {
        if (this.stage.kind === 'asking') pigeon.decline(offer.id);
        closed();
      },
    });
  }

  get open(): boolean {
    return this.popup.open;
  }

  get ended(): boolean {
    return this.stage.kind === 'ended';
  }

  close(): void {
    this.popup.dispose();
  }

  moved(transfer: Transfer): void {
    this.show({ kind: 'moving', transfer });
  }

  end(finished: Finished): void {
    this.show({ kind: 'ended', finished });
  }

  private show(stage: Stage): void {
    this.stage = stage;
    this.popup.update(this.view());
  }

  private accept(trust: boolean): void {
    if (trust) this.pigeon.trust(this.offer.from);
    this.pigeon.accept(this.offer.id);
    this.show({ kind: 'moving', transfer: null });
  }

  private view(): View {
    const { t } = this.pigeon.extension;
    const { from, files } = this.offer;
    const header: View = {
      type: 'row', spacing: 10,
      children: [
        { type: 'icon', icon: deviceIcon(from), size: 24 },
        {
          type: 'column', spacing: 2,
          children: [
            { type: 'text', text: from.alias, style: 'title', maxWidth: WIDTH - 80 },
            { type: 'text', text: t(this.stage.kind === 'asking' ? 'offers' : 'files-size', { count: files.length, size: size(this.offer.size) }), style: 'caption' },
          ],
        },
      ],
    };
    return { type: 'column', spacing: 12, children: [header, ...this.body()] };
  }

  private body(): View[] {
    switch (this.stage.kind) {
      case 'asking': return this.asking(this.stage.trust);
      case 'moving': return this.moving(this.stage.transfer);
      case 'ended': return this.result(this.stage.finished);
    }
  }

  private asking(trust: boolean): View[] {
    const { t } = this.pigeon.extension;
    const { from, files } = this.offer;
    const listed: View[] = files.slice(0, FILES_LISTED).map(file => ({
      type: 'row', spacing: 8,
      children: [{ type: 'text', text: file.name, maxWidth: WIDTH - 120 }, { type: 'spacer' }, { type: 'text', text: size(file.size), style: 'caption' }],
    }));
    if (files.length > FILES_LISTED) listed.push({ type: 'text', text: t('and-more', { count: files.length - FILES_LISTED }), style: 'caption' });
    return [
      { type: 'column', spacing: 4, children: listed },
      ...from.verified ? [{
        type: 'switch', label: t('always-accept', { device: from.alias }), checked: trust,
        onToggled: (checked: boolean) => this.show({ kind: 'asking', trust: checked }),
      } as const] : [],
      {
        type: 'row', spacing: 8,
        children: [
          { type: 'spacer' },
          { type: 'button', label: t('decline'), onActivate: () => this.popup.dispose() },
          { type: 'button', label: t('accept'), style: 'primary', onActivate: () => this.accept(trust) },
        ],
      },
    ];
  }

  private moving(transfer: Transfer | null): View[] {
    const { t } = this.pigeon.extension;
    const done = transfer?.done ?? 0;
    return [
      { type: 'progress', value: this.offer.size ? done / this.offer.size : 1 },
      {
        type: 'row', spacing: 8,
        children: [
          { type: 'text', text: t('progress', { done: size(done), size: size(this.offer.size) }), style: 'caption' },
          { type: 'spacer' },
          { type: 'button', label: t('cancel'), onActivate: () => this.pigeon.cancel(this.offer.id) },
        ],
      },
    ];
  }

  private result(finished: Finished): View[] {
    if (finished.outcome !== 'done') return [{ type: 'text', text: endedText(this.pigeon, { ...finished, device: this.offer.from.alias }), maxWidth: WIDTH - 40 }];
    const buttons = savedActions(this.pigeon, finished.saved).map(({ label, primary, onActivate }): View => ({
      type: 'button', label, style: primary ? 'primary' : 'default', onActivate,
    }));
    return [{ type: 'row', spacing: 8, children: [{ type: 'text', text: savedIn(this.pigeon, finished.saved), maxWidth: WIDTH - 200 }, { type: 'spacer' }, ...buttons] }];
  }
}

function endedText(pigeon: Pigeon, { outcome, device, saved }: Finished): string {
  const { t } = pigeon.extension;
  if (outcome === 'cancelled-there') return t('stopped-by', { device });
  if (outcome === 'cancelled') return t('you-stopped');
  return saved.length ? t('some-arrived', { count: saved.length }) : t('nothing-arrived', { device });
}

function savedFolder(pigeon: Pigeon, saved: string[]): string {
  return saved[0] ? folderOf(saved[0]) : pigeon.folder;
}

function savedIn(pigeon: Pigeon, saved: string[]): string {
  return pigeon.extension.t('saved-in', { folder: fileName(savedFolder(pigeon, saved)) });
}

function savedActions(pigeon: Pigeon, saved: string[]): { label: string; primary: boolean; onActivate(): void }[] {
  const { t, open } = pigeon.extension;
  return [
    { label: t('show-folder'), primary: false, onActivate: () => open(fileUri(savedFolder(pigeon, saved))) },
    ...saved.length === 1 ? [{ label: t('open'), primary: true, onActivate: () => open(fileUri(saved[0]!)) }] : [],
  ];
}

/** What's sent to this computer: asking first unless the device is trusted, then showing it arrive. */
export class Incoming {
  private readonly windows = new Map<string, OfferWindow>();

  constructor(private readonly pigeon: Pigeon) {}

  /** Closes the results of finished transfers, which would otherwise cover what comes next. */
  clearEnded(): void {
    for (const window of this.windows.values()) if (window.ended) window.close();
  }

  offer(offer: Offer): void {
    this.clearEnded();
    this.windows.set(offer.id, new OfferWindow(this.pigeon, offer, () => this.windows.delete(offer.id)));
  }

  transfer(transfer: Transfer): void {
    this.windows.get(transfer.id)?.moved(transfer);
  }

  finished(finished: Finished, last: Transfer | undefined): void {
    const { settings, clipboard } = this.pigeon.extension;
    const window = this.windows.get(finished.id);
    if (finished.outcome === 'done' && finished.saved.length === 1 && PICTURE.test(finished.saved[0]!) && settings.get<boolean>('copy-picture'))
      void clipboard.setImage(finished.saved[0]!);
    if (window?.open) window.end(finished);
    else if (last) this.notify(finished, last);
  }

  private notify(finished: Finished, last: Transfer): void {
    const { t, notifications } = this.pigeon.extension;
    if (finished.outcome === 'cancelled') return;
    const done = finished.outcome === 'done';
    notifications.send({
      icon: ICON,
      title: done ? t('received', { count: last.files, device: finished.device }) : endedText(this.pigeon, finished),
      body: done ? savedIn(this.pigeon, finished.saved) : undefined,
      actions: done ? savedActions(this.pigeon, finished.saved).map(({ label, onActivate }) => ({ label, onActivate })) : [],
    });
  }
}
