import Gio from 'gi://Gio';

const icons = new Map<string, Gio.Icon>();

function cached(key: string, create: () => Gio.Icon): Gio.Icon {
  let icon = icons.get(key);
  if (!icon) {
    icon = create();
    icons.set(key, icon);
  }
  return icon;
}

export function themedIcon(name: string): Gio.Icon {
  return cached(name, () => Gio.ThemedIcon.new(name));
}

export function fileIcon(name: string, folder: boolean): Gio.Icon {
  if (folder) return cached('inode/directory', () => Gio.content_type_get_symbolic_icon('inode/directory'));
  const dot = name.lastIndexOf('.');
  const extension = dot > 0 ? name.slice(dot).toLowerCase() : name;
  return cached(extension, () => Gio.content_type_get_symbolic_icon(Gio.content_type_guess(name, null)[0]));
}
