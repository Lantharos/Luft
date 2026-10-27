import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type GObject from 'gi://GObject';
import IBus from 'gi://IBus';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Gettext from 'gettext';

import { EventEmitter } from '../../runtime/signals.js';
import { getIBusManager } from '../../input/ibusManager.js';
import { DEFAULT_LAYOUT, getKeyboardManager, getXkbInfo, watchUserLayouts } from '../../input/keyboardManager.js';
import { getLanguageName } from '../../../shared/i18n/languages.js';
import * as Main from '../../main.js';
import { INPUT_SOURCE_TYPE_IBUS, INPUT_SOURCE_TYPE_XKB, InputSource } from './inputSource.js';
import { InputSourcePopup } from './inputSourcePopup.js';
import { InputSourceSessionSettings, InputSourceSystemSettings, type InputSourceSettings } from './inputSourceSettings.js';

export { INPUT_SOURCE_TYPE_IBUS, INPUT_SOURCE_TYPE_XKB, InputSource } from './inputSource.js';

type InputSources = Record<number, InputSource>;

interface SourceWindow extends Meta.Window {
  _inputSources?: InputSources;
  _currentSource?: InputSource | null;
}

interface InputSourceInfo {
  type: string;
  id: string;
  displayName: string;
  shortName: string;
}

interface InputSourceManagerSignals {
  'sources-changed': () => void;
  'current-source-changed': (oldSource: InputSource | null) => void;
  'keymap-changed': () => void;
}

const KEYBOARD_GLYPH = String.fromCharCode(0x2328);

function engineShortName(engineDesc: IBus.EngineDesc): string {
  const symbol = engineDesc.get_symbol();
  if (symbol && symbol[0]) return symbol;
  const langCode = engineDesc.get_language().split('_', 1)[0];
  if (langCode.length === 2 || langCode.length === 3) return langCode.toLowerCase();
  return KEYBOARD_GLYPH;
}

function engineDisplayName(engineDesc: IBus.EngineDesc): string {
  const code = engineDesc.get_language();
  const language = getLanguageName(code.split('_')[0]) ?? code;
  const textdomain = engineDesc.get_textdomain();
  const longName = textdomain !== '' ? Gettext.dgettext(textdomain, engineDesc.get_longname()) : engineDesc.get_longname();
  return code === 'other' ? longName : `${language} (${longName})`;
}

function updateSubProperty(props: IBus.PropList | null, prop: IBus.Property): boolean {
  if (!props) return false;
  let p;
  for (let i = 0; (p = props.get(i)) != null; ++i) {
    if (p.get_key() === prop.get_key() && p.get_prop_type() === prop.get_prop_type()) {
      p.update(prop);
      return true;
    } else if (p.get_prop_type() === IBus.PropType.MENU && updateSubProperty(p.get_sub_props(), prop)) {
      return true;
    }
  }
  return false;
}

export class InputSourceManager extends EventEmitter {
  declare connect: GObject.SignalMethods<this, InputSourceManagerSignals>['connect'];
  declare emit: GObject.SignalMethods<this, InputSourceManagerSignals>['emit'];

  private sources: InputSources = {};
  private ibusSources: Record<string, InputSource> = {};
  private current: InputSource | null = null;
  private mruSources: InputSource[] = [];
  private mruSourcesBackup: InputSource[] | null = null;
  private readonly keybindingAction: number;
  private readonly keybindingActionBackward: number;
  private readonly settings: InputSourceSettings;
  private xkbInfo = getXkbInfo();
  private readonly keyboard = getKeyboardManager();
  readonly userLayoutMonitors: Gio.FileMonitor[] = [];
  private ibusReady = false;
  private readonly ibusManager = getIBusManager();
  private sourcesPerWindow = false;
  private focusWindowNotifyId = 0;
  private disableIBus = false;
  private switcherPopup: InputSourcePopup | null = null;

