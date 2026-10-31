import type Shell from 'gi://Shell';
import type St from 'gi://St';
import { blurBackdrop } from '../../../appearance/kestrelGlass.js';

import { isDark, watchScheme } from '../../../shared/display/scheme.js';
import type { TaskbarLook } from '../../../../../../packages/web/ui/src/taskbar/looks';
import { rightToLeft } from '../../../shared/layout/edge.js';
import { taskbarPreferences } from './taskbarPreferences.js';

const BLURRED: TaskbarLook[] = ['glass', 'accent'];

interface Island {
  actor: St.Widget;
  blur: Shell.BlurEffect;
}

export class TaskbarSurface {
  private readonly blur: Shell.BlurEffect;
  private readonly baseClasses: string;
  private readonly islands: Island[];
  private shaped: number | null = null;

  constructor(private readonly actor: St.Widget, private readonly peek: St.Widget, islands: St.Widget[]) {
    this.baseClasses = actor.style_class;
    this.blur = blurBackdrop(actor, 0);
    this.islands = islands.map(island => ({ actor: island, blur: blurBackdrop(island, 0) }));
    const unwatch = watchScheme(() => this.sync());
    actor.connect('destroy', unwatch);
    this.sync();
  }

  get radius(): number {
    return this.shaped ?? taskbarPreferences.metrics.radius;
  }

  get separate(): boolean {
    return taskbarPreferences.style === 'separate';
  }

  behind(island: St.Widget): St.Widget {
    return this.separate ? island : this.actor;
  }

  sync(): void {
    const { look, size, style, pureBlack, touch, vertical } = taskbarPreferences;
    const opaque = pureBlack && isDark();
    const separate = this.separate;
    const surface = [
      `kestrel-taskbar-${look}`,
      ...vertical ? ['kestrel-taskbar-vertical'] : [],
      ...opaque ? ['kestrel-taskbar-opaque'] : [],
    ];
    const sizing = touch ? 'kestrel-taskbar-touch' : `kestrel-taskbar-${size}`;
    this.actor.style_class = separate
      ? ['kestrel-taskbar-separate', sizing, ...vertical ? ['kestrel-taskbar-vertical'] : []].join(' ')
      : [this.baseClasses, sizing, ...style === 'floating' ? ['kestrel-taskbar-floating'] : [], ...surface].join(' ');
    this.actor.reactive = !separate;
    for (const { actor } of this.islands) {
      actor.style_class = separate ? ['kestrel-panel', sizing, ...surface].join(' ') : '';
      actor.reactive = separate;
    }
    const blurred = BLURRED.includes(look) && !opaque;
    this.blur.enabled = blurred && !separate;
    for (const { blur } of this.islands) blur.enabled = blurred && separate;
    this.syncPeek();
    this.round();
  }

  syncPeek(): void {
    this.peek.visible = !taskbarPreferences.touch && !this.separate;
  }

  shape(radius: number | null): void {
    this.shaped = radius;
    this.round();
  }

  private round(): void {
    const separate = this.separate;
    const radius = separate ? 0 : this.radius;
    this.blur.set_property('corner-radius', radius);
    this.actor.style = `border-radius: ${radius}px;`;
    this.peek.style = radius ? `border-radius: ${this.peekCorners(`${radius}px`)};` : null;
    const { thickness, button, radius: islandRadius } = taskbarPreferences.metrics;
    for (const { actor, blur } of this.islands) {
      blur.set_property('corner-radius', separate ? islandRadius : 0);
      actor.style = separate ? `border-radius: ${islandRadius}px; padding: ${(thickness - button) / 2}px;` : null;
    }
  }

  private peekCorners(radius: string): string {
    if (taskbarPreferences.vertical) return `0 0 ${radius} ${radius}`;
    return rightToLeft() ? `${radius} 0 0 ${radius}` : `0 ${radius} ${radius} 0`;
  }
}
