import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { MenuEntry } from '../menus/contextMenus.js';

const LARGER_TEXT = 1.25;

export class Accessibility {
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly screenReaderProgram = GLib.find_program_in_path('orca');
  private screenReader: Gio.Subprocess | null = null;

  entries(): MenuEntry[] {
    const largerText = this.interfaceSettings.get_double('text-scaling-factor') > 1;
    const entries: MenuEntry[] = [{
      label: 'Larger text',
      checked: largerText,
      run: () => this.interfaceSettings.set_double('text-scaling-factor', largerText ? 1 : LARGER_TEXT),
    }];
    if (this.screenReaderProgram) entries.push({
      label: 'Screen reader',
      checked: !!this.screenReader,
      run: () => this.toggleScreenReader(),
    });
    return entries;
  }

  private toggleScreenReader(): void {
    if (this.screenReader) {
      this.screenReader.send_signal(15);
      this.screenReader = null;
      return;
    }
    const process = Gio.Subprocess.new([this.screenReaderProgram!, '--replace'], Gio.SubprocessFlags.NONE);
    this.screenReader = process;
    process.wait_async(null, () => {
      if (this.screenReader === process) this.screenReader = null;
    });
  }

  shutdown(): void {
    this.screenReader?.send_signal(15);
  }
}
