import type { Capability, Extension, InputSound, PopupOptions, SettingValue, Sound, Stored, TaskbarElementOptions, TaskbarItem } from '../../api/v1/types.js';
import { type Accept, either, flag, fn, keyed, list, literal, number, optional, partial, Refused, shape, stored, type Stub, text, tree } from './accept.js';
import { elementAnchors, sandboxedElement } from './elements.js';
import {
  elementChanges, elementOptions, fade, itemChanges, itemOptions, key, label, notificationOptions, path, popupOptions, searchProvider, toggleChanges,
  toggleOptions, unit, view,
} from './shapes.js';

export type Api = Extension<Capability>;

export type Kind = 'disposable' | 'notification' | 'toggle' | 'taskbarItem' | 'taskbarElement' | 'popup' | 'sound' | 'hold';

export interface Made {
  push(state: Record<string, unknown>): void;
  release(): void;
}

interface Call {
  needs?: Capability;
  args: Accept<unknown>[];
  kind?: Kind;
  run(api: Api, args: never[], made: Made): unknown;
}

const LARGEST_TEXT = 4 * 1024 * 1024;
const INPUT_SOUNDS: InputSound[] = ['key', 'space', 'enter', 'backspace', 'click'];

const settingValue = either<unknown>(flag, number(), text(10000), list(text(1000), 200));
const extensionId = text(255);
const name = text(200);
const sounds = list(path, 16);
const storageKey: Accept<string> = (value, where, decoding) => {
  const key = text(1000)(value, where, decoding);
  if (key === '__proto__') throw new Refused(`${where} can't be __proto__`);
  return key;
};

const call = <Args extends unknown[]>(args: { [Index in keyof Args]: Accept<Args[Index]> }, run: (api: Api, args: Args, made: Made) => unknown, extra: Omit<Call, 'args' | 'run'> = {}): Call =>
  ({ args, run: run as unknown as Call['run'], ...extra });

function playerOf(api: Api, id: string) {
  const player = api.media.players.find(candidate => candidate.id === id);
  if (!player) throw new Error(`${id} isn't playing anything`);
  return player;
}

const fetchOptions = shape({
  method: optional(literal('GET', 'POST', 'PUT', 'PATCH', 'DELETE')), headers: optional(keyed(text(8192), 64)), body: optional(text(LARGEST_TEXT)),
  timeout: optional(number(0, 600000)),
});

