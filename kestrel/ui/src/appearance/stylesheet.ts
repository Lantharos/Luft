import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import { fromHex } from './color.js';
import type { Palette } from './palette.js';

const rgba = (hex: string, alpha: number) => `rgba(${fromHex(hex).join(', ')}, ${alpha})`;

export function accentStylesheet(accent: string, { light, dark }: Palette): string {
  const strong = light.colors.primary;
  const bright = dark.colors.primary;
  return `.kestrel-control.kestrel-control:checked { background-color: ${rgba(accent, 0.42)}; }
.kestrel-control.kestrel-control:checked:hover { background-color: ${rgba(accent, 0.52)}; }
.kestrel-control.kestrel-control:checked:active { background-color: ${rgba(accent, 0.6)}; }
.kestrel-calendar-day.kestrel-calendar-day:selected { background-color: ${strong}; color: ${light.colors.onPrimary}; }
.kestrel-slider.kestrel-slider { -barlevel-active-background-color: ${bright}; }
.osd-window.osd-window.kestrel-glass .level { -barlevel-active-background-color: ${bright}; }
.kestrel-app-focused.kestrel-app-focused .kestrel-running-dot { background-color: ${bright}; }
.kestrel-task-progress-fill.kestrel-task-progress-fill { background-color: ${bright}; }
.modal-dialog.modal-dialog .modal-dialog-button:default { background-color: ${rgba(strong, 0.9)}; }
.modal-dialog.modal-dialog .modal-dialog-button:default:hover { background-color: ${strong}; }
.modal-dialog.modal-dialog .check-box:checked StIcon { background-color: ${strong}; }
.kestrel-snap-zone.kestrel-snap-zone:hover, .kestrel-snap-zone.kestrel-snap-zone:focus { background-color: ${rgba(accent, 0.75)}; }
.login-dialog-button.next-button.next-button { background-color: ${rgba(strong, 0.9)}; color: ${light.colors.onPrimary}; }
.login-dialog-button.next-button.next-button:hover { background-color: ${strong}; }
.kestrel-greeter-user.kestrel-greeter-user:checked { background-color: ${rgba(accent, 0.34)}; }
`;
}

export class AccentStylesheet {
  private readonly file: Gio.File;
  private css = '';

  constructor(name: string) {
    this.file = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', name]));
  }

  private get theme(): St.Theme {
    return St.ThemeContext.get_for_stage((global as unknown as Shell.Global).stage).get_theme();
  }

  load(css: string): void {
    if (css === this.css) return;
    GLib.mkdir_with_parents(this.file.get_parent()!.get_path()!, 0o700);
    this.file.replace_contents(new TextEncoder().encode(css), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
    if (this.css) this.theme.unload_stylesheet(this.file);
    this.theme.load_stylesheet(this.file);
    this.css = css;
  }

  unload(): void {
    if (this.css) this.theme.unload_stylesheet(this.file);
    this.css = '';
  }
}
