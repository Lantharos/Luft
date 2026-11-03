import type { ApiContext } from '../context.js';
import type { Layer, LayerOptions, Wallpaper } from '../types.js';
import { WallpaperLayer } from './layer.js';

export function wallpaperApi({ layers, scope, manifest }: ApiContext): Wallpaper {
  return {
    addLayer: (options: LayerOptions): Layer => {
      const layer = new WallpaperLayer(options, layers, scope, `extension-layer:${manifest.id}`);
      const handle = scope.disposable(() => layer.destroy());
      return {
        get active() {
          return layer.active;
        },
        set active(active: boolean) {
          layer.active = active;
        },
        dispose: () => handle.dispose(),
      };
    },
  };
}
