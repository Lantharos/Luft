import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import { accentColor, fromHex, isNeutral, readableOn, toHex, type Rgb, type Seed } from './color.js';
import type { Palette } from './palette.js';

type AccentThemeContext = St.ThemeContext & { set_accent_color(color: Cogl.Color, fgColor: Cogl.Color): void };

const rgba = (hex: string, alpha: number) => `rgba(${fromHex(hex).join(', ')}, ${alpha})`;
const coglColor = (color: Rgb) => Cogl.Color.from_string(toHex(color))[1];

function checkedControls(seed: Seed, accent: string, { dark }: Palette): string {
  if (!isNeutral(seed)) {
    return `.kestrel-control.kestrel-control:checked { background-color: ${rgba(accent, 0.42)}; }
.kestrel-control.kestrel-control:checked:hover { background-color: ${rgba(accent, 0.52)}; }
.kestrel-control.kestrel-control:checked:active { background-color: ${rgba(accent, 0.6)}; }
`;
  }
  const ink = dark.colors.onPrimary;
  return `.kestrel-control.kestrel-control:checked, .kestrel-control.kestrel-control-lifted.kestrel-control-lifted:checked { background-color: ${rgba(accent, 0.86)}; color: ${ink}; }
.kestrel-control.kestrel-control:checked:hover { background-color: ${rgba(accent, 0.92)}; }
.kestrel-control.kestrel-control:checked:active { background-color: ${rgba(accent, 0.97)}; }
.kestrel-control.kestrel-control:checked:focus { box-shadow: inset 0 0 0 1px ${rgba(ink, 0.45)}; }
.kestrel-control.kestrel-control:checked .kestrel-control-subtitle { color: ${rgba(ink, 0.72)}; }
.kestrel-control.kestrel-control:checked .kestrel-control-more:hover { background-color: ${rgba(ink, 0.1)}; }
`;
}

function taskbarLooks(seed: Seed, { dark }: Palette): string {
  const tint = isNeutral(seed) ? dark.colors.surfaceContainerHighest : dark.colors.primaryContainer;
  return `.kestrel-panel.kestrel-panel.kestrel-taskbar-solid { background-color: ${dark.colors.surfaceContainer}; }
.kestrel-panel.kestrel-panel.kestrel-taskbar-accent { background-color: ${rgba(tint, 0.62)}; }
.kestrel-panel.kestrel-panel.kestrel-taskbar-accent.kestrel-taskbar-opaque { background-color: ${tint}; }
`;
}

function accentStylesheet(seed: Seed, palette: Palette): string {
  const accent = toHex(accentColor(seed));
  const { colors: solid } = isNeutral(seed) ? palette.dark : palette.light;
  const bright = palette.dark.colors.primary;
  return `${checkedControls(seed, accent, palette)}${taskbarLooks(seed, palette)}.kestrel-calendar-day.kestrel-calendar-day:selected { background-color: ${solid.primary}; color: ${solid.onPrimary}; }
.kestrel-slider.kestrel-slider { -barlevel-active-background-color: ${bright}; }
.osd-window.osd-window.kestrel-glass .level { -barlevel-active-background-color: ${bright}; }
.kestrel-app-focused.kestrel-app-focused .kestrel-running-dot { background-color: ${bright}; }
.kestrel-task-progress-fill.kestrel-task-progress-fill, .kestrel-quality-fill.kestrel-quality-fill { background-color: ${bright}; }
.modal-dialog.modal-dialog .modal-dialog-button:default { background-color: ${rgba(solid.primary, 0.9)}; color: ${solid.onPrimary}; }
.modal-dialog.modal-dialog .modal-dialog-button:default:hover { background-color: ${solid.primary}; }
.modal-dialog.modal-dialog .check-box:checked StIcon { background-color: ${solid.primary}; color: ${solid.onPrimary}; }
.kestrel-snap-zone.kestrel-snap-zone:hover, .kestrel-snap-zone.kestrel-snap-zone:focus { background-color: ${rgba(accent, 0.75)}; }
.login-dialog-button.next-button.next-button { background-color: ${rgba(solid.primary, 0.9)}; color: ${solid.onPrimary}; }
.login-dialog-button.next-button.next-button:hover { background-color: ${solid.primary}; }
.kestrel-greeter-user.kestrel-greeter-user:checked { background-color: ${rgba(accent, 0.34)}; }
`;
}

export class AccentStylesheet {
  private readonly file: Gio.File;
  private css = '';

  constructor(name: string) {
    this.file = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY')!, name]));
  }

  private get context(): AccentThemeContext {
    return St.ThemeContext.get_for_stage((global as unknown as Shell.Global).stage) as AccentThemeContext;
  }

  apply(seed: Seed, palette: Palette): void {
    const accent = accentColor(seed);
    this.context.set_accent_color(coglColor(accent), coglColor(readableOn(accent)));
    this.load(accentStylesheet(seed, palette));
  }

  private load(css: string): void {
    if (css === this.css) return;
    const theme = this.context.get_theme();
    GLib.mkdir_with_parents(this.file.get_parent()!.get_path()!, 0o700);
    this.file.replace_contents(new TextEncoder().encode(css), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
    if (this.css) theme.unload_stylesheet(this.file);
    theme.load_stylesheet(this.file);
    this.css = css;
  }

  unload(): void {
    if (this.css) this.context.get_theme().unload_stylesheet(this.file);
    this.css = '';
  }
}
