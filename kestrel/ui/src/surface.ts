import Shell from 'gi://Shell';
import St from 'gi://St';

export const PANEL_HEIGHT = 48;
export const PANEL_ICON_SIZE = 28;
export const SURFACE_GAP = 10;

export function blurSurface(actor: St.Widget, corners = 20): void {
  const stage = (global as unknown as Shell.Global).stage;
  const theme = St.ThemeContext.get_for_stage(stage);
  const effect = new Shell.BlurEffect({
    mode: Shell.BlurMode.BACKGROUND,
    radius: 30 * theme.scale_factor,
    brightness: 1,
  });
  effect.set_property('corner-radius', corners);
  actor.add_effect_with_name('backdrop', effect);
  const scaleChanged = theme.connect('notify::scale-factor', () => {
    effect.radius = 30 * theme.scale_factor;
  });
  actor.connect('destroy', () => theme.disconnect(scaleChanged));
}
