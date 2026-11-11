import type Clutter from 'gi://Clutter';

interface WallpaperPicture {
  actor: Clutter.Actor;
  underWindows: boolean;
}

const pictures = new Set<WallpaperPicture>();
const listeners = new Set<() => void>();

function changed(): void {
  for (const listener of listeners) listener();
}

export function showsWallpaper(actor: Clutter.Actor, underWindows: boolean): () => void {
  const picture = { actor, underWindows };
  pictures.add(picture);
  const destroyed = actor.connect('destroy', () => forget());
  const forget = () => {
    actor.disconnect(destroyed);
    pictures.delete(picture);
    changed();
  };
  changed();
  return forget;
}

export const wallpaperPictures = (): WallpaperPicture[] => [...pictures];

export function watchWallpaperPictures(watcher: () => void): () => void {
  listeners.add(watcher);
  return () => listeners.delete(watcher);
}
