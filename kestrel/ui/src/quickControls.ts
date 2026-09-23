import Clutter from 'gi://Clutter';
import St from 'gi://St';

export interface ControlMenu {
  actor: St.Widget;
  isOpen: boolean;
  open(): void;
  connect(signal: string, callback: (menu: ControlMenu, open: boolean) => void): number;
  disconnectObject(object: object): void;
  close(params?: { animate: boolean }): void;
}

export interface QuickControl extends St.Button {
  subtitle: string | null;
  menu?: ControlMenu;
  _menuManager?: { removeMenu(menu: ControlMenu): void };
  slider?: St.Widget & { value: number };
}

interface Indicator extends St.BoxLayout {
  quickSettingsItems: QuickControl[];
}

export interface QuickSettingsSource {
  ready: Promise<void>;
  menu: object;
  _network: Indicator | null;
  _bluetooth: Indicator | null;
  _volumeOutput: Indicator;
  _brightness: Indicator;
  _powerProfiles: Indicator;
  _nightLight: Indicator;
  _doNotDisturb: Indicator;
}

export function detach(actor: Clutter.Actor): void {
  actor.get_parent()?.remove_child(actor);
}