  constructor() {
    super();
    const wmKeybindings = () => new Gio.Settings({ schema_id: 'org.gnome.desktop.wm.keybindings' });
    const switchInputSource = (_display: Meta.Display, _window: Meta.Window | null, _event: Clutter.Event, binding: Meta.KeyBinding) =>
      this.switchInputSource(binding);
    this.keybindingAction = Main.wm.addKeybinding('switch-input-source', wmKeybindings(),
      Meta.KeyBindingFlags.NONE, Shell.ActionMode.ALL, switchInputSource);
    this.keybindingActionBackward = Main.wm.addKeybinding('switch-input-source-backward', wmKeybindings(),
      Meta.KeyBindingFlags.IS_REVERSED, Shell.ActionMode.ALL, switchInputSource);
    const systemSettings = Main.sessionMode.isGreeter || Main.sessionMode.isSetup;
    this.settings = systemSettings ? new InputSourceSystemSettings() : new InputSourceSessionSettings();
    this.settings.connect('input-sources-changed', () => this.inputSourcesChanged());
    this.settings.connect('keyboard-options-changed', () => this.keyboardOptionsChanged());
    this.settings.connect('keyboard-model-changed', () => this.keyboardModelChanged());

    this.keyboard.connectObject('keymap-changed', () => this.emit('keymap-changed'), this);
    if (!systemSettings)
      this.userLayoutMonitors = watchUserLayouts(xkbInfo => this.userLayoutsChanged(xkbInfo));

    this.ibusManager.connect('ready', (_manager, ready) => this.ibusReadyChanged(ready));
    this.ibusManager.connect('engines-changed', () => {
      if (this.ibusReady) this.inputSourcesChanged();
    });
    this.ibusManager.connect('properties-registered', (_manager, engineName, props) => this.ibusPropertiesRegistered(engineName, props));
    this.ibusManager.connect('property-updated', (_manager, engineName, prop) => this.ibusPropertyUpdated(engineName, prop));
    this.ibusManager.connect('set-content-type', (_manager, purpose) => this.ibusSetContentType(purpose));

    global.display.connect('modifiers-accelerator-activated', () => {
      this.modifiersSwitcher();
      return false;
    });

    this.settings.connect('per-window-changed', () => this.sourcesPerWindowChanged());
    this.sourcesPerWindowChanged();
  }

  get currentSource(): InputSource | null {
    return this.current;
  }

  get inputSources(): InputSources {
    return this.sources;
  }

  get keyboardManager(): ReturnType<typeof getKeyboardManager> {
    return this.keyboard;
  }

  reload(): void {
    this.keyboard.setKeyboardOptions(this.settings.keyboardOptions);
    this.keyboard.setKeyboardModel(this.settings.keyboardModel);
    this.inputSourcesChanged();
  }

  private userLayoutsChanged(xkbInfo: Shell.XkbInfo): void {
    this.xkbInfo = xkbInfo;
    this.keyboard.reloadLayouts(xkbInfo);
    this.reload();
  }

  private ibusReadyChanged(ready: boolean): void {
    if (this.ibusReady === ready) return;
    this.ibusReady = ready;
    this.mruSources = [];
    this.inputSourcesChanged();
  }

  private modifiersSwitcher(): void {
    const indexes = Object.keys(this.sources).map(Number);
    if (indexes.length === 0) return;

    let source = this.current ?? this.sources[indexes[0]];
    let nextIndex = source.index + 1;
    if (nextIndex > indexes[indexes.length - 1]) nextIndex = 0;
    while (!(source = this.sources[nextIndex])) nextIndex += 1;
    source.activate(true);
  }

  private switchInputSource(binding: Meta.KeyBinding): void {
    if (this.keyboard.isLocked() || this.mruSources.length < 2) return;

    if (Main.actionMode === Shell.ActionMode.POPUP) {
      this.modifiersSwitcher();
      return;
    }

    const popup = new InputSourcePopup({
      items: this.mruSources, action: this.keybindingAction, actionBackward: this.keybindingActionBackward,
    });
    this.switcherPopup = popup;
    popup.connect('destroy', () => (this.switcherPopup = null));
    if (!popup.show(binding.is_reversed(), binding.get_name(), binding.get_mask())) popup.fadeAndDestroy();
  }

