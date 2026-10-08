import type Shell from 'gi://Shell';
import type St from 'gi://St';
import { blurBackdrop } from 'resource:///com/lantharos/kestrel/ui/kestrelGlass.js';

import { taskbarPreferences, type TaskbarLook, type TaskbarSize } from './taskbarPreferences.js';

const LOOKS: TaskbarLook[] = ['glass', 'solid', 'transparent', 'accent'];
const SIZES: TaskbarSize[] = ['compact', 'normal', 'large'];
const BLURRED: TaskbarLook[] = ['glass', 'accent'];

function toggleClass(actor: St.Widget, name: string, enabled: boolean): void {
  if (enabled) actor.add_style_class_name(name);
  else actor.remove_style_class_name(name);
}

export class TaskbarSurface {
  private readonly blur: Shell.BlurEffect;

  constructor(private readonly actor: St.Widget, private readonly peek: St.Widget) {
    this.blur = blurBackdrop(actor, 0);
    this.sync();
  }

  sync(): void {
    const { look, size, style, pureBlack, metrics: { radius } } = taskbarPreferences;
    for (const name of LOOKS) toggleClass(this.actor, `kestrel-taskbar-${name}`, name === look);
    for (const name of SIZES) toggleClass(this.actor, `kestrel-taskbar-${name}`, name === size);
    toggleClass(this.actor, 'kestrel-taskbar-floating', style === 'floating');
    toggleClass(this.actor, 'kestrel-taskbar-opaque', pureBlack);
    this.blur.enabled = BLURRED.includes(look) && !pureBlack;
    this.blur.set_property('corner-radius', radius);
    this.actor.style = `border-radius: ${radius}px;`;
    this.peek.style = radius ? `border-radius: 0 ${radius}px ${radius}px 0;` : null;
  }
}
