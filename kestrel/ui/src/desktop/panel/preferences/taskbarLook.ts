import type Shell from 'gi://Shell';
import type St from 'gi://St';
import { blurBackdrop } from '../../../appearance/kestrelGlass.js';

import { isDark, watchScheme } from '../../../shared/display/scheme.js';
import type { TaskbarLook } from '../../../../../../packages/web/ui/src/taskbar/looks';
import { taskbarPreferences } from './taskbarPreferences.js';

const BLURRED: TaskbarLook[] = ['glass', 'accent'];

export class TaskbarSurface {
  private readonly blur: Shell.BlurEffect;
  private readonly baseClasses: string;
  private shaped: number | null = null;

  constructor(private readonly actor: St.Widget, private readonly peek: St.Widget) {
    this.baseClasses = actor.style_class;
    this.blur = blurBackdrop(actor, 0);
    const unwatch = watchScheme(() => this.sync());
    actor.connect('destroy', unwatch);
    this.sync();
  }

  get radius(): number {
    return this.shaped ?? taskbarPreferences.metrics.radius;
  }

  sync(): void {
    const { look, size, style, pureBlack, touch } = taskbarPreferences;
    const opaque = pureBlack && isDark();
    this.actor.style_class = [
      this.baseClasses, `kestrel-taskbar-${look}`, touch ? 'kestrel-taskbar-touch' : `kestrel-taskbar-${size}`,
      ...style === 'floating' ? ['kestrel-taskbar-floating'] : [],
      ...opaque ? ['kestrel-taskbar-opaque'] : [],
    ].join(' ');
    this.blur.enabled = BLURRED.includes(look) && !opaque;
    this.round();
  }

  shape(radius: number | null): void {
    this.shaped = radius;
    this.round();
  }

  private round(): void {
    const radius = this.radius;
    this.blur.set_property('corner-radius', radius);
    this.actor.style = `border-radius: ${radius}px;`;
    this.peek.style = radius ? `border-radius: 0 ${radius}px ${radius}px 0;` : null;
  }
}
