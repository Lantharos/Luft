import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

import type { Context } from '../../context.js';
import { Dictation } from './dictation.js';
import { DictationShortcut } from './dictationShortcut.js';
import { GrabbedShortcut } from './grabbedShortcut.js';
import { PressAndHold } from './pressAndHold.js';

const COPILOT_KEY = ['<Shift><Super>F23', '<Shift><Super>XF86TouchpadOff', 'XF86Assistant'];

export class CopilotActions {
  private readonly preferences = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.copilot-key' });
  private readonly dictation: Dictation;
  private readonly presses: PressAndHold;
  private readonly key: GrabbedShortcut;
  private readonly shortcut: DictationShortcut;

  constructor(context: Context, private readonly openSearch: () => void, paste: (text: string) => void) {
    this.dictation = new Dictation(context, paste);
    this.presses = new PressAndHold({
      press: () => this.pressed(),
      begin: () => this.dictation.begin('hold'),
      end: () => this.dictation.end(),
      cancel: () => this.dictation.cancel(),
    }, () => this.preferences.get_boolean('hold'));
    this.key = new GrabbedShortcut(COPILOT_KEY, context.keybindings, {
      down: () => {
        if (!this.preferences.get_boolean('seen')) this.preferences.set_boolean('seen', true);
        this.presses.down();
      },
      up: () => this.presses.up(),
      cancel: () => this.presses.cancel(),
    });
    this.shortcut = new DictationShortcut(context, this.dictation);
  }

  private pressed(): void {
    const action = this.preferences.get_string('press');
    if (action === 'search') this.openSearch();
    else if (action === 'app') Shell.AppSystem.get_default().lookup_app(this.preferences.get_string('app'))?.activate();
  }

  destroy(): void {
    this.shortcut.destroy();
    this.key.destroy();
    this.presses.destroy();
    this.dictation.destroy();
  }
}
