import { t } from '../../../shared/i18n/index.js';
import type { Finished, Transfer } from './client.js';
import type { Post } from './post.js';
import { openPopup, type Popup, type View } from './popups.js';

const WIDTH = 340;

export class Outgoing {
  private readonly asking = new Map<string, Popup>();

  constructor(private readonly post: Post) {}

  transfer(transfer: Transfer): void {
    if (transfer.stage === 'pin' || transfer.stage === 'wrong-pin') this.askPin(transfer);
    else this.dismiss(transfer.id);
  }

  finished(finished: Finished, last: Transfer | undefined): void {
    this.dismiss(finished.id);
    const title = this.outcome(finished, last);
    if (title) this.post.notify({ title });
  }

  private outcome({ outcome, device }: Finished, last: Transfer | undefined): string | null {
    switch (outcome) {
      case 'done': return last?.text ? t('post-sent-text-to', { device }) : t('post-sent', { count: last?.files ?? 1, device });
      case 'declined': return t('post-declined', { device });
      case 'busy': return t('post-busy', { device });
      case 'unreachable': return device ? t('post-unreachable', { device }) : t('post-gone');
      case 'failed': return t('post-send-failed', { device });
      case 'cancelled-there': return t('post-stopped-by', { device });
      case 'cancelled': return null;
    }
  }

  private askPin(transfer: Transfer): void {
    let pin = '';
    const answer = () => {
      if (!pin) return;
      this.dismiss(transfer.id);
      this.post.client.answerPin(transfer.id, pin);
    };
    const content: View = {
      type: 'column', spacing: 12,
      children: [
        { type: 'text', text: t('post-pin-title', { device: transfer.device }), style: 'title', maxWidth: WIDTH - 40 },
        ...transfer.stage === 'wrong-pin' ? [{ type: 'text', text: t('post-pin-wrong'), style: 'caption' } as const] : [],
        { type: 'entry', label: t('post-pin'), onChanged: text => (pin = text.trim()), onSubmit: answer },
        {
          type: 'row', spacing: 8,
          children: [
            { type: 'spacer' },
            { type: 'button', label: t('post-cancel'), onActivate: () => this.asking.get(transfer.id)?.dispose() },
            { type: 'button', label: t('post-send'), style: 'primary', onActivate: answer },
          ],
        },
      ],
    };
    this.dismiss(transfer.id);
    const popup = openPopup(this.post.desktop, {
      anchor: 'center', kind: 'panel', width: WIDTH, title: transfer.device, content,
      onClosed: () => {
        if (this.asking.get(transfer.id) !== popup) return;
        this.asking.delete(transfer.id);
        this.post.client.cancel(transfer.id);
      },
    });
    this.asking.set(transfer.id, popup);
  }

  private dismiss(id: string): void {
    const popup = this.asking.get(id);
    this.asking.delete(id);
    popup?.dispose();
  }
}
