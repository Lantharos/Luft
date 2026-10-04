import type Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';

import { FontconfigSerial } from '../shared/fontconfig.js';

const { fonts_refresh: refreshFonts } = Shell as unknown as { fonts_refresh(stage: Clutter.Actor, datadir: string): boolean };

export class FontRefresh {
  private readonly serial = new FontconfigSerial(() => {
    const shell = global as unknown as Shell.Global;
    refreshFonts(shell.stage, shell.datadir);
  });

  destroy(): void {
    this.serial.destroy();
  }
}
