import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import St from 'gi://St';
import { createInputSlider } from 'resource:///org/gnome/shell/ui/status/volume.js';

import type { ContextMenus, MenuEntry } from '../menus/contextMenus.js';
import { ScrollPane } from './scrollPane.js';
import { attachSliderValue } from './sliderValue.js';
import type { SessionManager } from '../session/sessionManager.js';
import { animateActor } from '../shared/motion.js';
import { blurSurface } from '../shared/surface.js';
import type { BatteryState } from './battery.js';
import { detach, type QuickControl, type ControlMenu, type QuickSettingsSource } from './quickControls.js';
import { styleControl } from './tiles/controlTile.js';
import { ActionTiles, type Tile } from './tiles/actionTiles.js';
import { TileGrid } from './tiles/tileGrid.js';
import { TileDrag } from './tiles/tileDrag.js';
import { TileLayout } from './tiles/tileLayout.js';

const REVEAL_AFTER = 320;

interface TrackedIcon extends St.Icon {
  connectObject(signal: string, callback: () => void, owner: Clutter.Actor): void;
}

interface RegisteredTile extends Tile {
  name(): string;
}

export class QuickSettings {
  readonly actor = new St.BoxLayout({
    name: 'kestrel-quick-settings', orientation: Clutter.Orientation.VERTICAL,
    style_class: 'kestrel-popover kestrel-quick-settings', visible: false, reactive: true,
  });
  private readonly scroll = new ScrollPane();
  private readonly content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-quick-content' });
  private readonly sliders = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-quick-sliders' });
  private readonly grid: TileGrid;
  private readonly drag: TileDrag;
  private readonly layoutStore = new TileLayout();
  private readonly tiles: RegisteredTile[] = [];
  private readonly actions: ActionTiles;
  private openMenu: ControlMenu | null = null;
  private batteryState: BatteryState | null = null;
  private updateStatus = () => {};
  private layoutLater = 0;
  private revealTimer = 0;

  constructor(
    source: QuickSettingsSource,
    private readonly layoutChanged: () => void,
    close: () => void,
    statusChanged: (icons: string[]) => void,
    private readonly menus: ContextMenus,
    takeScreenshot: () => void,
    session: SessionManager,
  ) {
    blurSurface(this.actor);
    this.grid = new TileGrid({
      resized: () => this.queueLayout(),
      menuOpened: menu => this.menuOpened(menu),
      menuClosed: menu => this.menuClosed(menu),
    });
    this.drag = new TileDrag(this.grid, () => this.saveOrder());
    this.actions = new ActionTiles({ takeScreenshot, openSettings: panel => menus.settings(panel), close }, state => {
      this.batteryState = state;
      this.updateStatus();
    });
    const stopWatchingInhibitors = session.watchInhibitors(() => this.updateStatus());
    this.actor.connect('destroy', () => {
      if (this.layoutLater) (global as unknown as Shell.Global).compositor.get_laters().remove(this.layoutLater);
      if (this.revealTimer) GLib.Source.remove(this.revealTimer);
      this.actions.destroy();
      stopWatchingInhibitors();
    });
    menus.bind(this.actor, () => this.surfaceMenu());
    this.scroll.body.add_style_class_name('kestrel-quick-scroll-body');
    this.actor.add_child(this.scroll.actor);
    this.scroll.body.add_child(this.content);
    this.content.add_child(this.grid.actor);
    this.content.add_child(this.sliders);
    this.scroll.body.connect('notify::height', () => this.queueLayout());

    source.ready.then(() => {
      const indicators = [['network', source._network, 'network'], ['bluetooth', source._bluetooth, 'bluetooth'],
        ['airplane', source._rfkill, 'wifi'], ['power', source._powerProfiles, 'power'], ['keep-awake', source._caffeine, 'power'],
        ['night-light', source._nightLight, 'display'], ['dark-style', source._darkMode, 'background'],
        ['do-not-disturb', source._doNotDisturb, 'notifications'], ['keyboard', source._backlight, 'power'],
        ['rotation', source._autoRotate, 'display']] as const;
      for (const [key, indicator, settingsPanel] of indicators) {
        (indicator?.quickSettingsItems ?? []).forEach((item, index) => {
          this.adoptTile(item);
          this.register({ id: `${key}-${index}`, actor: item, settingsPanel, name: () => item.title ?? key });
        });
      }
      for (const tile of this.actions.tiles)
        this.register({ ...tile, name: () => tile.id === 'battery' ? 'Battery' : tile.actor.accessible_name });
      this.arrangeTiles(false);
      this.addSlider(source._volumeOutput.quickSettingsItems[0]);
      this.addSlider(createInputSlider());
      this.addSlider(source._brightness.quickSettingsItems[0]);
      const networkIcons = source._network?.get_children() as TrackedIcon[] ?? [];
      const bluetoothIcons = source._bluetooth?.get_children() as TrackedIcon[] ?? [];
      const airplaneIcons = source._rfkill.get_children() as TrackedIcon[];
      const volumeIcons = source._volumeOutput.get_children() as TrackedIcon[];
      const visibleIcon = (icons: TrackedIcon[]) => icons.find(icon => icon.visible)?.icon_name;
      this.updateStatus = () => statusChanged([
        session.keepingAwake ? 'view-reveal-symbolic' : undefined,
        visibleIcon(airplaneIcons),
        visibleIcon(networkIcons) ?? 'network-offline-symbolic',
        visibleIcon(bluetoothIcons),
        visibleIcon(volumeIcons) ?? 'audio-volume-muted-symbolic',
        this.batteryState?.iconName,
      ].filter((icon): icon is string => !!icon));
      for (const icon of [...airplaneIcons, ...networkIcons, ...bluetoothIcons, ...volumeIcons]) {
        icon.connectObject('notify::icon-name', this.updateStatus, this.actor);
        icon.connectObject('notify::visible', this.updateStatus, this.actor);
      }
      this.updateStatus();
      this.queueLayout();
    }).catch(error => console.error('Quick settings could not initialize', error));
  }