  private keyboardOptionsChanged(): void {
    this.keyboard.setKeyboardOptions(this.settings.keyboardOptions);
    this.keyboard.reapply();
  }

  private keyboardModelChanged(): void {
    this.keyboard.setKeyboardModel(this.settings.keyboardModel);
    this.keyboard.reapply();
  }

  private updateMruSettings(): void {
    if (!this.ibusReady || this.disableIBus) return;
    this.settings.mruSources = this.mruSources.map(source => [source.type, source.id]);
  }

  private currentInputSourceChanged(newSource: InputSource, interactive: boolean): void {
    const oldSource = this.current;
    this.current = newSource;
    this.emit('current-source-changed', oldSource);

    this.mruSources = [newSource, ...this.mruSources.filter(source => source !== newSource)];
    if (interactive && this.disableIBus && this.mruSourcesBackup) {
      this.mruSourcesBackup = [
        newSource,
        ...this.mruSourcesBackup.filter(source => source.type !== newSource.type || source.id !== newSource.id),
      ];
    }
    this.changePerWindowSource();
  }

  activateInputSource(source: InputSource, interactive: boolean): void {
    this.keyboard.apply(source.xkbId);

    let engine;
    if (source.type === INPUT_SOURCE_TYPE_IBUS) {
      engine = source.id;
    } else {
      const [name, variant = ''] = source.id.split('+');
      const [lang = 'eng'] = this.xkbInfo.get_languages_for_layout(source.id);
      engine = `xkb:${name}:${variant}:${lang}`;
    }
    this.ibusManager.setEngine(engine);

    this.currentInputSourceChanged(source, interactive);
    if (interactive) this.updateMruSettings();
  }

  private updateMruSources(): void {
    const sourcesList = Object.values(this.sources);
    this.keyboard.setUserLayouts(sourcesList.map(source => source.xkbId));

    if (!this.disableIBus && this.mruSourcesBackup) {
      this.mruSources = this.mruSourcesBackup;
      this.mruSourcesBackup = null;
    }

    const matches = (a: { type: string; id: string }) => (b: InputSource) => a.type === b.type && a.id === b.id;
    if (this.mruSources.length === 0) {
      for (const setting of this.settings.mruSources) {
        const source = sourcesList.find(matches(setting));
        if (source) this.mruSources.push(source);
      }
    }

    const mruSources: InputSource[] = [];
    if (this.mruSources.length > 1) {
      for (const mruSource of this.mruSources) {
        const index = sourcesList.findIndex(matches(mruSource));
        if (index !== -1) mruSources.push(...sourcesList.splice(index, 1));
      }
    }
    this.mruSources = [...mruSources, ...sourcesList];
  }

  private sourceInfo(type: string, id: string): InputSourceInfo | null {
    if (type === INPUT_SOURCE_TYPE_XKB) {
      const [exists, displayName, shortName] = this.xkbInfo.get_layout_info(id);
      return exists ? { type, id, displayName, shortName } : null;
    }
    if (type !== INPUT_SOURCE_TYPE_IBUS || this.disableIBus) return null;
    const engineDesc = this.ibusManager.getEngineDesc(id);
    if (!engineDesc) return null;
    return { type, id, displayName: engineDisplayName(engineDesc), shortName: engineShortName(engineDesc) };
  }

