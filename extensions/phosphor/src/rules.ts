import type { EffectWindow, Extension } from '@luft/extension-api';

export type Granted = 'screen-effects';
export type Part = 'border' | 'overlay' | 'crt' | 'motion';

export const PARTS: readonly Part[] = ['border', 'overlay', 'crt', 'motion'];

type Everywhere = Record<Part, boolean>;
type Rule = Partial<Record<Part, boolean>>;
type Rules = Record<string, Rule>;

const RULES = 'rules';
const EVERYWHERE = 'everywhere';
const DEFAULTS: Everywhere = { border: true, overlay: true, crt: false, motion: true };

/** Which parts go on every app, and what each app does differently. A CRT inside a window starts off everywhere. */
export class AppRules {
  private rules: Rules;
  private everywhere: Everywhere;

  constructor(private readonly phosphor: Extension<Granted>, private readonly changed: () => void) {
    this.rules = phosphor.storage.get<Rules>(RULES) ?? {};
    this.everywhere = { ...DEFAULTS, ...phosphor.storage.get<Partial<Everywhere>>(EVERYWHERE) };
  }

  applies(part: Part, { appId }: EffectWindow): boolean {
    return (appId ? this.rules[appId]?.[part] : undefined) ?? this.everywhere[part];
  }

  onEverywhere(part: Part): boolean {
    return this.everywhere[part];
  }

  setEverywhere(part: Part, on: boolean): void {
    this.everywhere[part] = on;
    this.phosphor.storage.set(EVERYWHERE, this.everywhere);
    this.changed();
  }

  get apps(): string[] {
    return Object.keys(this.rules);
  }

  value(app: string, part: Part): boolean {
    return this.rules[app]?.[part] ?? this.everywhere[part];
  }

  add(app: string): void {
    this.rules[app] ??= {};
    this.save();
  }

  /** Flips one part for one app. */
  toggle(app: string, part: Part): void {
    (this.rules[app] ??= {})[part] = !this.value(app, part);
    this.save();
  }

  remove(app: string): void {
    delete this.rules[app];
    this.save();
  }

  private save(): void {
    this.phosphor.storage.set(RULES, this.rules);
    this.changed();
  }
}
