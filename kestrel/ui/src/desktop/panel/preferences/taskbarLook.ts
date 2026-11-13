import type Shell from 'gi://Shell';
import type St from 'gi://St';
import { blurBackdrop } from '../../../appearance/glass/kestrelGlass.js';

import { isDark, watchScheme } from '../../../shared/display/scheme.js';
import type { TaskbarLook } from '../../../../../../packages/web/ui/src/taskbar/looks';
import { isVertical, rightToLeft } from '../../../shared/layout/edge.js';
import type { Island } from '../islands/islandSet.js';
import { taskbarPreferences, type TaskbarLayout } from './taskbarPreferences.js';

const BLURRED: TaskbarLook[] = ['glass', 'accent'];

const surfaces = new Set<TaskbarSurface>();
let blurHeld = false;

export function setTaskbarBlurHeld(held: boolean): void {
  blurHeld = held;
  for (const surface of surfaces) surface.sync();
}

export class TaskbarSurface {
  private readonly blur: Shell.BlurEffect;
  private readonly baseClasses: string;
  private readonly blurs = new WeakMap<St.Widget, Shell.BlurEffect>();
  private shaped: number | null = null;

  constructor(private readonly actor: St.Widget, private readonly peek: St.Widget, private readonly islands: () => readonly Island[],
    private readonly screen: () => TaskbarLayout) {
    this.baseClasses = actor.style_class;
    this.blur = blurBackdrop(actor, 0, 'taskbar');
    const unwatch = watchScheme(() => this.sync());
    surfaces.add(this);
    actor.connect('destroy', () => {
      unwatch();
      surfaces.delete(this);
    });
    this.sync();
  }

  get radius(): number {
    return this.shaped ?? this.screen().metrics.radius;
  }

  get separate(): boolean {
    return !this.screen().joined;
  }

  behind(island: St.Widget): St.Widget {
    return this.separate ? island : this.actor;
  }

  sync(): void {
    const { look, pureBlack } = taskbarPreferences;
    const { size, style, touch, vertical } = this.screen();
    const opaque = pureBlack && isDark();
    const separate = this.separate;
    const surface = [`kestrel-taskbar-${look}`, ...opaque ? ['kestrel-taskbar-opaque'] : []];
    const sizing = touch ? 'kestrel-taskbar-touch' : `kestrel-taskbar-${size}`;
    const across = (runsDown: boolean) => runsDown ? ['kestrel-taskbar-vertical'] : [];
    this.actor.style_class = separate
      ? ['kestrel-taskbar-separate', sizing].join(' ')
      : [this.baseClasses, sizing, ...style === 'floating' ? ['kestrel-taskbar-floating'] : [], ...surface, ...across(vertical)].join(' ');
    this.actor.reactive = !separate;
    const blurred = BLURRED.includes(look) && !opaque && !blurHeld;
    this.blur.enabled = blurred && !separate;
    for (const { actor, edge } of this.islands()) {
      actor.style_class = separate ? ['kestrel-panel', sizing, ...surface, ...across(isVertical(edge))].join(' ') : '';
      actor.reactive = separate;
      this.blurOf(actor).enabled = blurred && separate;
    }
    this.syncPeek();
    this.round();
  }

  syncPeek(): void {
    this.peek.visible = !this.screen().touch && !this.separate;
  }

  shape(radius: number | null): void {
    this.shaped = radius;
    this.roundBar(this.separate);
  }

  private roundBar(separate: boolean): void {
    const radius = separate ? 0 : this.radius;
    this.blur.set_property('corner-radius', radius);
    this.actor.style = `border-radius: ${radius}px;`;
    this.peek.style = radius ? `border-radius: ${this.peekCorners(`${radius}px`)};` : null;
  }

  private round(): void {
    const separate = this.separate;
    this.roundBar(separate);
    const { thickness, button, radius: islandRadius } = this.screen().metrics;
    for (const { actor } of this.islands()) {
      this.blurOf(actor).set_property('corner-radius', separate ? islandRadius : 0);
      actor.style = separate ? `border-radius: ${islandRadius}px; padding: ${(thickness - button) / 2}px;` : null;
    }
  }

  private blurOf(island: St.Widget): Shell.BlurEffect {
    let blur = this.blurs.get(island);
    if (!blur) {
      blur = blurBackdrop(island, 0, 'taskbar');
      this.blurs.set(island, blur);
    }
    return blur;
  }

  private peekCorners(radius: string): string {
    if (this.screen().vertical) return `0 0 ${radius} ${radius}`;
    return rightToLeft() ? `${radius} 0 0 ${radius}` : `0 ${radius} ${radius} 0`;
  }
}
