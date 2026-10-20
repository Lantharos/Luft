import Gio from 'gi://Gio';

import type { MenuEntry } from '../../desktop/menus/contextMenus.js';
import { t } from '../../shared/i18n/index.js';

const LARGER_TEXT = 1.25;

interface Toggle {
  labelId: string;
  settings: Gio.Settings;
  key: string;
}

export class LockAccessibility {
  private readonly applications = new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.applications' });
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly toggles: Toggle[] = [
    { labelId: 'lock-screen-screen-reader', settings: this.applications, key: 'screen-reader-enabled' },
    { labelId: 'lock-screen-zoom', settings: this.applications, key: 'screen-magnifier-enabled' },
    { labelId: 'lock-screen-on-screen-keyboard', settings: this.applications, key: 'screen-keyboard-enabled' },
    { labelId: 'lock-screen-high-contrast', settings: new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.interface' }), key: 'high-contrast' },
    { labelId: 'lock-screen-dwell-click', settings: new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.mouse' }), key: 'dwell-click-enabled' },
  ];

  entries(): MenuEntry[] {
    const largerText = this.interfaceSettings.get_double('text-scaling-factor') > 1;
    return [
      ...this.toggles.map(({ labelId, settings, key }) => {
        const enabled = settings.get_boolean(key);
        return { label: t(labelId), checked: enabled, run: () => settings.set_boolean(key, !enabled) };
      }),
      {
        label: t('lock-screen-larger-text'),
        checked: largerText,
        run: () => largerText ? this.interfaceSettings.reset('text-scaling-factor') : this.interfaceSettings.set_double('text-scaling-factor', LARGER_TEXT),
      },
    ];
  }
}
