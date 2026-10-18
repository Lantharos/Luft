import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

import type { Context } from '../../context.js';
import { CopilotKey } from './copilotKey.js';
import { Dictation } from './dictation.js';

export class CopilotActions {
  private readonly preferences = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.copilot-key' });
  private readonly dictation: Dictation;
  private readonly key: CopilotKey;

  constructor(context: Context, private readonly openSearch: () => void, paste: (text: string) => void) {
    this.dictation = new Dictation(context, paste);
    this.key = new CopilotKey(context.keybindings, () => this.pressed(), this.dictation);
  }

  private pressed(): void {
    const action = this.preferences.get_string('press');
    if (action === 'search') this.openSearch();
    else if (action === 'app') Shell.AppSystem.get_default().lookup_app(this.preferences.get_string('app'))?.activate();
  }

  destroy(): void {
    this.key.destroy();
    this.dictation.destroy();
  }
}
