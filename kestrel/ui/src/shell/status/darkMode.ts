import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../main.js';

import { QuickToggle, SystemIndicator } from './quickSettings.js';

const DarkModeToggle = GObject.registerClass(class DarkModeToggle extends QuickToggle {
  private readonly settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });

  constructor() {
    super({ icon_name: 'dark-mode-symbolic' });
    KestrelUi.localized(this, () => (this.title = KestrelUi.t('dark-style-title')));

    this.settings.connect('changed::color-scheme', () => this.sync());

    this.connectObject(
      'destroy', () => this.settings.run_dispose(),
      'clicked', () => this.toggleScheme(),
      this);
    this.sync();
  }

  private toggleScheme(): void {
    Main.layoutManager.screenTransition.run();
    this.settings.set_string('color-scheme', this.checked ? 'default' : 'prefer-dark');
  }

  private sync(): void {
    const checked = this.settings.get_string('color-scheme') === 'prefer-dark';
    if (this.checked !== checked) this.set({ checked });
  }
});

export const Indicator = GObject.registerClass(class Indicator extends SystemIndicator {
  constructor() {
    super();
    this.quickSettingsItems.push(new DarkModeToggle());
  }
});
