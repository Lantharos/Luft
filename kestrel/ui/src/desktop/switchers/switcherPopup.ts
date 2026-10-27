import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from '../../core/main.js';
import type { ItemList } from './switcherList.js';

const POPUP_DELAY_TIMEOUT = 150;
const POPUP_FADE_OUT_TIME = 100;

const DISABLE_HOVER_TIMEOUT = 500;
const NO_MODS_TIMEOUT = 1500;

const mod = (a: number, b: number) => (a + b) % b;

function primaryModifier(mask: number): number {
  if (mask === 0) return 0;

  let primary = 1;
  while (mask > 1) {
    mask >>= 1;
    primary <<= 1;
  }
  return primary;
}

export abstract class SwitcherPopup<Item = unknown> extends St.Widget {
  static {
    GObject.registerClass({ GTypeFlags: GObject.TypeFlags.ABSTRACT }, this as unknown as typeof St.Widget);
  }

  protected selectedIndex = 0;
  private mouseActive = false;
  private grab: Clutter.Grab | null = null;
  private modifierMask = 0;
  private motionTimeoutId = 0;
  private initialDelayTimeoutId = 0;
  private noModsTimeoutId = 0;

  constructor(protected readonly items: Item[], protected readonly switcherList: ItemList) {
    super({ style_class: 'switcher-popup', reactive: true, visible: false });

    this.connect('destroy', () => this.onDestroy());

    Main.uiGroup.add_child(this);

    Main.layoutManager.connectObject('system-modal-opened', () => this.destroy(), this);

    this.add_constraint(new Clutter.BindConstraint({ source: global.stage, coordinate: Clutter.BindCoordinate.ALL }));

    const longPressGesture = new Clutter.LongPressGesture({ long_press_duration_ms: 0 });
    longPressGesture.connect('may-recognize', () => {
      const coords = longPressGesture.get_coords_abs();
      const actorAtCoords = global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, coords.x, coords.y);
      return !this.switcherList.contains(actorAtCoords);
    });
    longPressGesture.connect('recognize', () => this.fadeAndDestroy());
    this.add_action(longPressGesture);

    const keyController = new Clutter.KeyController();
    keyController.connect('key-press', () => this.onKeyPress(keyController));
    keyController.connect('modifier-change', () => this.onModifierChange(keyController));
    this.add_action(keyController);

    const scrollController = new Clutter.ScrollController();
    scrollController.connect('scroll', (_controller, _sprite, _source, _dx, dy) => this.onScroll(dy));
    this.add_action(scrollController);

