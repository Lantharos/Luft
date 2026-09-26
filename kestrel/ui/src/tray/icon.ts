import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

export const TRAY_ICON_SIZE = 16;

export interface IconSource {
  name: string;
  themePath: string;
  pixmaps: GLib.Variant | null;
}

const themes = new Map<string, St.IconTheme>();

function themeFor(searchPath: string): St.IconTheme {
  let theme = themes.get(searchPath);
  if (!theme) {
    theme = new St.IconTheme();
    if (searchPath) theme.append_search_path(searchPath);
    themes.set(searchPath, theme);
  }
  return theme;
}

function namedIcon(name: string, themePath: string): Gio.Icon | null {
  if (!name) return null;
  if (name.startsWith('/')) return Gio.File.new_for_path(name).query_exists(null) ? new Gio.FileIcon({ file: Gio.File.new_for_path(name) }) : null;
  if (!themePath) return themeFor('').has_icon(name) ? new Gio.ThemedIcon({ name }) : null;
  const filename = themeFor(themePath).lookup_icon(name, TRAY_ICON_SIZE, St.IconLookupFlags.FORCE_SIZE)?.get_filename();
  return filename ? new Gio.FileIcon({ file: Gio.File.new_for_path(filename) }) : null;
}

function pixmapContent(pixmaps: GLib.Variant, size: number): St.ImageContent | null {
  let best: GLib.Variant | null = null;
  let bestWidth = 0;
  for (let index = 0; index < pixmaps.n_children(); index++) {
    const pixmap = pixmaps.get_child_value(index);
    const width = pixmap.get_child_value(0).get_int32();
    const better = !best || (bestWidth < size ? width > bestWidth : width >= size && width < bestWidth);
    if (better) [best, bestWidth] = [pixmap, width];
  }
  if (!best || bestWidth <= 0) return null;
  const height = best.get_child_value(1).get_int32();
  const content = new St.ImageContent({ preferred_width: bestWidth, preferred_height: height });
  const context = (global as unknown as Shell.Global).stage.context.get_backend().get_cogl_context();
  content.set_bytes(context, best.get_child_value(2).get_data_as_bytes(), Cogl.PixelFormat.ARGB_8888, bestWidth, height, bestWidth * 4);
  return content;
}

function monochrome(icon: St.Icon, enabled: boolean): void {
  icon.clear_effects();
  if (!enabled) return;
  icon.add_effect(new Clutter.DesaturateEffect({ factor: 1 }));
  const levels = new Clutter.BrightnessContrastEffect();
  levels.set_brightness(0.5);
  levels.set_contrast(0.6);
  icon.add_effect(levels);
}

export function applyTrayIcon(icon: St.Icon, { name, themePath, pixmaps }: IconSource): boolean {
  const gicon = namedIcon(name, themePath);
  if (gicon) {
    const symbolic = name.endsWith('-symbolic');
    icon.set({ content: null, gicon, width: -1, height: -1 });
    icon.style = symbolic ? null : '-st-icon-style: regular;';
    monochrome(icon, !symbolic);
    return true;
  }
  const scale = St.ThemeContext.get_for_stage((global as unknown as Shell.Global).stage).scale_factor;
  const content = pixmaps ? pixmapContent(pixmaps, TRAY_ICON_SIZE * scale) : null;
  if (!content) return false;
  icon.set({ gicon: null, content, content_gravity: Clutter.ContentGravity.RESIZE_ASPECT,
    width: TRAY_ICON_SIZE * scale, height: TRAY_ICON_SIZE * scale });
  monochrome(icon, true);
  return true;
}
