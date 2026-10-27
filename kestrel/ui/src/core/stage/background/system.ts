import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';

import { DEFAULT_BACKGROUND_COLOR } from './wallpaper.js';

let systemBackground: Meta.Background | null = null;

function sharedBackground(): Meta.Background {
  if (!systemBackground) {
    systemBackground = new Meta.Background({ meta_display: global.display });
    systemBackground.set_color(DEFAULT_BACKGROUND_COLOR);
  }
  return systemBackground;
}

export namespace SystemBackground {
  export interface Signals extends Meta.BackgroundActor.SignalSignatures {
    'loaded': () => void;
  }
}

export const SystemBackground = GObject.registerClass({
  Signals: { 'loaded': {} },
}, class SystemBackground extends Meta.BackgroundActor {
  declare connect: GObject.SignalMethods<this, SystemBackground.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, SystemBackground.Signals>['emit'];

  constructor() {
    const background = sharedBackground();
    super({ meta_display: global.display, monitor: 0 });
    this.content.background = background;

    const id = GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => this.emit('loaded'));
    GLib.Source.set_name_by_id(id, '[kestrel] SystemBackground.loaded');
  }
});
export type SystemBackground = InstanceType<typeof SystemBackground>;
