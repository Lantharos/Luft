import { t } from '../../shared/i18n/index.js';
import type { Finished, Offer, Transfer } from './client.js';
import { deviceIcon, fileName, fileUri, folderOf, size } from './format.js';
import type { Post } from './post.js';
import { openPopup, type Popup, type View } from './popups.js';

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

  constructor(private readonly post: Post, private readonly offer: Offer, closed: () => void) {
    this.popup = openPopup(post.desktop, {
      anchor: 'top-right', kind: 'window', width: WIDTH, chime: true, title: t('post'), content: this.view(),
      onClosed: () => {
        if (this.stage.kind === 'asking') post.client.decline(offer.id);
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
    if (trust) this.post.client.trust(this.offer.from);
    this.post.client.accept(this.offer.id);
    this.show({ kind: 'moving', transfer: null });
  }

  private summary(): string {
    const counted = { count: this.offer.files.length, size: size(this.offer.size) };
    return this.stage.kind === 'asking' ? t('post-offers', counted) : t('post-files-size', counted);
  }

  private view(): View {
    const { from } = this.offer;
    const header: View = {
      type: 'row', spacing: 10,
      children: [
        { type: 'icon', icon: deviceIcon(from), size: 24 },
        {
          type: 'column', spacing: 2,
          children: [
            { type: 'text', text: from.alias, style: 'title', maxWidth: WIDTH - 80 },
            { type: 'text', text: this.summary(), style: 'caption' },
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
    const { from, files } = this.offer;
    const listed: View[] = files.slice(0, FILES_LISTED).map(file => ({
      type: 'row', spacing: 8,
      children: [{ type: 'text', text: file.name, maxWidth: WIDTH - 120 }, { type: 'spacer' }, { type: 'text', text: size(file.size), style: 'caption' }],
    }));
    if (files.length > FILES_LISTED) listed.push({ type: 'text', text: t('post-and-more', { count: files.length - FILES_LISTED }), style: 'caption' });
    return [
      { type: 'column', spacing: 4, children: listed },
      ...from.verified ? [{
        type: 'switch', label: t('post-always-accept', { device: from.alias }), checked: trust,
        onToggled: (checked: boolean) => this.show({ kind: 'asking', trust: checked }),
      } as const] : [],
      {
        type: 'row', spacing: 8,
        children: [
          { type: 'spacer' },
          { type: 'button', label: t('post-decline'), onActivate: () => this.popup.dispose() },
          { type: 'button', label: t('post-accept'), style: 'primary', onActivate: () => this.accept(trust) },
        ],
      },
    ];
  }

  private moving(transfer: Transfer | null): View[] {
    const done = transfer?.done ?? 0;
    return [
      { type: 'progress', value: this.offer.size ? done / this.offer.size : 1 },
      {
        type: 'row', spacing: 8,
        children: [
          { type: 'text', text: t('post-progress', { done: size(done), size: size(this.offer.size) }), style: 'caption' },
          { type: 'spacer' },
          { type: 'button', label: t('post-cancel'), onActivate: () => this.post.client.cancel(this.offer.id) },
        ],
      },
    ];
  }

  private result(finished: Finished): View[] {
    if (finished.outcome !== 'done') return [{ type: 'text', text: endedText({ ...finished, device: this.offer.from.alias }), maxWidth: WIDTH - 40 }];
    const buttons = savedActions(this.post, finished.saved).map(({ label, primary, onActivate }): View => ({
      type: 'button', label, style: primary ? 'primary' : 'default', onActivate,
    }));
    return [{ type: 'row', spacing: 8, children: [{ type: 'text', text: savedIn(this.post, finished.saved), maxWidth: WIDTH - 200 }, { type: 'spacer' }, ...buttons] }];
  }
}

function endedText({ outcome, device, saved }: Finished): string {
  if (outcome === 'cancelled-there') return t('post-stopped-by', { device });
  if (outcome === 'cancelled') return t('post-you-stopped');
  return saved.length ? t('post-some-arrived', { count: saved.length }) : t('post-nothing-arrived', { device });
}

function savedFolder(post: Post, saved: string[]): string {
  return saved[0] ? folderOf(saved[0]) : post.client.folder;
}

function savedIn(post: Post, saved: string[]): string {
  return t('post-saved-in', { folder: fileName(savedFolder(post, saved)) });
}

function savedActions(post: Post, saved: string[]): { label: string; primary: boolean; onActivate(): void }[] {
  return [
    { label: t('post-show-folder'), primary: false, onActivate: () => post.open(fileUri(savedFolder(post, saved))) },
    ...saved.length === 1 ? [{ label: t('post-open'), primary: true, onActivate: () => post.open(fileUri(saved[0]!)) }] : [],
  ];
}

/** What's sent to this computer: asking first unless it comes from one of your devices, then showing it arrive. */
export class Incoming {
  private readonly windows = new Map<string, OfferWindow>();

  constructor(private readonly post: Post) {}

  /** Closes the results of finished transfers, which would otherwise cover what comes next. */
  clearEnded(): void {
    for (const window of this.windows.values()) if (window.ended) window.close();
  }

  offer(offer: Offer): void {
    this.clearEnded();
    this.windows.set(offer.id, new OfferWindow(this.post, offer, () => this.windows.delete(offer.id)));
  }

  transfer(transfer: Transfer): void {
    this.windows.get(transfer.id)?.moved(transfer);
  }

  finished(finished: Finished, last: Transfer | undefined): void {
    const window = this.windows.get(finished.id);
    if (finished.outcome === 'done' && finished.saved.length === 1 && PICTURE.test(finished.saved[0]!) && this.post.client.settings.get_boolean('copy-picture'))
      void this.post.copyPicture(finished.saved[0]!).catch(logError);
    if (window?.open) window.end(finished);
    else if (last) this.notify(finished, last);
  }

  private notify(finished: Finished, last: Transfer): void {
    if (finished.outcome === 'cancelled') return;
    const done = finished.outcome === 'done';
    this.post.notify({
      title: done ? t('post-received', { count: last.files, device: finished.device }) : endedText(finished),
      body: done ? savedIn(this.post, finished.saved) : undefined,
      actions: done ? savedActions(this.post, finished.saved).map(({ label, onActivate }) => ({ label, onActivate })) : [],
    });
  }
}
