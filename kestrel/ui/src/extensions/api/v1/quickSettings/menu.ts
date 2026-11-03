import type Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import type St from 'gi://St';

import { t } from '../../../../shared/i18n/index.js';
import * as PopupMenu from '../../../../shared/popups/popupMenu.js';
import { Slider } from '../../../../shared/widgets/slider.js';
import type { ApiContext } from '../context.js';
import type { MenuItem, SettingDescription, SliderSetting } from '../types.js';

class SliderItem extends PopupMenu.PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  readonly slider: Slider;

  constructor(label: string) {
    super({ activate: false, style_class: 'keyboard-brightness-item' });
    this.slider = new Slider(0);
    this.slider.accessible_name = label;
    this.add_child(this.slider);
  }

  vfunc_navigate_focus(from: Clutter.Actor | null, direction: St.DirectionType): boolean {
    return this.slider.navigate_focus(from, direction, false);
  }
}

type Sync = () => void;

function checkItem(label: string, checked: () => boolean, toggle: () => void): [PopupMenu.PopupBaseMenuItem, Sync] {
  const item = new PopupMenu.PopupMenuItem(label);
  item.connect('activate', toggle);
  return [item, () => item.setOrnament(checked() ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE)];
}

function sliderItem(context: ApiContext, setting: SliderSetting, label: string): [PopupMenu.PopupBaseMenuItem, Sync] {
  const item = new SliderItem(label);
  const span = setting.max - setting.min;
  const step = (value: number) => setting.step ? Number((setting.min + Math.round((value - setting.min) / setting.step) * setting.step).toPrecision(12)) : value;
  let syncing = false;
  item.slider.connect('notify::value', () => {
    if (syncing) return;
    const value = Math.min(setting.max, step(setting.min + item.slider.value * span));
    if (context.values.get(setting.key) !== value) context.values.set(setting.key, value);
  });
  return [item, () => {
    syncing = true;
    item.slider.value = ((context.values.get(setting.key) as number) - setting.min) / span;
    syncing = false;
  }];
}

function settingItems(context: ApiContext, setting: SettingDescription): [PopupMenu.PopupBaseMenuItem, Sync][] {
  const { values, translations } = context;
  const label = translations.t(setting.label);
  switch (setting.type) {
    case 'switch':
      return [checkItem(label, () => values.get(setting.key) === true, () => values.set(setting.key, values.get(setting.key) !== true))];
    case 'choice':
      return setting.options.map(option =>
        checkItem(translations.t(option.label), () => values.get(setting.key) === option.value, () => values.set(setting.key, option.value)));
    case 'slider':
      return [sliderItem(context, setting, label)];
    case 'color':
      throw new Error(`${setting.key} is a colour, which only Settings can show`);
  }
}

/** Fills a quick settings menu from the extension's description, and keeps setting entries in step with their values. */
export function fillMenu(menu: PopupMenu.PopupMenuBase, items: readonly MenuItem[], context: ApiContext, toggleSetting?: string): () => void {
  const syncs: Sync[] = [];
  for (const entry of items) {
    if (entry === 'separator') {
      menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    } else if (entry === 'settings') {
      menu.addAction(t('extension-menu-settings', { name: context.name }), () => context.openSettings());
    } else if ('setting' in entry) {
      const setting = context.values.describe(entry.setting);
      for (const [item, sync] of settingItems(context, setting)) {
        menu.addMenuItem(item);
        syncs.push(() => {
          item.visible = context.values.shown(setting.key, toggleSetting);
          sync();
        });
      }
    } else {
      const [item, sync] = checkItem(entry.label, () => !!entry.checked, context.scope.guard(() => entry.onActivate()));
      menu.addMenuItem(item);
      syncs.push(sync);
    }
  }
  const syncAll = () => syncs.forEach(sync => sync());
  syncAll();
  return context.values.watch(syncAll);
}
