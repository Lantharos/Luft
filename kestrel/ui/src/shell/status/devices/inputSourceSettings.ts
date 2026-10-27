import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';

import { EventEmitter } from '../../runtime/signals.js';
import { INPUT_SOURCE_TYPE_XKB } from './inputSource.js';

export interface InputSourceSpec {
  type: string;
  id: string;
}

interface InputSourceSettingsSignals {
  'input-sources-changed': () => void;
  'keyboard-options-changed': () => void;
  'keyboard-model-changed': () => void;
  'per-window-changed': () => void;
}

const LOCALE_BUS_NAME = 'org.freedesktop.locale1';
const LOCALE_BUS_PATH = '/org/freedesktop/locale1';

const DESKTOP_INPUT_SOURCES_SCHEMA = 'org.gnome.desktop.input-sources';
const KEY_INPUT_SOURCES = 'sources';
const KEY_MRU_SOURCES = 'mru-sources';
const KEY_KEYBOARD_OPTIONS = 'xkb-options';
const KEY_KEYBOARD_MODEL = 'xkb-model';
const KEY_PER_WINDOW = 'per-window';

export abstract class InputSourceSettings extends EventEmitter {
  declare connect: GObject.SignalMethods<this, InputSourceSettingsSignals>['connect'];
  declare emit: GObject.SignalMethods<this, InputSourceSettingsSignals>['emit'];

  abstract get inputSources(): InputSourceSpec[];
  abstract get keyboardOptions(): string[];
  abstract get keyboardModel(): string;

  get mruSources(): InputSourceSpec[] {
    return [];
  }

  set mruSources(_sources: [string, string][]) {}

  get perWindow(): boolean {
    return false;
  }
}

export class InputSourceSystemSettings extends InputSourceSettings {
  private layouts = '';
  private variants = '';
  private options = '';
  private model = '';

  constructor() {
    super();
    this.reload();
    Gio.DBus.system.signal_subscribe(LOCALE_BUS_NAME, 'org.freedesktop.DBus.Properties', 'PropertiesChanged',
      LOCALE_BUS_PATH, null, Gio.DBusSignalFlags.NONE, () => this.reload());
  }

  private async reload(): Promise<void> {
    let props: Record<string, GLib.Variant>;
    try {
      const result = await Gio.DBus.system.call(LOCALE_BUS_NAME, LOCALE_BUS_PATH, 'org.freedesktop.DBus.Properties', 'GetAll',
        new GLib.Variant('(s)', [LOCALE_BUS_NAME]), null, Gio.DBusCallFlags.NONE, -1, null);
      [props] = result.deepUnpack<[Record<string, GLib.Variant>]>();
    } catch {
      log(`Could not get properties from ${LOCALE_BUS_NAME}`);
      return;
    }

    const layouts = props['X11Layout'].unpack<string>();
    const variants = props['X11Variant'].unpack<string>();
    const options = props['X11Options'].unpack<string>();
    const model = props['X11Model'].unpack<string>();

    if (layouts !== this.layouts || variants !== this.variants) {
      this.layouts = layouts;
      this.variants = variants;
      this.emit('input-sources-changed');
    }
    if (options !== this.options) {
      this.options = options;
      this.emit('keyboard-options-changed');
    }
    if (model !== this.model) {
      this.model = model;
      this.emit('keyboard-model-changed');
    }
  }

  get inputSources(): InputSourceSpec[] {
    const variants = this.variants.split(',');
    return this.layouts.split(',').filter(Boolean).map((layout, index) => ({
      type: INPUT_SOURCE_TYPE_XKB,
      id: variants[index] ? `${layout}+${variants[index]}` : layout,
    }));
  }

  get keyboardOptions(): string[] {
    return this.options.split(',');
  }

  get keyboardModel(): string {
    return this.model;
  }
}

export class InputSourceSessionSettings extends InputSourceSettings {
  private readonly settings = new Gio.Settings({ schema_id: DESKTOP_INPUT_SOURCES_SCHEMA });

  constructor() {
    super();
    this.settings.connect(`changed::${KEY_INPUT_SOURCES}`, () => this.emit('input-sources-changed'));
    this.settings.connect(`changed::${KEY_KEYBOARD_OPTIONS}`, () => this.emit('keyboard-options-changed'));
    this.settings.connect(`changed::${KEY_KEYBOARD_MODEL}`, () => this.emit('keyboard-model-changed'));
    this.settings.connect(`changed::${KEY_PER_WINDOW}`, () => this.emit('per-window-changed'));
  }

  private sourcesList(key: string): InputSourceSpec[] {
    return this.settings.get_value(key).deepUnpack<[string, string][]>().map(([type, id]) => ({ type, id }));
  }

  get inputSources(): InputSourceSpec[] {
    return this.sourcesList(KEY_INPUT_SOURCES);
  }

  get mruSources(): InputSourceSpec[] {
    return this.sourcesList(KEY_MRU_SOURCES);
  }

  set mruSources(sources: [string, string][]) {
    this.settings.set_value(KEY_MRU_SOURCES, GLib.Variant.new('a(ss)', sources));
  }

  get keyboardOptions(): string[] {
    return this.settings.get_strv(KEY_KEYBOARD_OPTIONS);
  }

  get keyboardModel(): string {
    return this.settings.get_string(KEY_KEYBOARD_MODEL);
  }

  get perWindow(): boolean {
    return this.settings.get_boolean(KEY_PER_WINDOW);
  }
}
