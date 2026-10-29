import type Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { readText, removeBlock, removeFile, userFile, writeBlock, writeText } from '../files.js';
import type { Palette } from '../palette.js';
import { GHOSTTY_THEMES, ghosttyInclude, ghosttyTheme } from './ghostty.js';
import { gtk3Css, gtk3WindowCss, gtk4Css, gtk4WindowCss } from './gtk.js';
import { QT_SCHEME_NAME, kdeColorScheme, qtPalette } from './qt.js';

const CSS_MARKERS = {
  start: '/* Kestrel wallpaper colors: generated, edits inside this block are replaced */',
  end: '/* End of Kestrel wallpaper colors */',
};
const WINDOW_MARKERS = {
  start: '/* Kestrel window edges: generated, edits inside this block are replaced */',
  end: '/* End of Kestrel window edges */',
};
const CONFIG_MARKERS = {
  start: '# Kestrel wallpaper colors: generated, edits inside this block are replaced',
  end: '# End of Kestrel wallpaper colors',
};
const GHOSTTY_CONFIGS = ['config.ghostty', 'config'];

async function writeChanged(file: Gio.File, contents: string): Promise<boolean> {
  if (await readText(file) === contents) return false;
  await writeText(file, contents);
  return true;
}

export class AppThemes {
  private readonly config = GLib.get_user_config_dir();
  private readonly gtk4 = userFile(this.config, 'gtk-4.0', 'gtk.css');
  private readonly gtk3 = userFile(this.config, 'gtk-3.0', 'gtk.css');
  private readonly qt6ct = userFile(this.config, 'qt6ct', 'colors', `${QT_SCHEME_NAME}.conf`);
  private readonly kde = userFile(GLib.get_user_data_dir(), 'color-schemes', `${QT_SCHEME_NAME}.colors`);
  private readonly ghosttyThemes = {
    light: userFile(this.config, 'ghostty', 'themes', GHOSTTY_THEMES.light),
    dark: userFile(this.config, 'ghostty', 'themes', GHOSTTY_THEMES.dark),
  };
  private readonly ghosttyConfigs = GHOSTTY_CONFIGS.map(name => userFile(this.config, 'ghostty', name));

  async apply(palette: Palette, dark: boolean): Promise<void> {
    const { colors } = dark ? palette.dark : palette.light;
    await Promise.all([
      this.writeGtk(this.gtk4, gtk4Css(palette), gtk4WindowCss),
      this.writeGtk(this.gtk3, gtk3Css(colors, dark), gtk3WindowCss),
      writeChanged(this.qt6ct, qtPalette(colors)),
      writeChanged(this.kde, kdeColorScheme(colors)),
      ...GLib.find_program_in_path('ghostty') ? [this.applyGhostty(palette)] : [],
    ]);
  }

  async remove(): Promise<void> {
    await Promise.all([
      this.writeGtk(this.gtk4, null, gtk4WindowCss),
      this.writeGtk(this.gtk3, null, gtk3WindowCss),
      removeFile(this.qt6ct),
      removeFile(this.kde),
      this.removeGhostty(),
    ]);
  }

  private async writeGtk(file: Gio.File, colors: string | null, windows: string): Promise<void> {
    await (colors === null ? removeBlock(file, CSS_MARKERS) : writeBlock(file, CSS_MARKERS, colors));
    await writeBlock(file, WINDOW_MARKERS, windows);
  }

  private async removeGhostty(): Promise<void> {
    await Promise.all([
      ...this.ghosttyConfigs.map(file => removeBlock(file, CONFIG_MARKERS)),
      removeFile(this.ghosttyThemes.light),
      removeFile(this.ghosttyThemes.dark),
    ]);
  }

  private async applyGhostty(palette: Palette): Promise<void> {
    const config = this.ghosttyConfigs.find(file => file.query_exists(null)) ?? this.ghosttyConfigs[0];
    const [, light, dark] = await Promise.all([
      writeBlock(config, CONFIG_MARKERS, ghosttyInclude),
      writeChanged(this.ghosttyThemes.light, ghosttyTheme(palette.light)),
      writeChanged(this.ghosttyThemes.dark, ghosttyTheme(palette.dark)),
    ]);
    if (light || dark) Shell.util_spawn_async(null, ['pkill', '--signal', 'USR2', '--exact', 'ghostty'], null, GLib.SpawnFlags.SEARCH_PATH);
  }
}