  preferredHeight(width: number, limit: number): number {
    const theme = this.actor.get_theme_node();
    const contentWidth = width - theme.get_horizontal_padding();
    const chrome = theme.get_vertical_padding();
    this.grid.setWidth(contentWidth - this.scroll.body.get_theme_node().get_horizontal_padding());
    return this.scroll.measure(contentWidth, limit - chrome, !this.grid.animating) + chrome;
  }

  closeSubmenu(animate = true): boolean {
    const open = this.openMenu;
    if (!open) return false;
    if (open === this.grid.openMenu) this.grid.collapse(animate);
    else open.close({ animate });
    return true;
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

  private register(tile: RegisteredTile): void {
    this.tiles.push(tile);
    this.menus.bind(tile.actor, () => this.tileMenu(tile));
    tile.actor.connect('notify::visible', () => this.grid.refresh());
    this.drag.attach(tile.actor);
    const menu = (tile.actor as QuickControl).menu;
    if (menu) this.grid.addMenu(tile.actor, menu);
  }

  private arrangeTiles(animate: boolean): void {
    const removed = this.layoutStore.removed;
    const byId = new Map(this.tiles.map(tile => [tile.id, tile]));
    const order = this.layoutStore.order(this.tiles.map(tile => tile.id));
    this.grid.setTiles(order.filter(id => !removed.has(id)).map(id => byId.get(id)!.actor), animate);
  }

  private saveOrder(): void {
    const placed = this.grid.order.map(actor => this.tiles.find(tile => tile.actor === actor)!.id);
    const removed = this.layoutStore.order(this.tiles.map(tile => tile.id)).filter(id => !placed.includes(id));
    this.layoutStore.saveOrder([...placed, ...removed]);
  }

  private tileMenu(tile: RegisteredTile): MenuEntry[] {
    const entries: MenuEntry[] = [];
    if (tile.settingsPanel) entries.push({ label: 'Settings', run: () => this.menus.settings(tile.settingsPanel!) });
    entries.push({
      label: 'Remove', run: () => {
        this.layoutStore.remove(tile.id);
        this.arrangeTiles(true);
      },
    });
    return entries;
  }

  private surfaceMenu(): MenuEntry[] {
    const entries: MenuEntry[] = [];
    const removed = this.layoutStore.removed;
    const addable = this.tiles.filter(tile => removed.has(tile.id) && tile.actor.visible);
    if (addable.length) {
      entries.push({
        label: 'Add',
        children: addable.map(tile => ({
          label: tile.name(), run: () => {
            this.layoutStore.restore(tile.id);
            this.arrangeTiles(true);
          },
        })),
      });
    }
    if (this.layoutStore.customized) {
      entries.push({
        label: 'Reset', run: () => {
          this.layoutStore.reset();
          this.arrangeTiles(true);
        },
      });
    }
    return entries;
  }

  private menuOpened(menu: ControlMenu): void {
    if (this.openMenu && this.openMenu !== menu) this.closeSubmenu();
    this.openMenu = menu;
    this.queueLayout();
    if (this.revealTimer) GLib.Source.remove(this.revealTimer);
    this.revealTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, REVEAL_AFTER, () => {
      this.revealTimer = 0;
      if (menu.isOpen) this.scroll.reveal(menu.actor);
      return GLib.SOURCE_REMOVE;
    });
  }

  private menuClosed(menu: ControlMenu): void {
    if (this.openMenu === menu) this.openMenu = null;
    this.queueLayout();
  }

  private prepare(item: QuickControl): ControlMenu | null {
    const enableHover = (actor: Clutter.Actor) => {
      if (actor instanceof St.Button) actor.track_hover = true;
      actor.get_children().forEach(enableHover);
    };
    enableHover(item);
    detach(item);
    if (item.show_on_set_parent) item.show();
    if (!item.menu) return null;
    item._menuManager?.removeMenu(item.menu);
    detach(item.menu.actor);
    item.menu.actor.clear_constraints();
    return item.menu;
  }

  private adoptTile(item: QuickControl): void {
    this.prepare(item);
    styleControl(item);
  }

  private addSlider(item: QuickControl): void {
    const menu = this.prepare(item);
    if (item.slider) {
      item.slider.add_style_class_name('kestrel-slider');
      attachSliderValue(item.slider);
    }
    const menuSpace = new St.Widget({ style_class: 'kestrel-slider-menu-space' });
    item.bind_property('menu-enabled', menuSpace, 'visible', GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.INVERT_BOOLEAN);
    item.get_child()!.add_child(menuSpace);
    item.connect('notify::visible', () => this.queueLayout());
    this.sliders.add_child(item);
    if (!menu) return;
    menu.actor.add_style_class_name('kestrel-inline-menu');
    menu.actor.connect('notify::height', () => this.queueLayout());
    const chevron = item._menuButton?.child;
    chevron?.set_pivot_point(0.5, 0.5);
    menu.connect('open-state-changed', (_menu, open: boolean) => {
      if (chevron) animateActor(chevron, { rotation_angle_z: open ? -90 : 0, duration: 180, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
      if (open) this.menuOpened(menu);
      else this.menuClosed(menu);
    });
    this.sliders.add_child(menu.actor);
  }
}
