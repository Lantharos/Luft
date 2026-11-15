import type GdkPixbuf from 'gi://GdkPixbuf';
import type Gio from 'gi://Gio';
import type GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { accentColor, fromHex, isNeutral, seedFromPicture, type Rgb } from '../../../../../../appearance/color.js';
import { luftPaint } from '../../../../../../appearance/icons/paint.js';
import type { EffectWindow } from '../../../types.js';

const SAMPLED_SIZE = 32;
const SEEN_ALPHA = 128;

const known = new Map<string, Promise<Rgb | null>>();
let theme: St.IconTheme | null = null;
let watching = false;

function samples(pixbuf: GdkPixbuf.Pixbuf): Rgb[] {
  const pixels = pixbuf.get_pixels();
  const channels = pixbuf.get_n_channels();
  const stride = pixbuf.get_rowstride();
  const found: Rgb[] = [];
  for (let y = 0; y < pixbuf.get_height(); y++) {
    for (let x = 0; x < pixbuf.get_width(); x++) {
      const at = y * stride + x * channels;
      if (channels === 4 && pixels[at + 3] < SEEN_ALPHA) continue;
      found.push([pixels[at], pixels[at + 1], pixels[at + 2]]);
    }
  }
  return found;
}

function iconColor(appId: string): Promise<Rgb | null> {
  const icon = Shell.AppSystem.get_default().lookup_app(appId)?.get_icon();
  const info = icon && (theme ??= new St.IconTheme()).lookup_by_gicon(icon, SAMPLED_SIZE, St.IconLookupFlags.FORCE_SIZE);
  if (!info) return Promise.resolve(null);
  return new Promise(resolve => info.load_icon_async(null, ((_info: St.IconInfo, result: Gio.AsyncResult) => {
    try {
      const seed = seedFromPicture(samples(info.load_icon_finish(result)));
      resolve(isNeutral(seed) ? null : accentColor(seed));
    } catch {
      resolve(null);
    }
  }) as unknown as GObject.Closure));
}

/** The app's own colour: its shade in Luft's icon palette, or the colour its icon is mostly drawn in. `null` when it has none. */
function appColor({ appId }: EffectWindow): Promise<Rgb | null> {
  if (!appId) return Promise.resolve(null);
  const shade = luftPaint(appId)?.shade;
  if (shade) return Promise.resolve(fromHex(shade));
  if (!watching) {
    watching = true;
    Shell.AppSystem.get_default().connect('installed-changed', () => known.clear());
  }
  let color = known.get(appId);
  if (!color) known.set(appId, color = iconColor(appId));
  return color;
}

const NONE = [-1, -1, -1];

/** Gives a shader that names `uniform` the app's colour once it's known, and a negative one until then or when there's none. */
export function followAppColor(uniform: string, sources: readonly (string | undefined)[], window: EffectWindow, set: (values: number[]) => void): void {
  if (!sources.some(source => source?.includes(uniform))) return;
  set(NONE);
  void appColor(window).then(color => {
    if (color) set(color.map(channel => channel / 255));
  });
}