  private inputSourcesChanged(): void {
    this.current = null;
    this.sources = {};
    this.ibusSources = {};

    const infos = this.settings.inputSources.map(({ type, id }) => this.sourceInfo(type, id)).filter(info => info !== null);
    if (infos.length === 0) {
      const [, displayName, shortName] = this.xkbInfo.get_layout_info(DEFAULT_LAYOUT);
      infos.push({ type: INPUT_SOURCE_TYPE_XKB, id: DEFAULT_LAYOUT, displayName, shortName });
    }

    const sourcesByShortName: Record<string, InputSource[]> = {};
    infos.forEach(({ type, id, displayName, shortName }, index) => {
      const source = new InputSource(type, id, displayName, shortName, index);
      source.connect('activate', (activated, interactive) => this.activateInputSource(activated, interactive));
      (sourcesByShortName[source.shortName] ??= []).push(source);
      this.sources[index] = source;
      if (source.type === INPUT_SOURCE_TYPE_IBUS) this.ibusSources[source.id] = source;
    });

    for (const source of Object.values(this.sources)) {
      const sameShortName = sourcesByShortName[source.shortName];
      if (sameShortName.length > 1) source.shortName += String.fromCharCode(0x2080 + sameShortName.indexOf(source) + 1);
    }

    this.emit('sources-changed');
    this.updateMruSources();
    if (this.mruSources.length > 0) this.mruSources[0].activate(false);
    this.ibusManager.preloadEngines(Object.keys(this.ibusSources));
  }

  private ibusPropertiesRegistered(engineName: string | null, props: IBus.PropList): void {
    const source = engineName === null ? undefined : this.ibusSources[engineName];
    if (!source) return;
    source.properties = props;
    if (source === this.current) this.emit('current-source-changed', null);
  }

  private ibusPropertyUpdated(engineName: string | null, prop: IBus.Property): void {
    const source = engineName === null ? undefined : this.ibusSources[engineName];
    if (!source) return;
    if (updateSubProperty(source.properties, prop) && source === this.current) this.emit('current-source-changed', null);
  }

  private ibusSetContentType(purpose: number): void {
    if (this.switcherPopup) return;
    if (purpose === IBus.InputPurpose.PASSWORD) {
      if (Object.keys(this.sources).length === Object.keys(this.ibusSources).length || this.disableIBus) return;
      this.disableIBus = true;
      this.mruSourcesBackup = this.mruSources.slice();
    } else {
      if (!this.disableIBus) return;
      this.disableIBus = false;
    }
    this.reload();
  }

  private newInputSource(current: InputSource | null | undefined): InputSource | null {
    const sources = Object.values(this.sources);
    if (sources.length === 0) return null;
    return (current && sources.find(source => source.type === current.type && source.id === current.id)) || sources[0];
  }

  private setPerWindowInputSource(): void {
    const window = global.display.focus_window as SourceWindow | null;
    if (!window) return;
    if (window._inputSources !== this.sources) {
      window._inputSources = this.sources;
      window._currentSource = this.newInputSource(window._currentSource);
    }
    window._currentSource?.activate(false);
  }

  private sourcesPerWindowChanged(): void {
    this.sourcesPerWindow = this.settings.perWindow;

    if (this.sourcesPerWindow && this.focusWindowNotifyId === 0) {
      this.focusWindowNotifyId = global.display.connect('notify::focus-window', () => this.setPerWindowInputSource());
    } else if (!this.sourcesPerWindow && this.focusWindowNotifyId !== 0) {
      global.display.disconnect(this.focusWindowNotifyId);
      this.focusWindowNotifyId = 0;
      for (const actor of global.get_window_actors()) {
        const window: SourceWindow = actor.meta_window!;
        delete window._inputSources;
        delete window._currentSource;
      }
    }
  }

  private changePerWindowSource(): void {
    if (!this.sourcesPerWindow) return;
    const window = global.display.focus_window as SourceWindow | null;
    if (!window) return;
    window._inputSources = this.sources;
    window._currentSource = this.current;
  }
}

let inputSourceManager: InputSourceManager | null = null;

export function getInputSourceManager(): InputSourceManager {
  inputSourceManager ??= new InputSourceManager();
  return inputSourceManager;
}
