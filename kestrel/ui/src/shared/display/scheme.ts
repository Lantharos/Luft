import St from 'gi://St';
import { getStyleVariant } from '../../appearance/kestrelTheme.js';

export const isDark = (): boolean => getStyleVariant() === 'dark';

export function watchScheme(changed: (dark: boolean) => void): () => void {
  const context = St.ThemeContext.get_for_stage(global.stage);
  let dark = isDark();
  const id = context.connect('changed', () => {
    if (isDark() === dark) return;
    dark = !dark;
    changed(dark);
  });
  return () => context.disconnect(id);
}
