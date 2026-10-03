import Gio from 'gi://Gio';

import type { MenuEntry } from '../menus/contextMenus.js';

const LARGER_TEXT = 1.25;

interface Toggle {
  label: string;
  settings: Gio.Settings;
  key: string;
}

export class LockAccessibility {
  private readonly applications = new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.applications' });
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly toggles: Toggle[] = [
    { label: 'Screen reader', settings: this.applications, key: 'screen-reader-enabled' },
    { label: 'Zoom', settings: this.applications, key: 'screen-magnifier-enabled' },
    { label: 'On-screen keyboard', settings: this.applications, key: 'screen-keyboard-enabled' },
    { label: 'High contrast', settings: new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.interface' }), key: 'high-contrast' },
    { label: 'Dwell click', settings: new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.mouse' }), key: 'dwell-click-enabled' },
  ];

  entries(): MenuEntry[] {
    const largerText = this.interfaceSettings.get_double('text-scaling-factor') > 1;
    return [
      ...this.toggles.map(({ label, settings, key }) => {
        const enabled = settings.get_boolean(key);
        return { label, checked: enabled, run: () => settings.set_boolean(key, !enabled) };
      }),
      {
        label: 'Larger text',
        checked: largerText,
        run: () => largerText ? this.interfaceSettings.reset('text-scaling-factor') : this.interfaceSettings.set_double('text-scaling-factor', LARGER_TEXT),
      },
    ];
  }
}