export const CALLS: Record<string, Call> = {
  'settings.set': call<[string, SettingValue]>([key, settingValue as Accept<SettingValue>], (api, [setting, value]) => api.settings.set(setting, value)),
  'storage.set': call<[string, Stored]>([storageKey, stored], (api, [stored, value]) => api.storage.set(stored, value)),
  'storage.delete': call<[string]>([storageKey], (api, [stored]) => api.storage.delete(stored)),
  'open': call<[string]>([text(8192)], (api, [uri]) => api.open(uri)),
  'openSettings': call([], api => api.openSettings()),
  'pickFiles': call<[Parameters<Api['pickFiles']>[0]]>([shape({ title: label, kind: literal('images', 'sounds', 'calendars', 'folder'), multiple: optional(flag) })],
    (api, [options]) => api.pickFiles(options)),
  'saveFile': call<[Parameters<Api['saveFile']>[0]]>([shape({ title: label, name: label, text: text(LARGEST_TEXT) })], (api, [options]) => api.saveFile(options)),
  'secrets.get': call<[string]>([key], (api, [secret]) => api.secrets.get(secret)),
  'secrets.set': call<[string, string]>([key, text(LARGEST_TEXT)], (api, [secret, value]) => api.secrets.set(secret, value)),
  'secrets.delete': call<[string]>([key], (api, [secret]) => api.secrets.delete(secret)),
  'peers.handle': call<[string, Stub]>([name, fn(optional(stored))], (api, [request, answer]) => api.peers.handle(request, (value, from) => answer(value, from) as Promise<Stored>), { kind: 'disposable' }),
  'peers.request': call<[string, string, Stored | undefined]>([extensionId, name, optional(stored)], (api, [id, request, value]) => api.peers.request(id, request, value)),
  'settingsPage.describe': call<[Stub]>([fn(tree)], (api, [build]) => api.settingsPage.describe(build as never), { kind: 'disposable' }),
  'settingsPage.refresh': call([], api => api.settingsPage.refresh()),
  'timers.onClockChanged': call<[Stub]>([fn()], (api, [changed]) => api.timers.onClockChanged(changed), { kind: 'disposable' }),

  'quickSettings.addToggle': call<[never]>([toggleOptions as Accept<never>], (api, [options]) => api.quickSettings.addToggle(options), { needs: 'quick-settings', kind: 'toggle' }),
  'taskbar.addItem': call<[never]>([itemOptions as Accept<never>], (api, [options]) => api.taskbar.addItem(options), { needs: 'taskbar', kind: 'taskbarItem' }),
  'taskbar.addElement': call<[TaskbarElementOptions & { content: Stub; expanded?: Stub }]>([elementOptions as Accept<never>],
    (api, [options]) => sandboxedElement(api.taskbar, options), { needs: 'taskbar', kind: 'taskbarElement' }),
  'popups.open': call<[PopupOptions]>([popupOptions as Accept<PopupOptions>], (api, [options], made) => {
    const anchor = typeof options.anchor === 'object' && !('x' in options.anchor) ? elementAnchors.get(options.anchor) ?? options.anchor as TaskbarItem : options.anchor;
    return api.popups.open({
      ...options,
      anchor,
      onClosed: () => {
        made.release();
        options.onClosed?.();
      },
    });
  }, { needs: 'popups', kind: 'popup' }),
  'notifications.send': call<[never]>([notificationOptions as Accept<never>], (api, [options]) => api.notifications.send(options), { needs: 'notifications', kind: 'notification' }),
  'search.addProvider': call<[never]>([searchProvider as Accept<never>], (api, [provider]) => api.search.addProvider(provider), { needs: 'search', kind: 'disposable' }),

  'sounds.play': call<[string, Parameters<Api['sounds']['play']>[1]]>([path, optional(shape({ volume: optional(unit), loop: optional(flag), fadeIn: fade }))], (api, [file, options], made) => {
    const sound: Sound = api.sounds.play(file, options);
    sound.onEnded(() => {
      made.push({ playing: false });
      made.release();
    });
    return sound;
  }, { needs: 'sounds', kind: 'sound' }),
  'sounds.volume': call<[number]>([unit], (api, [volume]) => (api.sounds.volume = volume), { needs: 'sounds' }),
  'lockedSounds.keep': call([], api => api.lockedSounds.keep(), { needs: 'locked-sounds', kind: 'disposable' }),
  'inputSounds.load': call<[never]>([shape(Object.fromEntries(INPUT_SOUNDS.map(kind => [kind, optional(sounds)]))) as Accept<never>],
    (api, [files]) => api.inputSounds.load(files), { needs: 'input-sounds' }),
  'inputSounds.keys': call<[number]>([unit], (api, [level]) => (api.inputSounds.keys = level), { needs: 'input-sounds' }),
  'inputSounds.clicks': call<[number]>([unit], (api, [level]) => (api.inputSounds.clicks = level), { needs: 'input-sounds' }),
  'inputSounds.preview': call<[InputSound, number | undefined]>([literal(...INPUT_SOUNDS), optional(unit)], (api, [sound, level]) => api.inputSounds.preview(sound, level), { needs: 'input-sounds' }),

  'media.control': call<[string, 'playPause' | 'next' | 'previous' | 'raise']>([text(1000), literal('playPause', 'next', 'previous', 'raise')],
    (api, [player, action]) => playerOf(api, player)[action](), { needs: 'media' }),
  'media.seek': call<[string, number]>([text(1000), number(0)], (api, [player, seconds]) => playerOf(api, player).seek(seconds), { needs: 'media' }),
  'media.position': call<[string]>([text(1000)], (api, [player]) => playerOf(api, player).position(), { needs: 'media' }),
  'media.output.volume': call<[number]>([unit], (api, [volume]) => (api.media.output.volume = volume), { needs: 'media' }),
  'media.output.muted': call<[boolean]>([flag], (api, [muted]) => (api.media.output.muted = muted), { needs: 'media' }),
  'media.output.choose': call<[string]>([text(1000)], (api, [device]) => api.media.output.choose(device), { needs: 'media' }),

  'doNotDisturb.hold': call([], (api, [], made) => {
    const hold = api.doNotDisturb.hold();
    hold.onHeld(() => made.push({ held: hold.held }));
    return hold;
  }, { needs: 'do-not-disturb', kind: 'hold' }),
  'weather.current': call([], api => api.weather.current(), { needs: 'weather' }),
  'weather.onChanged': call<[Stub]>([fn()], (api, [changed]) => api.weather.onChanged(changed), { needs: 'weather', kind: 'disposable' }),
  'location.current': call([], api => api.location.current(), { needs: 'location' }),
  'location.onChanged': call<[Stub]>([fn()], (api, [changed]) => api.location.onChanged(changed), { needs: 'location', kind: 'disposable' }),
  'network.fetch': call<[string, Parameters<Api['network']['fetch']>[1]]>([text(8192), optional(fetchOptions)], async (api, [url, options]) => {
    const { status, ok, headers, text: body } = await api.network.fetch(url, options);
    return { status, ok, headers, text: body };
  }, { needs: 'network' }),
  'clipboard.setText': call<[string]>([text(LARGEST_TEXT)], (api, [copied]) => api.clipboard.setText(copied), { needs: 'clipboard' }),
  'clipboard.setImage': call<[string]>([path], (api, [image]) => api.clipboard.setImage(image), { needs: 'clipboard' }),
  'clipboard.setFiles': call<[string[]]>([list(path, 100)], (api, [files]) => api.clipboard.setFiles(files), { needs: 'clipboard' }),
  'shortcuts.onActivated': call<[string, Stub]>([key, fn()], (api, [shortcut, activated]) => api.shortcuts.onActivated(shortcut, activated), { needs: 'shortcuts', kind: 'disposable' }),
};

export const METHODS: Record<Kind, Record<string, Accept<unknown>[]>> = {
  disposable: { dispose: [] },
  notification: { dispose: [] },
  toggle: { update: [partial(toggleChanges)], dispose: [] },
  taskbarItem: { update: [partial(itemChanges)], dispose: [] },
  taskbarElement: { update: [partial(elementChanges)], refresh: [], dispose: [] },
  popup: { update: [view], dispose: [] },
  sound: { setVolume: [unit, fade], stop: [fade], dispose: [] },
  hold: { release: [], dispose: [] },
};

export const ENDS_REF = new Set(['dispose', 'release']);
