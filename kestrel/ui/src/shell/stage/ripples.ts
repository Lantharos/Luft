import Clutter from 'gi://Clutter';
import St from 'gi://St';

interface RippleAnimation {
  delay: number;
  duration: number;
  startScale: number;
  startOpacity: number;
  finalScale: number;
}

const ANIMATIONS: RippleAnimation[] = [
  { delay: 0, duration: 830, startScale: 0.25, startOpacity: 1.0, finalScale: 1.5 },
  { delay: 50, duration: 1000, startScale: 0.0, startOpacity: 0.7, finalScale: 1.25 },
  { delay: 350, duration: 1000, startScale: 0.0, startOpacity: 0.3, finalScale: 1 },
];

export class Ripples {
  private readonly ripples: St.BoxLayout[];
  private stage?: Clutter.Actor;
  private x = 0;
  private y = 0;

  constructor(
    private readonly px: number,
    private readonly py: number,
    styleClass: string,
    private readonly animationRequired = false,
  ) {
    this.ripples = ANIMATIONS.map(() => {
      const ripple = new St.BoxLayout({ style_class: styleClass, opacity: 0, can_focus: false, reactive: false, visible: false });
      ripple.set_pivot_point(px, py);
      return ripple;
    });
  }

  destroy(): void {
    for (const ripple of this.ripples) ripple.destroy();
  }

  private animate(ripple: St.BoxLayout, { delay, duration, startScale, startOpacity, finalScale }: RippleAnimation): void {
    ripple.x = this.x;
    ripple.y = this.y;
    ripple.visible = true;
    ripple.opacity = 255 * Math.sqrt(startOpacity);
    ripple.scale_x = ripple.scale_y = startScale;
    ripple.set_translation(-this.px * ripple.width, -this.py * ripple.height, 0.0);
    const animationRequired = this.animationRequired;

    ripple.ease({
      opacity: 0,
      delay,
      duration,
      animationRequired,
      mode: Clutter.AnimationMode.EASE_IN_QUAD,
    });
    ripple.ease({
      scale_x: finalScale,
      scale_y: finalScale,
      delay,
      duration,
      animationRequired,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => (ripple.visible = false),
    });
  }

  addTo(stage: Clutter.Actor): void {
    if (this.stage !== undefined) throw new Error('Ripples already added');

    this.stage = stage;
    for (const ripple of this.ripples) stage.add_child(ripple);
  }

  playAnimation(x: number, y: number): void {
    if (this.stage === undefined) throw new Error('Ripples not added');

    this.x = x;
    this.y = y;

    let below: Clutter.Actor | null = null;
    for (const ripple of this.ripples) {
      this.stage.set_child_above_sibling(ripple, below);
      below = ripple;
    }

    this.ripples.forEach((ripple, index) => this.animate(ripple, ANIMATIONS[index]));
  }
}
