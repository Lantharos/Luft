import type { Popup, View } from '@luft/extension-api';

import { ICON } from './format.js';
import type { Finished, Pigeon, Transfer } from './pigeon.js';

const WIDTH = 340;

/** What's sent from this computer: asking for a PIN when the other device wants one, and saying how it went. */
export class Outgoing {
  private readonly asking = new Map<string, Popup>();

  constructor(private readonly pigeon: Pigeon) {}

  transfer(transfer: Transfer): void {
    if (transfer.stage === 'pin' || transfer.stage === 'wrong-pin') this.askPin(transfer);
    else this.dismiss(transfer.id);
  }

  finished(finished: Finished, last: Transfer | undefined): void {
    this.dismiss(finished.id);
    const title = this.outcome(finished, last);
    if (title) this.pigeon.extension.notifications.send({ icon: ICON, title });
  }

  private outcome({ outcome, device }: Finished, last: Transfer | undefined): string | null {
    const { t } = this.pigeon.extension;
    switch (outcome) {
      case 'done': return last?.text ? t('sent-text-to', { device }) : t('sent', { count: last?.files ?? 1, device });
      case 'declined': return t('declined', { device });
      case 'busy': return t('busy', { device });
      case 'unreachable': return device ? t('unreachable', { device }) : t('gone');
      case 'failed': return t('send-failed', { device });
      case 'cancelled-there': return t('stopped-by', { device });
      case 'cancelled': return null;
    }
  }

  private askPin(transfer: Transfer): void {
    const { t, popups } = this.pigeon.extension;
    let pin = '';
    const answer = () => {
      if (!pin) return;
      this.dismiss(transfer.id);
      this.pigeon.answerPin(transfer.id, pin);
    };
    const content: View = {
      type: 'column', spacing: 12,
      children: [
        { type: 'text', text: t('pin-title', { device: transfer.device }), style: 'title', maxWidth: WIDTH - 40 },
        ...transfer.stage === 'wrong-pin' ? [{ type: 'text', text: t('pin-wrong'), style: 'caption' } as const] : [],
        { type: 'entry', label: t('pin'), onChanged: text => (pin = text.trim()), onSubmit: answer },
        {
          type: 'row', spacing: 8,
          children: [
            { type: 'spacer' },
            { type: 'button', label: t('cancel'), onActivate: () => this.asking.get(transfer.id)?.dispose() },
            { type: 'button', label: t('send'), style: 'primary', onActivate: answer },
          ],
        },
      ],
    };
    this.dismiss(transfer.id);
    const popup = popups.open({
      anchor: 'center', width: WIDTH, title: transfer.device, content,
      onClosed: () => {
        if (this.asking.get(transfer.id) !== popup) return;
        this.asking.delete(transfer.id);
        this.pigeon.cancel(transfer.id);
      },
    });
    this.asking.set(transfer.id, popup);
  }

  /** Closes the PIN window without stopping the transfer. */
  private dismiss(id: string): void {
    const popup = this.asking.get(id);
    this.asking.delete(id);
    popup?.dispose();
  }
}