    this.disableHover();
  }

  vfunc_allocate(box: Clutter.ActorBox): void {
    this.set_allocation(box);

    const childBox = new Clutter.ActorBox();
    const primary = Main.layoutManager.primaryMonitor!;

    const leftPadding = this.get_theme_node().get_padding(St.Side.LEFT);
    const rightPadding = this.get_theme_node().get_padding(St.Side.RIGHT);
    const hPadding = leftPadding + rightPadding;

    const [, childNaturalHeight] = this.switcherList.get_preferred_height(primary.width - hPadding);
    const [, childNaturalWidth] = this.switcherList.get_preferred_width(childNaturalHeight);
    childBox.x1 = Math.max(primary.x + leftPadding, primary.x + Math.floor((primary.width - childNaturalWidth) / 2));
    childBox.x2 = Math.min(primary.x + primary.width - rightPadding, childBox.x1 + childNaturalWidth);
    childBox.y1 = primary.y + Math.floor((primary.height - childNaturalHeight) / 2);
    childBox.y2 = childBox.y1 + childNaturalHeight;
    this.switcherList.allocate(childBox);
  }

  protected initialSelection(backward: boolean): void {
    if (backward) this.select(this.items.length - 1);
    else if (this.items.length === 1) this.select(0);
    else this.select(1);
  }

  open(backward: boolean, _binding: string, mask: number): boolean {
    if (this.items.length === 0) return false;

    this.grab = Main.pushModal(this);
    this.modifierMask = primaryModifier(mask);

    this.add_child(this.switcherList);
    this.switcherList.connect('item-activated', (_list, index) => {
      this.select(index);
      this.finish(global.get_current_time());
    });
    this.switcherList.connect('item-entered', (_list, index) => {
      if (this.mouseActive) this.select(index);
    });
    this.switcherList.connect('item-removed', (_list, index) => this.itemRemoved(index));

    this.opacity = 0;
    this.visible = true;
    this.get_allocation_box();

    this.initialSelection(backward);

    if (this.modifierMask) {
      const [, , mods] = global.get_pointer();
      if (!(mods & this.modifierMask)) {
        this.finish(global.get_current_time());
        return true;
      }
    } else {
      this.resetNoModsTimeout();
    }

    this.initialDelayTimeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, POPUP_DELAY_TIMEOUT, () => this.showImmediately());
    GLib.Source.set_name_by_id(this.initialDelayTimeoutId, '[kestrel] Main.osdWindow.cancel');
    return true;
  }

  private showImmediately(): void {
    if (this.initialDelayTimeoutId === 0) return;

    GLib.source_remove(this.initialDelayTimeoutId);
    this.initialDelayTimeoutId = 0;

    Main.osdWindowManager.hideAll();
    this.opacity = 255;
  }

  protected next(): number {
    return mod(this.selectedIndex + 1, this.items.length);
  }

  protected previous(): number {
    return mod(this.selectedIndex - 1, this.items.length);
  }

  protected abstract keyPressHandler(keysym: number, action: number): boolean;

  private onKeyPress(controller: Clutter.KeyController): boolean {
    const [, keysym, keycode] = controller.get_key();
    const [, pressed, latched, locked] = controller.get_state();
    const action = global.display.get_keybinding_action(keycode, pressed | latched | locked);

    this.disableHover();

    if (this.keyPressHandler(keysym, action) !== Clutter.EVENT_PROPAGATE) {
      this.showImmediately();
      return Clutter.EVENT_STOP;
    }

    if (keysym === Clutter.KEY_Escape || keysym === Clutter.KEY_Tab) this.fadeAndDestroy();

    if (keysym === Clutter.KEY_space ||
      keysym === Clutter.KEY_Return ||
      keysym === Clutter.KEY_KP_Enter ||
      keysym === Clutter.KEY_ISO_Enter)
      this.finish(Clutter.get_current_event_time());

    return Clutter.EVENT_STOP;
  }

  private onModifierChange(controller: Clutter.KeyController): boolean {
    if (this.modifierMask) {
      const [, pressed, latched, locked] = controller.get_state();
      if (((pressed | latched | locked) & this.modifierMask) === 0) this.finish(Clutter.get_current_event_time());
    } else {
      this.resetNoModsTimeout();
    }

    return Clutter.EVENT_STOP;
  }

  private onScroll(dy: number): void {
    this.disableHover();
    this.select(dy > 0 ? this.next() : this.previous());
  }

  private itemRemoved(index: number): void {
    if (this.items.length === 0) {
      this.fadeAndDestroy();
      return;
    }

    if (index < this.selectedIndex) this.select(this.selectedIndex - 1);
    else if (index === this.selectedIndex) this.select(Math.min(index, this.items.length - 1));
  }

  private disableHover(): void {
    this.mouseActive = false;

    if (this.motionTimeoutId !== 0) GLib.source_remove(this.motionTimeoutId);

    this.motionTimeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, DISABLE_HOVER_TIMEOUT, () => {
      this.motionTimeoutId = 0;
      this.mouseActive = true;
    });
    GLib.Source.set_name_by_id(this.motionTimeoutId, '[kestrel] this._mouseTimedOut');
  }

  private resetNoModsTimeout(): void {
    if (this.noModsTimeoutId !== 0) GLib.source_remove(this.noModsTimeoutId);

    this.noModsTimeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, NO_MODS_TIMEOUT, () => {
      this.finish(global.display.get_current_time_roundtrip());
      this.noModsTimeoutId = 0;
    });
  }

  private popModal(): void {
    if (!this.grab) return;

    Main.popModal(this.grab);
    this.grab = null;
  }

  fadeAndDestroy(): void {
    this.popModal();
    if (this.opacity > 0) {
      this.ease({
        opacity: 0,
        duration: POPUP_FADE_OUT_TIME,
        mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        onComplete: () => this.destroy(),
      });
    } else {
      this.destroy();
    }
  }

  protected finish(_timestamp: number): void {
    this.fadeAndDestroy();
  }

  protected onDestroy(): void {
    this.popModal();

    if (this.motionTimeoutId !== 0) GLib.source_remove(this.motionTimeoutId);
    if (this.initialDelayTimeoutId !== 0) GLib.source_remove(this.initialDelayTimeoutId);
    if (this.noModsTimeoutId !== 0) GLib.source_remove(this.noModsTimeoutId);

    this.switcherList.destroy();
  }

  protected select(index: number): void {
    this.selectedIndex = index;
    this.switcherList.highlight(index);
  }
}
