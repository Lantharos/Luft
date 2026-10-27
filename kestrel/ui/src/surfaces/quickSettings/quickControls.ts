import Clutter from 'gi://Clutter';
import St from 'gi://St';

export interface ControlMenu {
  actor: St.Widget;
  isOpen: boolean;
  hosted?: boolean;
  open(): void;
  connect(signal: string, callback: (menu: ControlMenu, open: boolean) => void): number;
  disconnectObject(object: object): void;
  close(params?: { animate: boolean }): void;
}

export interface QuickItem extends St.Button {
  menu?: ControlMenu;
  menuManager?: { removeMenu(menu: ControlMenu): void };
  slider?: St.Widget & { value: number };
  menuButton?: St.Button;
}

export interface QuickControl extends QuickItem {
  title?: string | null;
  subtitle?: string | null;
}

interface Indicator extends St.BoxLayout {
  quickSettingsItems: QuickControl[];
}

interface NetworkIndicator extends Indicator {
  wirelessToggle: QuickControl;
}

export interface QuickSettingsSource {
  network: NetworkIndicator;
  bluetooth: Indicator | null;
  volumeOutput: Indicator;
  brightness: Indicator;
  powerProfiles: Indicator;
  caffeine: Indicator;
  nightLight: Indicator;
  darkMode: Indicator;
  rain: Indicator;
  doNotDisturb: Indicator;
  rfkill: Indicator;
  backlight: Indicator;
  autoRotate: Indicator;
}

export function detach(actor: Clutter.Actor): void {
  actor.get_parent()?.remove_child(actor);
}
