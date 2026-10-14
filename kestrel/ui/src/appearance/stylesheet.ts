import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';
import St from 'gi://St';
import { getStyleVariant } from 'resource:///com/lantharos/kestrel/ui/kestrelTheme.js';

import { accentColor, fromHex, isNeutral, readableOn, toHex, type Rgb, type Seed } from './color.js';
import type { Colors, Palette } from './palette.js';

type AccentThemeContext = St.ThemeContext & { set_accent_color(color: Cogl.Color, fgColor: Cogl.Color): void };
type Variant = 'light' | 'dark';

const VARIANTS: Variant[] = ['light', 'dark'];
const rgba = (hex: string, alpha: number) => `rgba(${fromHex(hex).join(', ')}, ${alpha})`;
const coglColor = (color: Rgb) => Cogl.Color.from_string(toHex(color))[1];

function checkedControls(fill: string, ink: string): string {
  return `.kestrel-control.kestrel-control:checked, .kestrel-control.kestrel-control-lifted.kestrel-control-lifted:checked { background-color: ${rgba(fill, 0.86)}; color: ${ink}; }
.kestrel-control.kestrel-control:checked:hover { background-color: ${rgba(fill, 0.92)}; }
.kestrel-control.kestrel-control:checked:active { background-color: ${rgba(fill, 0.97)}; }
.kestrel-control.kestrel-control:checked:focus { box-shadow: inset 0 0 0 1px ${rgba(ink, 0.45)}; }
.kestrel-control.kestrel-control:checked .kestrel-control-subtitle { color: ${rgba(ink, 0.72)}; }
.kestrel-control.kestrel-control:checked .kestrel-control-more:hover { background-color: ${rgba(ink, 0.1)}; }
`;
}

function glassyCheckedControls(accent: string): string {
  return `.kestrel-control.kestrel-control:checked { background-color: ${rgba(accent, 0.42)}; }
.kestrel-control.kestrel-control:checked:hover { background-color: ${rgba(accent, 0.52)}; }
.kestrel-control.kestrel-control:checked:active { background-color: ${rgba(accent, 0.6)}; }
`;
}

function taskbarLooks(seed: Seed, colors: Colors): string {
  const tint = isNeutral(seed) ? colors.surfaceContainerHighest : colors.primaryContainer;
  return `.kestrel-panel.kestrel-panel.kestrel-taskbar-solid { background-color: ${colors.surfaceContainer}; }
.kestrel-panel.kestrel-panel.kestrel-taskbar-accent { background-color: ${rgba(tint, 0.62)}; }
.kestrel-panel.kestrel-panel.kestrel-taskbar-accent.kestrel-taskbar-opaque { background-color: ${tint}; }
`;
}

function lockScreen(accent: string, solid: Colors): string {
  return `.login-dialog-button.next-button.next-button { background-color: ${rgba(solid.primary, 0.9)}; color: ${solid.onPrimary}; }
.login-dialog-button.next-button.next-button:hover { background-color: ${solid.primary}; }
.kestrel-greeter-user.kestrel-greeter-user:checked { background-color: ${rgba(accent, 0.34)}; }
`;
}

function accentStylesheet(seed: Seed, palette: Palette, variant: Variant): string {
  const neutral = isNeutral(seed);
  const dark = variant === 'dark';
  const accent = toHex(accentColor(seed));
  const scheme = palette[variant].colors;
  const darkSolid = neutral ? palette.dark.colors : palette.light.colors;
  const solid = dark ? darkSolid : palette.light.colors;
  const highlight = neutral && !dark ? scheme.primary : accent;
  const checked = dark && !neutral ? glassyCheckedControls(accent) : checkedControls(dark ? accent : scheme.primary, scheme.onPrimary);
  return `${checked}${taskbarLooks(seed, scheme)}${lockScreen(accent, darkSolid)}.kestrel-calendar-day.kestrel-calendar-day:selected { background-color: ${solid.primary}; color: ${solid.onPrimary}; }
.kestrel-slider.kestrel-slider { -barlevel-active-background-color: ${scheme.primary}; }
.osd-window.osd-window.kestrel-glass .level { -barlevel-active-background-color: ${scheme.primary}; }
.kestrel-app-focused.kestrel-app-focused .kestrel-running-dot { background-color: ${scheme.primary}; }
.kestrel-task-progress-fill.kestrel-task-progress-fill, .kestrel-quality-fill.kestrel-quality-fill { background-color: ${scheme.primary}; }
.modal-dialog.modal-dialog .modal-dialog-button:default { background-color: ${rgba(solid.primary, 0.9)}; color: ${solid.onPrimary}; }
.modal-dialog.modal-dialog .modal-dialog-button:default:hover { background-color: ${solid.primary}; }
.modal-dialog.modal-dialog .check-box:checked StIcon { background-color: ${solid.primary}; color: ${solid.onPrimary}; }
.kestrel-snap-zone.kestrel-snap-zone:hover, .kestrel-snap-zone.kestrel-snap-zone:focus { background-color: ${rgba(highlight, 0.75)}; }
`;
}

export class AccentStylesheet {
  private readonly directory: Gio.File;
  private css = '';

  constructor(private readonly name: string) {
    this.directory = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY')!]));
  }

  private get context(): AccentThemeContext {
    return St.ThemeContext.get_for_stage((global as unknown as Shell.Global).stage) as AccentThemeContext;
  }

  private file(variant: Variant): Gio.File {
    return this.directory.get_child(`${this.name}-${variant}.css`);
  }

  apply(seed: Seed, palette: Palette): void {
    const accent = accentColor(seed);
    this.context.set_accent_color(coglColor(accent), coglColor(readableOn(accent)));
    const sheets = VARIANTS.map(variant => accentStylesheet(seed, palette, variant));
    const css = sheets.join('');
    if (css === this.css) return;
    GLib.mkdir_with_parents(this.directory.get_path()!, 0o700);
    VARIANTS.forEach((variant, index) =>
      this.file(variant).replace_contents(new TextEncoder().encode(sheets[index]), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null));
    const theme = this.context.get_theme();
    const current = this.file(getStyleVariant());
    if (this.css) theme.unload_stylesheet(current);
    theme.load_stylesheet(current);
    this.css = css;
  }

  unload(): void {
    if (this.css) this.context.get_theme().unload_stylesheet(this.file(getStyleVariant()));
    this.css = '';
  }
}
