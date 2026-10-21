import type Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';

import { FontconfigSerial } from '../shared/display/fontconfig.js';

const { fonts_refresh: refreshFonts } = Shell as unknown as { fonts_refresh(stage: Clutter.Actor, datadir: string): boolean };

export class FontRefresh {
  private readonly serial = new FontconfigSerial(() => {
    refreshFonts(global.stage, global.datadir);
  });

  destroy(): void {
    this.serial.destroy();
  }
}
