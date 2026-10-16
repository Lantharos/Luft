import St from 'gi://St';

import type { Context } from '../../context.js';
import { InputSourceIndicator } from '../../system/inputSources/indicator.js';
import { ContextMenus } from '../../desktop/menus/contextMenus.js';
import { ControlRow } from '../../desktop/menus/controlRow.js';
import type { Monitor } from '../../desktop/panel/panel.js';
import { battery, type BatteryState } from '../../shared/battery/battery.js';
import { BatteryIndicator } from '../../shared/battery/indicator.js';
import { LockAccessibility } from './accessibility.js';
import { LockPower } from './power.js';

export class LockControls {
  private readonly menus: ContextMenus;
  private readonly row: ControlRow;
  private readonly batteryStatus = new St.BoxLayout({ name: 'kestrel-lock-battery', style_class: 'kestrel-status-button kestrel-login-control kestrel-lock-battery', visible: false });
  private readonly unwatchBattery: () => void;
  private readonly inputSource: InputSourceIndicator;
  private readonly accessibility = new LockAccessibility();
  private readonly power = new LockPower();

  constructor(private readonly layoutManager: Context['layoutManager'], monitorAt: (x: number, y: number) => Monitor | null) {
    this.menus = new ContextMenus(monitorAt, () => {}, () => true, () => {}, () => {});
    this.menus.actor.add_style_class_name('kestrel-lock-menu');
    layoutManager.addTopChrome(this.menus.shield);
    layoutManager.addTopChrome(this.menus.actor);
    this.row = new ControlRow(this.menus, 'kestrel-lock-controls');
    this.batteryStatus.add_child(new BatteryIndicator(16).actor);
    this.unwatchBattery = battery.watch(state => this.showBattery(state));
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
    if (state) this.batteryStatus.accessible_name = `Battery ${state.percentage}%`;
  }

  destroy(): void {
    this.unwatchBattery();
    this.inputSource.shutdown();
    for (const actor of [this.menus.shield, this.menus.actor]) {
      this.layoutManager.removeChrome(actor);
      actor.destroy();
    }
  }
}
