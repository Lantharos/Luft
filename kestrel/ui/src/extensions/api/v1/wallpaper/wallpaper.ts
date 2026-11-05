import { extensionFile } from '../audio/files.js';
import type { ApiContext } from '../context.js';
import type { Layer, LayerOptions, Wallpaper } from '../types.js';
import { WallpaperLayer } from './layer.js';
import { DesktopSprites } from './sprites.js';

export function wallpaperApi({ layers, scope, manifest, path, dataPath }: ApiContext): Wallpaper {
  return {
    addSprites: () => {
      const sprites = new DesktopSprites(layers, scope, `extension-sprite:${manifest.id}`, file => extensionFile([path, dataPath], file).get_path()!);
      const handle = scope.disposable(() => sprites.destroy());
      return {
        loadSheet: options => sprites.loadSheet(options),
        add: options => sprites.add(options),
        onFrame: step => sprites.onFrame(step),
        lift: lifted => sprites.lift(lifted),
        dispose: () => handle.dispose(),
      };
    },
    get surfaces() {
      return layers.surfaces.displays();
    },
    onSurfacesChanged: changed => scope.disposable(layers.surfaces.watch(scope.guard(changed))),
    followPointer: options => {
      const follower = layers.pointers.follow(options, scope);
      const handle = scope.disposable(() => follower.stop());
      return {
        setAreas: areas => follower.setAreas(areas),
        dispose: () => handle.dispose(),
      };
    },
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
        reshape: () => layer.reshape(),
        setPictures: (name, files) => layer.setPictures(name, files.map(file => extensionFile([path, dataPath], file).get_path()!)),
        dispose: () => handle.dispose(),
      };
    },
  };
}
