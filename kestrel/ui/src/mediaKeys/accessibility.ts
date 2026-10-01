import Gio from 'gi://Gio';

const TEXT_SIZES = [0.75, 1, 1.25, 1.5];
const TEXT_SIZE_STEP = 0.25;

export type Assistant = 'screen-magnifier-enabled' | 'screen-reader-enabled' | 'screen-keyboard-enabled';

export class AccessibilityKeys {
  private readonly applications = new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.applications' });
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly a11yInterface = new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.interface' });
  private readonly magnifier = new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.magnifier' });

  toggle(assistant: Assistant): void {
    this.applications.set_boolean(assistant, !this.applications.get_boolean(assistant));
  }

  textSize(larger: boolean): void {
    const wanted = this.interfaceSettings.get_double('text-scaling-factor') + (larger ? TEXT_SIZE_STEP : -TEXT_SIZE_STEP);
    const closest = TEXT_SIZES.reduce((best, size) => Math.abs(size - wanted) < Math.abs(best - wanted) ? size : best);
    if (closest === 1) this.interfaceSettings.reset('text-scaling-factor');
    else this.interfaceSettings.set_double('text-scaling-factor', closest);
  }

  toggleContrast(): void {
    this.a11yInterface.set_boolean('high-contrast', !this.a11yInterface.get_boolean('high-contrast'));
  }

  zoom(closer: boolean): void {
    this.magnifier.set_double('mag-factor', Math.round(this.magnifier.get_double('mag-factor') + (closer ? 1 : -1)));
  }
}
