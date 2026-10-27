import Shell from 'gi://Shell';

import { FontconfigSerial } from '../shared/display/fontconfig.js';

export class FontRefresh {
  private readonly serial = new FontconfigSerial(() => {
    Shell.fonts_refresh(global.stage, global.datadir);
  });

  destroy(): void {
    this.serial.destroy();
  }
}
