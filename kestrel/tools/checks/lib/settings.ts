import type Gio from 'gi://Gio';

export function remember(settings: Gio.Settings, keys: readonly string[]) {
  const found = keys.map(key => [key, settings.get_user_value(key)] as const);
  return () => {
    for (const [key, value] of found) {
      if (value) settings.set_value(key, value);
      else settings.reset(key);
    }
  };
}
