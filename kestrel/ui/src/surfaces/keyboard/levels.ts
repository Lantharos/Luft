import type { KeyContainer } from './containers.js';
import type { Key } from './key.js';
import type { Levels } from './rows.js';

function setPageLatched(page: KeyContainer, latched: boolean): void {
  for (const key of page.shiftKeys) {
    key.setLatched(latched);
    key.setIconName(latched ? 'osk-caps-lock-symbolic' : 'osk-shift-symbolic');
  }
}

export class KeyLevels {
  readonly modifiers = new Set<number>();
  latched = false;
  private layers: Record<string, KeyContainer> = {};
  private modifierKeys = new Map<number, Key[]>();
  private current: KeyContainer | null = null;
  private currentDestroyId = 0;

  get page(): KeyContainer | null {
    return this.current;
  }

  has(level: string): boolean {
    return !!this.layers[level];
  }

  isActive(level: string): boolean {
    return this.current === this.layers[level];
  }

  replace({ layers, modifierKeys }: Levels): void {
    this.modifiers.clear();
    this.layers = layers;
    this.modifierKeys = modifierKeys;
  }

  setActive(level: string): KeyContainer | null {
    const page = this.layers[level];
    if (this.current === page) return null;

    if (this.current) {
      setPageLatched(this.current, false);
      this.current.disconnect(this.currentDestroyId);
      this.current.hide();
    }

    this.disableAllModifiers();
    this.current = page;
    this.currentDestroyId = page.connect('destroy', () => {
      this.current = null;
    });
    return page;
  }

  setLatched(latched: boolean): void {
    this.latched = latched;
    setPageLatched(this.current!, latched);
  }

  toggleModifier(keyval: number): void {
    this.setModifierEnabled(keyval, !this.modifiers.has(keyval));
  }

  disableAllModifiers(): void {
    for (const keyval of this.modifiers) this.setModifierEnabled(keyval, false);
  }

  private setModifierEnabled(keyval: number, enabled: boolean): void {
    if (enabled) this.modifiers.add(keyval);
    else this.modifiers.delete(keyval);

    for (const key of this.modifierKeys.get(keyval)!) key.setLatched(enabled);
  }
}
