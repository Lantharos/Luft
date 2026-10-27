import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { EventEmitter } from '../runtime/signals.js';

export const DEFAULT_LOCALE = 'en_US';
export const DEFAULT_LAYOUT = 'us';
export const DEFAULT_VARIANT = '';

const MAX_LAYOUTS_PER_GROUP = 4;
const USER_LAYOUT_FOLDERS = ['symbols', 'rules'];
const USER_LAYOUT_SETTLE_MS = 250;
const LOCALE_PATTERN = /^([A-Za-z][a-z]{0,2})(?:_([A-Z]{2}))?(?:\.[A-Za-z0-9][A-Za-z0-9-]*)?(?:@[a-z]*)?$/;
const LOCALE_LAYOUTS = new Map([
  ['ar_DZ', 'ara+azerty'],
  ['ast_ES', 'es+ast'],
  ['az_AZ', 'az'],
  ['be_BY', 'by'],
  ['bg_BG', 'bg+phonetic'],
  ['cat_ES', 'es+cat'],
  ['cs_CZ', 'cz'],
  ['de_CH', 'ch'],
  ['de_DE', 'de'],
  ['el_CY', 'gr'],
  ['el_GR', 'gr'],
  ['en_GB', 'gb'],
  ['en_US', 'us'],
  ['en_ZA', 'za'],
  ['es_ES', 'es'],
  ['es_GT', 'latam'],
  ['es_MX', 'latam'],
  ['es_US', 'us+intl'],
  ['fr_BE', 'be'],
  ['fr_CH', 'ch+fr'],
  ['fr_FR', 'fr+oss'],
  ['gl_ES', 'es'],
  ['he_IL', 'il'],
  ['id_ID', 'us'],
  ['it_IT', 'it'],
  ['nl_NL', 'us+altgr-intl'],
  ['pl_PL', 'pl'],
  ['pt_BR', 'br'],
  ['pt_PT', 'pt'],
  ['ru_RU', 'ru'],
  ['sk_SK', 'sk'],
  ['tr_TR', 'tr'],
]);

interface XkbLayout {
  layout: string;
  variant: string;
}

export interface LayoutInfo extends XkbLayout {
  id: string;
  displayName: string;
  shortName: string;
  group: LayoutInfo[];
  groupIndex: number;
}

interface CurrentKeymap {
  layouts: string;
  variants: string;
  options: string;
  model: string;
  displayNames: string[];
  shortNames: string[];
}

interface KeyboardManagerSignals {
  'keymap-changed': () => void;
}

let xkbInfo: Shell.XkbInfo | null = null;

export function getXkbInfo(): Shell.XkbInfo {
  xkbInfo ??= new Shell.XkbInfo();
  return xkbInfo;
}

export function watchUserLayouts(callback: (xkbInfo: Shell.XkbInfo) => void): Gio.FileMonitor[] {
  let pending = 0;
  const settled = () => {
    pending = 0;
    xkbInfo = new Shell.XkbInfo();
    callback(xkbInfo);
    return GLib.SOURCE_REMOVE;
  };
  return USER_LAYOUT_FOLDERS.map(folder => {
    const path = GLib.build_filenamev([GLib.get_user_config_dir(), 'xkb', folder]);
    const monitor = Gio.File.new_for_path(path).monitor_directory(Gio.FileMonitorFlags.WATCH_MOVES, null);
    monitor.connect('changed', () => {
      if (pending) GLib.source_remove(pending);
      pending = GLib.timeout_add(GLib.PRIORITY_DEFAULT, USER_LAYOUT_SETTLE_MS, settled);
    });
    return monitor;
  });
}

let keyboardManager: KeyboardManager | null = null;

export function getKeyboardManager(): KeyboardManager {
  keyboardManager ??= new KeyboardManager();
  return keyboardManager;
}

function seatKeymap(): Clutter.Keymap {
  return global.stage.context.get_backend().get_default_seat().get_keymap();
}

class KeyboardManager extends EventEmitter {
  declare connect: GObject.SignalMethods<this, KeyboardManagerSignals>['connect'];
  declare emit: GObject.SignalMethods<this, KeyboardManagerSignals>['emit'];

  private xkbInfo = getXkbInfo();
  private current: LayoutInfo | null = null;
  private readonly localeLayoutInfo = this.localeLayout();
  private layoutInfos = new Map<string, LayoutInfo>();
  private currentKeymap: CurrentKeymap | null = null;
  private keymapDescription: Meta.KeymapDescription | null = null;
  private ourKeymapDescription: Meta.KeymapDescription | null = null;
  private xkbOptions: string[] = [];
  private xkbModel = '';

  constructor() {
    super();

    global.backend.connect('keymap-changed', () => {
      this.keymapDescription = global.backend.get_keymap_description();
      this.emit('keymap-changed');
    });
    global.backend.connect('keymap-layout-group-changed', () => this.emit('keymap-changed'));
    global.backend.connect('reset-keymap-description', () => this.ourKeymapDescription!);
    global.backend.connect('reset-keymap-layout-index', () => this.current!.groupIndex);
  }

