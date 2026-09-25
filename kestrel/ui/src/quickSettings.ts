import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import St from 'gi://St';
import { createInputSlider } from 'resource:///org/gnome/shell/ui/status/volume.js';

import { styleControl } from './controlTile.js';
import type { ContextMenus } from './contextMenus.js';
import { PagedPane } from './pagedPane.js';
import { attachSliderValue } from './sliderValue.js';
import { blurSurface } from './surface.js';
import { LOCK, POWER_ACTIONS, bindAvailability, type SessionAction } from './sessionActions.js';
import { detach, type QuickControl, type ControlMenu, type QuickSettingsSource } from './quickControls.js';

interface TrackedIcon extends St.Icon {
  connectObject(signal: string, callback: () => void, owner: Clutter.Actor): void;
}

type Subpage = ControlMenu | 'power';

export class QuickSettings {
  readonly actor = new St.BoxLayout({
    name: 'kestrel-quick-settings', orientation: Clutter.Orientation.VERTICAL,
    style_class: 'kestrel-popover kestrel-quick-settings', visible: false, reactive: true,
  });
  private readonly pages = new PagedPane();
  private readonly back: St.Button;
  private readonly footer = new St.BoxLayout({ style_class: 'kestrel-quick-footer' });
  private readonly content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-quick-content' });
  private readonly tiles = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-quick-tiles' });
  private readonly sliders = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-quick-sliders' });
  private readonly selectors = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, visible: false });
  private readonly powerPage = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-quick-power', visible: false });
  private readonly powerButton: St.Button;
  private readonly controls: St.Button[] = [];
  private subpage: Subpage | null = null;
  private layoutLater = 0;

  constructor(
    private readonly source: QuickSettingsSource,
    private readonly layoutChanged: () => void,
    private readonly close: () => void,
    statusChanged: (network: string, volume: string) => void,
    private readonly menus: ContextMenus,
  ) {
    blurSurface(this.actor);
    this.actor.connect('destroy', () => {
      if (this.layoutLater) (global as unknown as Shell.Global).compositor.get_laters().remove(this.layoutLater);
    });
    this.back = new St.Button({
      style_class: 'kestrel-quick-back', accessible_name: 'Back to quick settings',
      can_focus: true, track_hover: true, visible: false, x_align: Clutter.ActorAlign.START,
      child: this.labelledIcon('go-previous-symbolic', 'Back'),
    });
    this.back.connect('clicked', () => this.closeSubmenu());
    this.actor.add_child(this.back);
    menus.bind(this.actor, () => [{ label: 'Settings', run: () => menus.settings() }]);
    this.actor.add_child(this.pages.actor);
    this.pages.body.add_child(this.content);
    this.pages.body.add_child(this.selectors);
    this.selectors.add_child(this.powerPage);
    this.content.add_child(this.tiles);
    this.content.add_child(this.sliders);
    this.pages.body.connect('notify::height', () => this.queueLayout());

    this.footer.add_child(this.footerButton('emblem-system-symbolic', 'Settings', () => {
      Shell.AppSystem.get_default().lookup_app('org.gnome.Settings.desktop')?.activate();
      this.close();
    }));
    const lock = this.footerButton(LOCK.icon, 'Lock screen', () => { this.close(); LOCK.run(); });
    bindAvailability(LOCK, lock);
    this.footer.add_child(lock);
    this.footer.add_child(new St.Widget({ x_expand: true }));
    this.powerButton = this.footerButton('system-shutdown-symbolic', 'Power options', () => this.togglePower());
    this.footer.add_child(this.powerButton);
    this.actor.add_child(this.footer);
    for (const action of POWER_ACTIONS) this.powerPage.add_child(this.powerRow(action));

    source.ready.then(() => {
      const indicators = [[source._network, 'network'], [source._bluetooth, 'bluetooth'], [source._powerProfiles, 'power'],
        [source._nightLight, 'display'], [source._doNotDisturb, 'notifications']] as const;
      for (const [indicator, settingsPanel] of indicators) {
        for (const item of indicator?.quickSettingsItems ?? []) {
          this.adopt(item);
          styleControl(item);
          menus.bind(item, () => [{ label: 'Settings', run: () => menus.settings(settingsPanel) }]);
          this.controls.push(item);
          item.connect('notify::visible', () => this.arrangeTiles());
        }
      }
      this.arrangeTiles();
      this.addSlider('sound', source._volumeOutput.quickSettingsItems[0]);
      this.addSlider('sound', createInputSlider());
      this.addSlider('display', source._brightness.quickSettingsItems[0]);
      const networkIcons = source._network?.get_children() as TrackedIcon[] ?? [];
      const volumeIcons = source._volumeOutput.get_children() as TrackedIcon[];
      const updateStatus = () => statusChanged(
        networkIcons.find(icon => icon.visible)?.icon_name ?? 'network-offline-symbolic',
        volumeIcons.find(icon => icon.visible)?.icon_name ?? 'audio-volume-muted-symbolic',
      );
      for (const icon of [...networkIcons, ...volumeIcons]) {
        icon.connectObject('notify::icon-name', updateStatus, this.actor);
        icon.connectObject('notify::visible', updateStatus, this.actor);
      }
      updateStatus();
      this.queueLayout();
    }).catch(error => console.error('Quick settings could not initialize', error));
  }

  private labelledIcon(icon: string, label: string): St.BoxLayout {
    const box = new St.BoxLayout({ style_class: 'kestrel-quick-back-content' });
    box.add_child(new St.Icon({ icon_name: icon, icon_size: 16, y_align: Clutter.ActorAlign.CENTER }));
    box.add_child(new St.Label({ text: label, y_align: Clutter.ActorAlign.CENTER }));
    return box;
  }

  private footerButton(icon: string, label: string, activate: () => void): St.Button {
    const button = new St.Button({
      style_class: 'kestrel-icon-button', accessible_name: label, can_focus: true, track_hover: true,
      child: new St.Icon({ icon_name: icon, icon_size: 18 }),
    });
    button.connect('clicked', activate);
    return button;
  }

  private powerRow(action: SessionAction): St.Button {
    const row = new St.BoxLayout({ style_class: 'kestrel-power-row', x_expand: true });
    row.add_child(new St.Icon({ icon_name: action.icon, icon_size: 18, y_align: Clutter.ActorAlign.CENTER }));
    row.add_child(new St.Label({ text: action.label, y_align: Clutter.ActorAlign.CENTER }));
    const button = new St.Button({ style_class: 'kestrel-power-action', child: row, x_expand: true, can_focus: true, track_hover: true });
    button.connect('clicked', () => { this.close(); action.run(); });
    bindAvailability(action, button);
    return button;
  }

  private queueLayout(): void {
    if (this.layoutLater) return;
    const laters = (global as unknown as Shell.Global).compositor.get_laters();
    this.layoutLater = laters.add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.layoutLater = 0;
      this.layoutChanged();
      return GLib.SOURCE_REMOVE;
    });
  }

  preferredHeight(width: number, limit: number): number {
    const theme = this.actor.get_theme_node();
    const contentWidth = width - theme.get_horizontal_padding();
    const spacing = theme.get_length('spacing');
    const back = this.back.visible ? this.back.get_preferred_height(contentWidth)[1] + spacing : 0;
    const chrome = back + this.footer.get_preferred_height(contentWidth)[1] + spacing + theme.get_vertical_padding();
    return this.pages.measure(contentWidth, limit - chrome) + chrome;
  }

  closeSubmenu(): boolean {
    const subpage = this.subpage;
    if (!subpage) return false;
    if (subpage === 'power') this.showSubpage(null);
    else subpage.close({ animate: false });
    return true;
  }

  private togglePower(): void {
    if (this.subpage === 'power') {
      this.closeSubmenu();
      return;
    }
    if (this.subpage) this.subpage.close({ animate: false });
    this.showSubpage('power');
    this.powerPage.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
  }

  private showSubpage(subpage: Subpage | null): void {
    this.subpage = subpage;
    this.powerPage.visible = subpage === 'power';
    this.selectors.visible = this.selectors.get_children().some(child => child.visible);
    this.content.visible = !subpage;
    this.back.visible = !!subpage;
    if (subpage === 'power') this.powerButton.add_style_pseudo_class('checked');
    else this.powerButton.remove_style_pseudo_class('checked');
    this.pages.reset();
    this.queueLayout();
  }

  private adopt(item: QuickControl): void {
    const enableHover = (actor: Clutter.Actor) => {
      if (actor instanceof St.Button) actor.track_hover = true;
      actor.get_children().forEach(enableHover);
    };
    enableHover(item);
    detach(item);
    if (item.show_on_set_parent) item.show();
    if (!item.menu) return;
    const menu = item.menu;
    item._menuManager?.removeMenu(menu);
    detach(menu.actor);
    menu.actor.clear_constraints();
    this.selectors.add_child(menu.actor);
    menu.actor.connect('notify::height', () => this.queueLayout());
    menu.actor.connect('notify::visible', () => {
      this.selectors.visible = this.selectors.get_children().some(child => child.visible);
      this.queueLayout();
    });
    menu.connect('open-state-changed', (_menu, open: boolean) => {
      if (open) {
        if (this.subpage !== menu) this.closeSubmenu();
        this.showSubpage(menu);
        menu.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
      } else if (this.subpage === menu) {
        this.showSubpage(null);
      }
    });
  }

  private arrangeTiles(): void {
    for (const item of this.controls) detach(item);
    this.tiles.destroy_all_children();
    const visible = this.controls.filter(item => item.visible);
    for (let index = 0; index < visible.length; index += 2) {
      const row = new St.BoxLayout({ style_class: 'kestrel-quick-row' });
      (row.layout_manager as Clutter.BoxLayout).homogeneous = true;
      for (const item of visible.slice(index, index + 2)) {
        item.x_expand = true;
        row.add_child(item);
      }
      if (row.get_n_children() === 1) row.add_child(new St.Widget({ x_expand: true }));
      this.tiles.add_child(row);
    }
    this.queueLayout();
  }

  private addSlider(settingsPanel: string, item: QuickControl): void {
    this.adopt(item);
    this.menus.bind(item, () => [{ label: 'Settings', run: () => this.menus.settings(settingsPanel) }]);
    if (item.slider) {
      item.slider.add_style_class_name('kestrel-slider');
      attachSliderValue(item, item.slider);
    }
    const menuSpace = new St.Widget({ style_class: 'kestrel-slider-menu-space' });
    item.bind_property('menu-enabled', menuSpace, 'visible', GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.INVERT_BOOLEAN);
    item.get_child()!.add_child(menuSpace);
    item.connect('notify::visible', () => this.queueLayout());
    this.sliders.add_child(item);
  }
}
