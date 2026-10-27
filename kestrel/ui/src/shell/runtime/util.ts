import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';

import { t } from '../../shared/i18n/index.js';
import { notifyError } from '../main.js';

const balancedParens = '\\([^\\s()<>]+\\)';
const leadingJunk = '[\\s`(\\[{\'\\"<\u00AB\u201C\u2018]';
const notTrailingJunk = '[^\\s`!()\\[\\]{};:\'\\".,<>?\u00AB\u00BB\u200E\u200F\u201C\u201D\u2018\u2019\u202A\u202C]';

const urlRegexp = new RegExp(
  `(^|${leadingJunk})` +
  '(' +
    '(?:' +
      '(?:http|https|ftp)://' +
      '|' +
      'www\\d{0,3}[.]' +
      '|' +
      '([a-z0-9\\-]+[.])+[a-z]{2,4}/' +
    ')' +
    '(?:' +
      '[^\\s()<>]+' +
      '|' +
      `${balancedParens}` +
    ')+' +
    '(?:' +
      `${balancedParens}` +
      '|' +
      `${notTrailingJunk}` +
    ')' +
  ')', 'gi');

export interface UrlMatch {
  url: string;
  pos: number;
}

export function findUrls(str: string): UrlMatch[] {
  const res: UrlMatch[] = [];
  let match;
  while ((match = urlRegexp.exec(str)))
    res.push({ url: match[2], pos: match.index + match[1].length });
  return res;
}

export function spawnCommandLine(commandLine: string): void {
  try {
    const [, argv] = GLib.shell_parse_argv(commandLine);
    trySpawn(argv!);
  } catch (err) {
    handleSpawnError(commandLine, err as Error);
  }
}

export function openSettings(page: string): void {
  Gio.AppInfo.launch_default_for_uri(`kestrel-settings:${page}`, global.create_app_launch_context(0, -1));
}

function trySpawn(argv: string[]): void {
  let pid;
  try {
    const launchContext = global.create_app_launch_context(0, -1);
    pid = Shell.util_spawn_async(null, argv, launchContext.get_environment(),
      GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD);
  } catch (err) {
    if (!(err instanceof GLib.Error)) throw err;
    const message = err.message.replace(/.*\((.+)\)/, '$1');
    throw new (err.constructor as typeof GLib.Error)({ code: err.code, message });
  }

  Shell.systemd_start_app_scope(argv[0], pid);
  GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, () => {});
}

function handleSpawnError(command: string, err: Error): void {
  notifyError(t('spawn-failed', { command }), err.message);
}

export function fixMarkup(text: string, allowMarkup: boolean): string {
  if (allowMarkup) {
    const escaped = text
      .replace(/&(?!amp;|quot;|apos;|lt;|gt;)/g, '&amp;')
      .replace(/<(?!\/?[biu]>)/g, '&lt;');
    try {
      Pango.parse_markup(escaped, -1, '');
      return escaped;
    } catch {}
  }
  return GLib.markup_escape_text(text, -1);
}

function lowerBound<T, K>(array: readonly T[], val: K, cmp: (a: T, val: K) => number): number {
  if (array.length === 0) return 0;

  let min = 0;
  let max = array.length;
  while (min < max - 1) {
    const mid = Math.floor((min + max) / 2);
    if (cmp(array[mid], val) < 0) min = mid + 1;
    else max = mid;
  }

  return min === max || cmp(array[min], val) < 0 ? max : min;
}

export function insertSorted<T>(array: T[], val: T, cmp: (a: T, val: T) => number): number {
  const pos = lowerBound(array, val, cmp);
  array.splice(pos, 0, val);
  return pos;
}

export function lerp(start: number, end: number, progress: number): number {
  return start + progress * (end - start);
}

export class DBusSenderChecker {
  private readonly allowlistMap = new Map<string, string>();
  private readonly uninitializedNames: Set<string>;
  private readonly initializedPromise: Promise<void>;
  private resolveInitialized!: () => void;

  constructor(allowList: string[]) {
    this.uninitializedNames = new Set(allowList);
    this.initializedPromise = new Promise(resolve => {
      this.resolveInitialized = resolve;
    });

    for (const name of allowList) {
      Gio.DBus.watch_name(Gio.BusType.SESSION, name, Gio.BusNameWatcherFlags.NONE,
        (_connection, _name, owner) => {
          this.allowlistMap.set(name, owner);
          this.checkAndResolveInitialized(name);
        },
        () => {
          this.allowlistMap.delete(name);
          this.checkAndResolveInitialized(name);
        });
    }
  }

  private checkAndResolveInitialized(name: string): void {
    if (this.uninitializedNames.delete(name) && this.uninitializedNames.size === 0)
      this.resolveInitialized();
  }

  private async isSenderAllowed(sender: string): Promise<boolean> {
    await this.initializedPromise;
    return [...this.allowlistMap.values()].includes(sender);
  }

  async checkInvocation(invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (global.context.unsafe_mode) return;

    if (await this.isSenderAllowed(invocation.get_sender()!)) return;

    throw new Gio.DBusError({ code: Gio.DBusError.ACCESS_DENIED, message: `${invocation.get_method_name()} is not allowed` });
  }
}
