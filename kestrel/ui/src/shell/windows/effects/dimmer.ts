import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';

const DIM_BRIGHTNESS = -0.3;
const DIM_TIME = 500;
const UNDIM_TIME = 250;
const WINDOW_DIMMER_EFFECT_NAME = 'kestrel-window-dimmer';
const BRIGHTNESS_PROPERTY = `@effects.${WINDOW_DIMMER_EFFECT_NAME}.brightness`;

const WindowDimmer = GObject.registerClass(
class WindowDimmer extends Clutter.BrightnessContrastEffect {
  constructor() {
    super({
      name: WINDOW_DIMMER_EFFECT_NAME,
      enabled: false,
    });
  }

  private syncEnabled(dimmed: boolean): void {
    const animating = this.actor!.get_transition(BRIGHTNESS_PROPERTY) !== null;
    this.enabled = Meta.prefs_get_attach_modal_dialogs() && (animating || dimmed);
  }

  setDimmed(dimmed: boolean, animate: boolean): void {
    const val = 127 * (1 + (dimmed ? 1 : 0) * DIM_BRIGHTNESS);
    const color = new Cogl.Color({
      red: val,
      green: val,
      blue: val,
      alpha: 255,
    });

    this.actor!.ease_property(BRIGHTNESS_PROPERTY, color, {
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      duration: (dimmed ? DIM_TIME : UNDIM_TIME) * (animate ? 1 : 0),
      onStopped: () => this.syncEnabled(dimmed),
    });

    this.syncEnabled(dimmed);
  }
});
type WindowDimmer = InstanceType<typeof WindowDimmer>;

function windowDimmer(actor: Clutter.Actor): WindowDimmer {
  let effect = actor.get_effect(WINDOW_DIMMER_EFFECT_NAME) as WindowDimmer | null;
  if (!effect) {
    effect = new WindowDimmer();
    actor.add_effect(effect);
  }
  return effect;
}

export class WindowDimming {
  private readonly dimmed = new WeakSet<Meta.Window>();

  constructor(private readonly animate: () => boolean) {}

  check(window: Meta.Window): void {
    const shouldDim = window.has_attached_dialogs();
    if (shouldDim === this.dimmed.has(window)) return;

    if (shouldDim)
      this.dimmed.add(window);
    else
      this.dimmed.delete(window);

    const actor = window.get_compositor_private() as Clutter.Actor | null;
    if (actor) windowDimmer(actor).setDimmed(shouldDim, this.animate());
  }
}