  private syncCurrentKeymap(info: LayoutInfo): { keymap: CurrentKeymap; changed: boolean } {
    const options = this.xkbOptions.join(',');
    const [layouts, variants] = this.buildGroupStrings(info.group);
    const model = this.xkbModel;

    if (this.currentKeymap &&
      this.currentKeymap.layouts === layouts &&
      this.currentKeymap.variants === variants &&
      this.currentKeymap.options === options &&
      this.currentKeymap.model === model)
      return { keymap: this.currentKeymap, changed: false };

    this.currentKeymap = {
      layouts,
      variants,
      options,
      model,
      displayNames: info.group.map(g => g.displayName),
      shortNames: info.group.map(g => g.shortName),
    };
    return { keymap: this.currentKeymap, changed: true };
  }

  private createKeymapDescription(keymap: CurrentKeymap): Meta.KeymapDescription {
    return Meta.KeymapDescription.new_from_rules(keymap.model, keymap.layouts, keymap.variants, keymap.options, keymap.displayNames, keymap.shortNames);
  }

  private async doApply(id: string): Promise<void> {
    const info = this.layoutInfos.get(id);
    if (!info) return;

    const { keymap, changed } = this.syncCurrentKeymap(info);
    const previous = this.ourKeymapDescription;
    const recreate = changed || this.isExternal() || !previous;
    const description = recreate ? this.createKeymapDescription(keymap) : previous;
    this.ourKeymapDescription = description;

    if (recreate || !this.current || this.current.groupIndex !== info.groupIndex)
      await global.backend.set_keymap_async(description, info.groupIndex, null);

    this.current = info;
  }

  apply(id: string): void {
    this.doApply(id).catch(logError);
  }

  reapply(): void {
    if (!this.current) return;

    this.doApply(this.current.id).catch(logError);
  }

  reloadLayouts(xkbInfo: Shell.XkbInfo): void {
    this.xkbInfo = xkbInfo;
    this.currentKeymap = null;
  }

  setUserLayouts(ids: string[]): void {
    this.current = null;
    this.layoutInfos = new Map();

    for (const id of ids) {
      const [found, displayName, shortName, layout, variant] = this.xkbInfo.get_layout_info(id);
      if (found) this.layoutInfos.set(id, { id, layout, variant, displayName, shortName, group: [], groupIndex: 0 });
    }

    let group: LayoutInfo[] = [];
    for (const id of ids) {
      const info = this.layoutInfos.get(id);
      if (!info) continue;

      const isLocale = this.isLocaleLayout(info);
      const hasLocale = group.some(g => this.isLocaleLayout(g));

      if (group.length === MAX_LAYOUTS_PER_GROUP ||
        (group.length === MAX_LAYOUTS_PER_GROUP - 1 && !hasLocale && !isLocale))
        group = [];

      info.groupIndex = group.length;
      group.push(info);
      info.group = group;
    }
  }

  private localeLayout(): XkbLayout {
    let locale = GLib.get_language_names()[0];
    if (!locale.includes('_')) locale = DEFAULT_LOCALE;

    const [, language, country] = LOCALE_PATTERN.exec(locale) ?? [];
    const id = LOCALE_LAYOUTS.get(`${language}_${country}`) ?? DEFAULT_LAYOUT;
    const [found, , , layout, variant] = this.xkbInfo.get_layout_info(id);
    return found ? { layout, variant } : { layout: DEFAULT_LAYOUT, variant: DEFAULT_VARIANT };
  }

  private isLocaleLayout(info: XkbLayout): boolean {
    return info.layout === this.localeLayoutInfo.layout && info.variant === this.localeLayoutInfo.variant;
  }

  private buildGroupStrings(group: XkbLayout[]): [string, string] {
    const layouts = group.some(g => this.isLocaleLayout(g)) ? group : [...group, this.localeLayoutInfo];
    return [layouts.map(g => g.layout).join(','), layouts.map(g => g.variant).join(',')];
  }

  setKeyboardOptions(options: string[]): void {
    this.xkbOptions = options;
  }

  setKeyboardModel(model: string): void {
    this.xkbModel = model;
  }

  get currentLayout(): LayoutInfo | null {
    return this.current;
  }

  get shortName(): string | null {
    return seatKeymap().get_current_short_name();
  }

  get displayName(): string | null {
    return seatKeymap().get_current_display_name();
  }

  isLocked(): boolean {
    return this.keymapDescription?.is_locked() ?? false;
  }

  isExternal(): boolean {
    if (!this.keymapDescription) return false;
    if (!this.ourKeymapDescription) return true;
    return !this.keymapDescription.direct_equal(this.ourKeymapDescription);
  }
}
