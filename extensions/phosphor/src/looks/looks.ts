import type { Extension, SettingValue, Stored } from '@luft/extension-api';

import type { Granted } from '../rules.js';
import { DEFAULTS, fits, isPreset, presetValues, type Values } from './presets.js';

export type SavedLook = { name: string; values: Values };

const SAVED = 'saved-looks';
const CUSTOM = 'custom-look';
const FILE_FORMAT = 1;
const NAME_LENGTH = 60;
const same = (one: SettingValue | undefined, other: SettingValue | undefined) => JSON.stringify(one) === JSON.stringify(other);

/** Presets and looks people saved or shared: whole sets of settings picked at once, and "Custom" once anything differs. */
export class Looks {
  private showing: string;
  importFailed = false;

  constructor(private readonly phosphor: Extension<Granted>) {
    this.showing = phosphor.settings.get<string>('look');
  }

  get saved(): SavedLook[] {
    return this.phosphor.storage.get<SavedLook[] & Stored>(SAVED) ?? [];
  }

  private current(): Values {
    return Object.fromEntries(Object.keys(DEFAULTS).map(key => [key, this.phosphor.settings.get(key)]));
  }

  private changedFromDefaults(): Values {
    return Object.fromEntries(Object.entries(this.current()).filter(([key, value]) => !same(value, DEFAULTS[key])));
  }

  private matches(values: Values): boolean {
    const current = this.current();
    return Object.keys(DEFAULTS).every(key => same(current[key], values[key]));
  }

  private put(values: Values): void {
    const { settings } = this.phosphor;
    for (const key of Object.keys(DEFAULTS)) settings.set(key, values[key] ?? DEFAULTS[key]);
  }

  /** Follows what changed: picking a look sets everything it decides, and changing one of those afterwards makes it Custom. */
  changed(keys: ReadonlySet<string>): void {
    const { settings, storage } = this.phosphor;
    const look = settings.get<string>('look');
    if (keys.has('look') && look !== this.showing) {
      if (this.showing === 'custom') storage.set(CUSTOM, this.changedFromDefaults() as Stored);
      this.showing = look;
      if (look === 'custom') this.put(storage.get<Values & Stored>(CUSTOM) ?? this.current());
      else this.put(presetValues(look));
    } else if (look !== 'custom' && [...keys].some(key => key in DEFAULTS) && !this.matches(presetValues(look))) {
      this.wear('custom');
    }
  }

  /** Makes the look picker agree with the settings, such as after an update added settings that differ from the look's. */
  settle(): void {
    if (isPreset(this.showing) && !this.matches(presetValues(this.showing))) this.wear('custom');
  }

  private wear(look: string): void {
    this.showing = look;
    this.phosphor.settings.set('look', look);
  }

  save(name: string): void {
    const kept = this.saved.filter(look => look.name !== name);
    this.phosphor.storage.set(SAVED, [...kept, { name, values: this.changedFromDefaults() }] as Stored);
  }

  apply(name: string): void {
    const look = this.saved.find(saved => saved.name === name);
    if (!look) return;
    this.wear('custom');
    this.put(look.values);
  }

  remove(name: string): void {
    this.phosphor.storage.set(SAVED, this.saved.filter(look => look.name !== name) as Stored);
  }

  /** Saves a look as a small file to share, the one named or what's on now. */
  async share(name?: string): Promise<void> {
    const { t, saveFile } = this.phosphor;
    const values = name === undefined ? this.changedFromDefaults() : this.saved.find(look => look.name === name)?.values ?? {};
    const title = name ?? t('look-file-name');
    await saveFile({ title: t('look-share'), name: `${title}.phosphor.json`, text: `${JSON.stringify({ phosphor: FILE_FORMAT, name: title, values }, null, 2)}\n` });
  }

  /** Reads a shared look, keeps it among the saved ones and puts it on. Settings it doesn't know or can't hold are left out. */
  async open(): Promise<void> {
    const { t, pickFiles, readText, deleteFile } = this.phosphor;
    const [path] = await pickFiles({ title: t('look-import'), kind: 'text' });
    if (!path) return;
    const look = this.parse(readText(path) ?? '');
    deleteFile(path);
    this.importFailed = !look;
    if (!look) return;
    this.phosphor.storage.set(SAVED, [...this.saved.filter(saved => saved.name !== look.name), look] as Stored);
    this.apply(look.name);
  }

  private parse(text: string): SavedLook | null {
    let file: { phosphor?: unknown; name?: unknown; values?: unknown };
    try {
      file = JSON.parse(text);
    } catch {
      return null;
    }
    if (file?.phosphor !== FILE_FORMAT || typeof file.name !== 'string' || !file.name.trim() || typeof file.values !== 'object' || !file.values) return null;
    const values = Object.fromEntries(Object.entries(file.values as Record<string, unknown>).filter(([key, value]) => fits(key, value))) as Values;
    return { name: file.name.trim().slice(0, NAME_LENGTH), values };
  }
}
