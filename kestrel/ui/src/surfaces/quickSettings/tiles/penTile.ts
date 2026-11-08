import Gio from 'gi://Gio';

import { FluentNumber, localized, t } from '../../../shared/i18n/index.js';
import { pens, type PensState } from '../../../system/pens/pens.js';
import { actionTile, type ActionTile } from './controlTile.js';

const PEN_SCHEMA = 'com.lantharos.kestrel.pen';

export class PenTile {
  readonly tile: ActionTile;
  private readonly settings = new Gio.Settings({ schema_id: PEN_SCHEMA });
  private readonly unwatch: () => void;
  private state: PensState = { pens: [], battery: null };

  constructor(open: () => void) {
    this.tile = actionTile('input-tablet-symbolic', 'quick-settings-pen', open);
    this.settings.connect('changed::hand', () => this.show());
    localized(this.tile.subtitle, () => this.show());
    this.unwatch = pens.watch(state => {
      this.state = state;
      this.tile.actor.visible = state.pens.length > 0;
      this.show();
    });
  }

  private show(): void {
    const hand = t(this.settings.get_string('hand') === 'left' ? 'quick-settings-pen-left-hand' : 'quick-settings-pen-right-hand');
    const { battery } = this.state;
    this.tile.subtitle.text = battery === null ? hand
      : t('quick-settings-pen-battery', { percent: new FluentNumber(battery / 100, { style: 'percent' }), hand });
  }

  destroy(): void {
    this.unwatch();
    this.settings.run_dispose();
  }
}
