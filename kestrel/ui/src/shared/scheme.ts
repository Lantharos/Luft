import type Shell from 'gi://Shell';
import St from 'gi://St';
import { getStyleVariant } from 'resource:///com/lantharos/kestrel/ui/kestrelTheme.js';

export const isDark = (): boolean => getStyleVariant() === 'dark';

export function watchScheme(changed: (dark: boolean) => void): () => void {
  const context = St.ThemeContext.get_for_stage((global as unknown as Shell.Global).stage);
  let dark = isDark();
  const id = context.connect('changed', () => {
    if (isDark() === dark) return;
    dark = !dark;
    changed(dark);
  });
  return () => context.disconnect(id);
}
