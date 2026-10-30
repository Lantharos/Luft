import type Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { fromHex, seedFromColor, type Seed } from '../color.js';
import { glyphNames } from './glyphs.js';
import { paints, type IconStyle, type Paint, type PaintedStyle } from './paint.js';

export interface IconApp {
  get_id(): string | null;
  get_icon(): Gio.Icon | null;
}

const textureCache = St.TextureCache.get_default();
const appSystem = Shell.AppSystem.get_default();
const FALLBACK = new Gio.ThemedIcon({ name: 'application-x-executable' });
const RESTYLE_BATCH = 12;

const color = (hex: string) => Cogl.Color.from_string(hex)[1];

export function sourceIcon(app: IconApp): Gio.Icon {
  const id = app.get_id();
  return (id ? appSystem.lookup_app(id)?.get_icon() : null) ?? app.get_icon() ?? FALLBACK;
}

export function styledIcon(app: IconApp, paint: Paint): St.StyledIcon {
  const source = sourceIcon(app);
  return new St.StyledIcon({
    source, glyph_names: glyphNames(app.get_id(), source),
    plate: color(paint.plate), ink: color(paint.ink), shade: color(paint.shade), rim: paint.rim,
  });
}

class AppIcons {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly bound = new Map<St.Icon, IconApp>();
  private readonly onTaskbar = new Set<St.Icon>();
  private readonly hidden = new Set<St.Icon>();
  private readonly listeners = new Set<() => void>();
  private accent: { seed: Seed; dark: boolean; taskbarDark: boolean } | null = null;
  private restyleId = 0;
  style = this.settings.get_string('app-icon-style') as IconStyle;
  paints: Record<PaintedStyle, Paint> | null = null;
  // The taskbar's glass can be light or dark apart from the style, see taskbarScheme()
  taskbarPaints: Record<PaintedStyle, Paint> | null = null;

  constructor() {
    this.settings.connect('changed::app-icon-style', () => this.refresh());
    this.settings.connect('changed::app-icon-tint', () => this.refresh());
    appSystem.connect('installed-changed', () => {
      for (const icon of this.bound.keys()) icon.gicon = this.iconOf(icon);
    });
  }

  setAccent(seed: Seed, dark: boolean, taskbarDark: boolean): void {
    this.accent = { seed, dark, taskbarDark };
    this.refresh();
  }

  watch(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get paint(): Paint | null {
    return this.style === 'default' ? null : this.paints?.[this.style] ?? null;
  }

  get taskbarPaint(): Paint | null {
    return this.style === 'default' ? null : this.taskbarPaints?.[this.style] ?? null;
  }

  gicon(app: IconApp, paint = this.paint): Gio.Icon {
    return paint ? styledIcon(app, paint) : sourceIcon(app);
  }

  private iconOf(icon: St.Icon): Gio.Icon {
    return this.gicon(this.bound.get(icon)!, this.onTaskbar.has(icon) ? this.taskbarPaint : this.paint);
  }

  bind(icon: St.Icon, app: IconApp, taskbar = false): void {
    this.bound.set(icon, app);
    if (taskbar) this.onTaskbar.add(icon);
    icon.gicon = this.iconOf(icon);
    if (this.paint && !icon.mapped) this.restyleHidden(icon);
    const iconChanged = app instanceof Shell.App ? app.connect('notify::icon', () => { icon.gicon = this.iconOf(icon); }) : 0;
    icon.connect('destroy', () => {
      this.bound.delete(icon);
      this.onTaskbar.delete(icon);
      this.hidden.delete(icon);
      if (iconChanged) (app as Shell.App).disconnect(iconChanged);
    });
  }

  private refresh(): void {
    const style = this.settings.get_string('app-icon-style') as IconStyle;
    const tint = this.settings.get_string('app-icon-tint');
    const seed = tint ? seedFromColor(fromHex(tint)) : this.accent?.seed;
    const painted = seed ? paints(seed, this.accent?.dark ?? true) : null;
    const taskbarPainted = seed ? paints(seed, this.accent?.taskbarDark ?? true) : null;
    if (style === this.style && JSON.stringify([painted, taskbarPainted]) === JSON.stringify([this.paints, this.taskbarPaints])) return;
    const restyle = style !== 'default' || this.style !== 'default';
    this.style = style;
    this.paints = painted;
    this.taskbarPaints = taskbarPainted;
    for (const listener of this.listeners) listener();
    if (!restyle) return;
    textureCache.evict_styled_icons();
    for (const icon of this.bound.keys()) {
      if (icon.mapped) icon.gicon = this.iconOf(icon);
      else this.restyleHidden(icon);
    }
  }

  private restyleHidden(icon: St.Icon): void {
    this.hidden.add(icon);
    this.restyleId ||= GLib.idle_add(GLib.PRIORITY_LOW, () => {
      const scale = St.ThemeContext.get_for_stage(global.stage).scale_factor;
      for (const icon of [...this.hidden].slice(0, RESTYLE_BATCH)) {
        this.hidden.delete(icon);
        icon.gicon = this.iconOf(icon);
        if (this.paint && !icon.mapped)
          textureCache.load_gicon(null, icon.gicon, icon.icon_size, scale, 1);
      }
      if (this.hidden.size) return GLib.SOURCE_CONTINUE;
      this.restyleId = 0;
      return GLib.SOURCE_REMOVE;
    });
  }
}

export const appIcons = new AppIcons();

export function appIcon(app: IconApp, size: number, params: Partial<St.Icon.ConstructorProps> = {}): St.Icon {
  const icon = new St.Icon({ icon_size: size, fallback_icon_name: 'application-x-executable', ...params });
  appIcons.bind(icon, app);
  return icon;
}

export function taskbarAppIcon(app: IconApp, size: number): St.Icon {
  const icon = new St.Icon({ icon_size: size, fallback_icon_name: 'application-x-executable' });
  appIcons.bind(icon, app, true);
  return icon;
}

export function sourceApp(source: { policy?: { id?: string } }): Shell.App | null {
  return Shell.AppSystem.get_default().lookup_app(`${source.policy?.id}.desktop`);
}

export function windowIcon(app: Shell.App, window: Meta.Window, size: number): Clutter.Actor {
  return appIcons.style === 'default' ? app.create_window_icon_texture(window, size) : appIcon(app, size);
}
