import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import St from 'gi://St';
import { createInputSlider } from 'resource:///org/gnome/shell/ui/status/volume.js';

import { blurSurface } from './surface.js';
import { detach, type QuickControl, type ControlMenu, type QuickSettingsSource } from './quickControls.js';

interface TrackedIcon extends St.Icon {
  connectObject(signal: string, callback: () => void, owner: Clutter.Actor): void;
}

export class QuickSettings {
  readonly actor = new St.BoxLayout({
    name: 'kestrel-quick-settings', orientation: Clutter.Orientation.VERTICAL,
    style_class: 'kestrel-popover kestrel-quick-settings', visible: false, reactive: true,
  });
  private readonly header = new St.BoxLayout({ style_class: 'kestrel-quick-header' });
  private readonly content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-quick-content' });
  private readonly tiles = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-quick-tiles' });
  private readonly selectors = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, visible: false });
  private readonly controls: QuickControl[] = [];
  private activeMenu: ControlMenu | null = null;
  private layoutLater = 0;

  constructor(
    private readonly source: QuickSettingsSource,
    private readonly layoutChanged: () => void,
    close: () => void,
    statusChanged: (network: string, volume: string) => void,
  ) {
    blurSurface(this.actor);
    this.actor.connect('destroy', () => {
      if (this.layoutLater) (global as unknown as Shell.Global).compositor.get_laters().remove(this.layoutLater);
    });
    const header = this.header;
    header.add_child(new St.Label({ text: 'Quick settings', style_class: 'kestrel-title', x_expand: true, y_align: Clutter.ActorAlign.CENTER }));
    const settings = new St.Button({
      style_class: 'kestrel-icon-button', accessible_name: 'Settings', can_focus: true,
      child: new St.Icon({ icon_name: 'emblem-system-symbolic', icon_size: 20 }),
    });
    settings.connect('clicked', () => {
      Shell.AppSystem.get_default().lookup_app('org.gnome.Settings.desktop')?.activate();
      close();
    });
    header.add_child(settings);
    this.actor.add_child(header);
    const scroll = new St.ScrollView({
      height: 0, y_expand: true, x_expand: true,
      hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.AUTOMATIC,
    });
    scroll.child = this.content;
    this.actor.add_child(scroll);
    this.content.add_child(this.tiles);
    this.content.add_child(this.selectors);
    this.content.connect('notify::height', () => this.queueLayout());

    source.ready.then(() => {
      const indicators = [source._network, source._bluetooth, source._powerProfiles,
        source._nightLight, source._doNotDisturb];
      for (const indicator of indicators) {
        for (const item of indicator?.quickSettingsItems ?? []) {
          this.adopt(item);
          this.controls.push(item);
          item.connect('notify::visible', () => this.arrangeTiles());
        }
      }
      this.arrangeTiles();
      this.addSlider('Sound output', source._volumeOutput.quickSettingsItems[0]);
      this.addSlider('Microphone', createInputSlider());
      this.addSlider('Brightness', source._brightness.quickSettingsItems[0]);
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
    return Math.min(limit, this.content.get_preferred_height(width - 48)[1]
      + this.header.get_preferred_height(width - 48)[1] + 64);
  }

  closeSubmenu(): boolean {
    if (!this.activeMenu) return false;
    this.activeMenu.close({ animate: false });
    this.activeMenu = null;
    return true;
  }

  private adopt(item: QuickControl): void {
    detach(item);
    if (!item.menu) return;
    const menu = item.menu;
    menu.disconnectObject(this.source.menu);
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
        if (this.activeMenu !== menu) this.closeSubmenu();
        this.activeMenu = menu;
      } else if (this.activeMenu === menu) {
        this.activeMenu = null;
      }
      this.queueLayout();
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
      if (index + 1 === visible.length) row.add_child(new St.Widget({ x_expand: true }));
      this.tiles.add_child(row);
    }
    this.queueLayout();
  }

  private addSlider(title: string, item: QuickControl): void {
    this.adopt(item);
    const section = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-slider-section' });
    const header = new St.BoxLayout();
    header.add_child(new St.Label({ text: title, style_class: 'kestrel-section-title', x_expand: true }));
    if (item.slider) {
      const slider = item.slider;
      const value = new St.Label({ style_class: 'kestrel-muted' });
      const update = () => value.text = `${Math.round(slider.value * 100)}%`;
      slider.connect('notify::value', update);
      update();
      header.add_child(value);
    }
    section.add_child(header);
    section.add_child(item);
    item.slider?.add_style_class_name('kestrel-slider');
    const sync = () => {
      section.visible = item.visible;
      this.queueLayout();
    };
    item.connect('notify::visible', sync);
    this.content.add_child(section);
    sync();
  }
}
