import GLib from 'gi://GLib';

import { deleteFile, readText, writeText } from '../../api/v1/core/files.js';
import type { Appearance, Basics, Disposable, Manifest, Peers, SettingValue, Stored } from '../../api/v1/types.js';
import type { Scope } from '../../runtime/scope.js';
import type { Translations } from '../../runtime/translations.js';
import type { Init } from '../protocol.js';
import type { Link } from './link.js';

export interface HostContext {
  readonly link: Link;
  readonly scope: Scope;
  readonly manifest: Manifest;
  readonly path: string;
  readonly dataPath: string;
  readonly translations: Translations;
  readonly writing: Set<Promise<unknown>>;
}

export class Listeners<Args extends unknown[] = []> {
  private readonly listening = new Set<(...args: Args) => void>();

  constructor(private readonly scope: Scope) {}

  add(listener: (...args: Args) => void): Disposable {
    const guarded = this.scope.guard(listener);
    this.listening.add(guarded);
    return this.scope.disposable(() => this.listening.delete(guarded));
  }

  emit(...args: Args): void {
    for (const listener of [...this.listening]) listener(...args);
  }
}

export function watching({ link, scope }: HostContext, area: string): (changed: () => void) => Disposable {
  return changed => scope.disposable(link.watchMirror(area, scope.guard(changed)));
}

export function made({ link, scope }: HostContext, path: string, args: unknown[] = []): Disposable {
  const ref = link.make(path, args);
  return scope.disposable(() => link.end(ref));
}

function timer({ scope }: HostContext, milliseconds: number, callback: () => void, repeat: boolean): Disposable {
  let source = 0;
  const handle = scope.disposable(() => {
    if (source) GLib.source_remove(source);
  });
  source = GLib.timeout_add(GLib.PRIORITY_DEFAULT, Math.max(0, milliseconds), () => {
    scope.run(callback);
    if (repeat) return GLib.SOURCE_CONTINUE;
    source = 0;
    handle.dispose();
    return GLib.SOURCE_REMOVE;
  });
  return handle;
}

export class SettingsMirror {
  readonly listeners: Listeners<[string]>;

  constructor(private readonly context: HostContext, private readonly values: Map<string, SettingValue>) {
    this.listeners = new Listeners(context.scope);
  }

  changed(key: string, value: SettingValue): void {
    this.values.set(key, value);
    this.listeners.emit(key);
  }

  api(): Basics['settings'] {
    return {
      get: key => {
        if (!this.values.has(key)) throw new Error(`${key} isn't a setting in extension.toml`);
        return this.values.get(key) as never;
      },
      set: (key, value) => {
        if (!this.values.has(key)) throw new Error(`${key} isn't a setting in extension.toml`);
        this.values.set(key, value);
        this.context.link.call('settings.set', [key, value]);
      },
      onChanged: changed => this.listeners.add(changed),
    };
  }
}

function storage({ link }: HostContext, init: Init): Basics['storage'] {
  const kept = new Map(Object.entries(init.stored));
  return {
    get: key => kept.get(key) as never,
    set: (key, value: Stored) => {
      kept.set(key, JSON.parse(JSON.stringify(value)) as Stored);
      link.call('storage.set', [key, value]);
    },
    delete: key => {
      if (!kept.delete(key)) return;
      link.call('storage.delete', [key]);
    },
    keys: () => [...kept.keys()],
  };
}

function appearance(context: HostContext): Appearance {
  const current = () => context.link.mirror<Omit<Appearance, 'onChanged'>>('appearance');
  return {
    get accent() { return current().accent; },
    get wallpaperAccent() { return current().wallpaperAccent; },
    get dark() { return current().dark; },
    get colors() { return current().colors; },
    get font() { return current().font; },
    get textScale() { return current().textScale; },
    get squareCorners() { return current().squareCorners; },
    get reducedMotion() { return current().reducedMotion; },
    onChanged: watching(context, 'appearance'),
  };
}

function peers(context: HostContext): Peers {
  const { link } = context;
  return {
    handle: (name, answer) => made(context, 'peers.handle', [name, answer]),
    handles: (id, name) => link.mirror<[string, string][]>('peers').some(([answering, request]) => answering === id && request === name),
    request: (id, name, value = null) => link.ask('peers.request', [id, name, value]),
    onChanged: watching(context, 'peers'),
  };
}

export function basicsApi(context: HostContext, init: Init, settings: SettingsMirror): Basics {
  const { link, scope, translations } = context;
  const write = (path: string, text: string) => {
    const writing = writeText(context, path, text).finally(() => context.writing.delete(writing));
    context.writing.add(writing);
    return writing.then(() => {});
  };
  return {
    id: context.manifest.id,
    version: context.manifest.version,
    path: context.path,
    get dataPath() {
      GLib.mkdir_with_parents(context.dataPath, 0o700);
      return context.dataPath;
    },
    settings: settings.api(),
    settingsPage: {
      describe: build => made(context, 'settingsPage.describe', [build]),
      refresh: () => link.call('settingsPage.refresh'),
    },
    storage: storage(context, init),
    secrets: {
      get: key => link.ask('secrets.get', [key]),
      set: (key, secret) => link.ask('secrets.set', [key, secret]),
      delete: key => link.ask('secrets.delete', [key]),
    },
    peers: peers(context),
    timers: {
      timeout: (milliseconds, callback) => timer(context, milliseconds, callback, false),
      interval: (milliseconds, callback) => timer(context, milliseconds, callback, true),
      onClockChanged: changed => made(context, 'timers.onClockChanged', [changed]),
    },
    session: {
      get active() { return link.mirror<{ active: boolean }>('session').active; },
      onChanged: watching(context, 'session'),
    },
    desktop: {
      get wallpaperVisible() { return link.mirror<{ wallpaperVisible: boolean }>('desktop').wallpaperVisible; },
      onChanged: watching(context, 'desktop'),
    },
    power: {
      get onBattery() { return link.mirror<{ onBattery: boolean }>('power').onBattery; },
      get saving() { return link.mirror<{ saving: boolean }>('power').saving; },
      onChanged: watching(context, 'power'),
    },
    appearance: appearance(context),
    t: (id, args) => translations.t(id, args),
    open: uri => link.call('open', [uri]),
    openSettings: () => link.call('openSettings'),
    pickFiles: options => link.ask('pickFiles', [options]),
    chooseFiles: () => Promise.reject(new Error("Extensions from your own folder run in a sandbox, which can't reach files outside their folders. Use pickFiles to copy files in")),
    deleteFile: path => deleteFile(context, path),
    readText: path => readText(context, path),
    writeText: write,
    saveFile: options => link.ask('saveFile', [options]),
    onDisable: cleanup => scope.onDisable(cleanup),
  };
}
