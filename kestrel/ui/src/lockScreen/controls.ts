import Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { Context } from '../context.js';
import { InputSourceIndicator } from '../inputSources/indicator.js';
import { ContextMenus } from '../menus/contextMenus.js';
import { ControlRow } from '../menus/controlRow.js';
import type { Monitor } from '../panel/panel.js';
import { Battery, type BatteryState } from '../quickSettings/battery.js';
import { LockAccessibility } from './accessibility.js';
import { LockPower } from './power.js';

export class LockControls {
  private readonly menus: ContextMenus;
  private readonly row: ControlRow;
  private readonly batteryIcon = new St.Icon({ icon_size: 16, y_align: Clutter.ActorAlign.CENTER });
  private readonly batteryLabel = new St.Label({ style_class: 'kestrel-login-label', y_align: Clutter.ActorAlign.CENTER });
  private readonly batteryStatus = new St.BoxLayout({ name: 'kestrel-lock-battery', style_class: 'kestrel-status-button kestrel-login-control kestrel-lock-battery', visible: false });
  private readonly battery = new Battery(state => this.showBattery(state));
  private readonly inputSource: InputSourceIndicator;
  private readonly accessibility = new LockAccessibility();
  private readonly power = new LockPower();

  constructor(private readonly layoutManager: Context['layoutManager'], monitorAt: (x: number, y: number) => Monitor | null) {
    this.menus = new ContextMenus(monitorAt, () => {}, () => true, () => {}, () => {});
    layoutManager.addTopChrome(this.menus.shield);
    layoutManager.addTopChrome(this.menus.actor);
    this.row = new ControlRow(this.menus, 'kestrel-lock-controls');
    this.batteryStatus.add_child(this.batteryIcon);
    this.batteryStatus.add_child(this.batteryLabel);
    this.row.add(this.batteryStatus);
    this.inputSource = new InputSourceIndicator(this.menus, () => []);
    this.row.add(this.inputSource.actor);
    this.row.button('kestrel-lock-accessibility', 'Accessibility', this.row.icon('preferences-desktop-accessibility-symbolic'), () => this.accessibility.entries());
    this.row.button('kestrel-lock-power', 'Power', this.row.icon('system-shutdown-symbolic'), () => this.power.entries());
  }

  get actor(): St.BoxLayout {
    return this.row.actor;
  }

  private showBattery(state: BatteryState | null): void {
    this.batteryStatus.visible = !!state;
    if (!state) return;
    this.batteryIcon.icon_name = state.iconName;
    this.batteryLabel.text = `${state.percentage}%`;
    this.batteryStatus.accessible_name = `Battery ${state.percentage}%`;
  }

  destroy(): void {
    this.battery.destroy();
    this.inputSource.shutdown();
    for (const actor of [this.menus.shield, this.menus.actor]) {
      this.layoutManager.removeChrome(actor);
      actor.destroy();
    }
  }
}
