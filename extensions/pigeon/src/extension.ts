import type { Enable } from '@luft/extension-api';

import { addElement } from './element.js';
import { Incoming } from './incoming.js';
import { Messages } from './messages.js';
import { Outgoing } from './outgoing.js';
import { describePage } from './page.js';
import { Panel } from './panel.js';
import { type Granted, Pigeon } from './pigeon.js';
import { addTile } from './tile.js';

const enable: Enable<Granted> = extension => {
  const pigeon: Pigeon = new Pigeon(extension, {
    text: (from, text, trusted) => {
      incoming.clearEnded();
      messages.received(from, text, trusted);
    },
    offer: offer => incoming.offer(offer),
    transfer: transfer => (transfer.direction === 'in' ? incoming.transfer(transfer) : outgoing.transfer(transfer)),
    finished: (finished, last) => (finished.direction === 'in' ? incoming.finished(finished, last) : outgoing.finished(finished, last)),
  });
  const panel = new Panel(pigeon);
  const incoming = new Incoming(pigeon);
  const outgoing = new Outgoing(pigeon);
  const messages = new Messages(pigeon);
  addTile(pigeon, panel);
  addElement(pigeon, panel);
  describePage(pigeon);
};

export default enable;
