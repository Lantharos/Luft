import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import { SwitcherList } from './switcherList.js';
import { SwitcherPopup } from './switcherPopup.js';

const APP_ICON_SIZE = 96;

interface MonitorConfig {
  icon: string;
  label: string;
  configType: Meta.MonitorSwitchConfigType;
}

function monitorConfigs(): MonitorConfig[] {
  const configs: MonitorConfig[] = [
    { icon: 'shell-display-mirror-symbolic', label: KestrelUi.t('switch-monitor-mirror'), configType: Meta.MonitorSwitchConfigType.ALL_MIRROR },
    { icon: 'shell-display-extend-all-symbolic', label: KestrelUi.t('switch-monitor-join'), configType: Meta.MonitorSwitchConfigType.ALL_LINEAR },
  ];

  if (global.backend.get_monitor_manager().has_builtin_panel) {
    configs.push(
      { icon: 'shell-display-external-only-symbolic', label: KestrelUi.t('switch-monitor-external-only'), configType: Meta.MonitorSwitchConfigType.EXTERNAL },
      { icon: 'shell-display-built-in-only-symbolic', label: KestrelUi.t('switch-monitor-built-in-only'), configType: Meta.MonitorSwitchConfigType.BUILTIN },
    );
  }

  return configs;
}

class SwitchMonitorSwitcher extends SwitcherList {
  static {
    GObject.registerClass(this);
  }

  constructor(configs: MonitorConfig[]) {
    super(true);

    for (const config of configs) this.addIcon(config);
  }

  private addIcon({ icon, label }: MonitorConfig): void {
    const box = new St.BoxLayout({ style_class: 'alt-tab-app', orientation: Clutter.Orientation.VERTICAL });
    box.add_child(new St.Icon({ icon_name: icon, icon_size: APP_ICON_SIZE }));

    const text = new St.Label({ text: label, x_align: Clutter.ActorAlign.CENTER });
    box.add_child(text);

    this.addItem(box, text);
  }
}

export class SwitchMonitorPopup extends SwitcherPopup<MonitorConfig> {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    const configs = monitorConfigs();
    super(configs, new SwitchMonitorSwitcher(configs));
  }

  open(backward: boolean, binding: string, mask: number): boolean {
    if (!global.backend.get_monitor_manager().can_switch_config()) return false;

    return super.open(backward, binding, mask);
  }

  protected initialSelection(): void {
    const currentConfig = global.backend.get_monitor_manager().get_switch_config();
    this.select((currentConfig + 1) % this.items.length);
  }

  protected keyPressHandler(keysym: number, action: number): boolean {
    if (action === Meta.KeyBindingAction.SWITCH_MONITOR) this.select(this.next());
    else if (keysym === Clutter.KEY_Left) this.select(this.previous());
    else if (keysym === Clutter.KEY_Right) this.select(this.next());
    else return Clutter.EVENT_PROPAGATE;

    return Clutter.EVENT_STOP;
  }

  protected finish(timestamp: number): void {
    super.finish(timestamp);

    global.backend.get_monitor_manager().switch_config(this.items[this.selectedIndex].configType);
  }
}
