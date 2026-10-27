import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import * as Main from '../../main.js';

export interface MonitorConstraintOptions extends Partial<Clutter.Constraint.ConstructorProps> {
  primary?: boolean;
  index?: number;
  work_area?: boolean;
}

export const MonitorConstraint = GObject.registerClass({
  Properties: {
    'primary': GObject.ParamSpec.boolean('primary', null, null, GObject.ParamFlags.READWRITE, false),
    'index': GObject.ParamSpec.int('index', null, null, GObject.ParamFlags.READWRITE, -1, 64, -1),
    'work-area': GObject.ParamSpec.boolean('work-area', null, null, GObject.ParamFlags.READWRITE, false),
  },
}, class MonitorConstraint extends Clutter.Constraint {
  declare private onPrimary: boolean;
  declare private monitorIndex: number;
  declare private onWorkArea: boolean;
  private monitorsChangedId = 0;
  private workareasChangedId = 0;

  _init(props: MonitorConstraintOptions = {}): void {
    this.onPrimary = false;
    this.monitorIndex = -1;
    this.onWorkArea = false;

    super._init(props);
  }

  get primary(): boolean {
    return this.onPrimary;
  }

  set primary(v: boolean) {
    if (v) this.monitorIndex = -1;
    this.onPrimary = v;
    this.actor?.queue_relayout();
    this.notify('primary');
  }

  get index(): number {
    return this.monitorIndex;
  }

  set index(v: number) {
    this.onPrimary = false;
    this.monitorIndex = v;
    this.actor?.queue_relayout();
    this.notify('index');
  }

  get workArea(): boolean {
    return this.onWorkArea;
  }

  set workArea(v: boolean) {
    if (v === this.onWorkArea) return;
    this.onWorkArea = v;
    this.actor?.queue_relayout();
    this.notify('work-area');
  }

  vfunc_set_actor(actor: Clutter.Actor | null): void {
    if (actor) {
      this.monitorsChangedId ||= Main.layoutManager.connect('monitors-changed', () => this.actor.queue_relayout());
      this.workareasChangedId ||= global.display.connect('workareas-changed', () => {
        if (this.onWorkArea) this.actor.queue_relayout();
      });
    } else {
      if (this.monitorsChangedId) Main.layoutManager.disconnect(this.monitorsChangedId);
      this.monitorsChangedId = 0;

      if (this.workareasChangedId) global.display.disconnect(this.workareasChangedId);
      this.workareasChangedId = 0;
    }

    super.vfunc_set_actor(actor);
  }

  vfunc_update_allocation(_actor: Clutter.Actor, actorBox: Clutter.ActorBox): void {
    if (!this.onPrimary && this.monitorIndex < 0) return;
    if (!Main.layoutManager.primaryMonitor) return;

    const index = this.onPrimary
      ? Main.layoutManager.primaryIndex
      : Math.min(this.monitorIndex, Main.layoutManager.monitors.length - 1);

    const rect = this.onWorkArea
      ? global.workspace_manager.get_workspace_by_index(0)!.get_work_area_for_monitor(index)
      : Main.layoutManager.monitors[index];

    actorBox.init_rect(rect.x, rect.y, rect.width, rect.height);
  }
});
export type MonitorConstraint = InstanceType<typeof MonitorConstraint>;
