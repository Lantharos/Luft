import type Gio from 'gi://Gio';

import type { ExtensionHost } from '../../../host.js';
import type { Gestures } from '../../../runtime/gestures.js';
import type { ExtensionPage } from '../../../runtime/page.js';
import type { Scope } from '../../../runtime/scope.js';
import type { GrabbedShortcuts } from '../../../runtime/shortcuts.js';
import type { ExtensionStore } from '../../../runtime/store.js';
import type { StoredValues } from '../../../runtime/storage.js';
import type { Translations } from '../../../runtime/translations.js';
import type { SettingValues } from '../../../runtime/values.js';
import type { OpenPopups } from '../ui/popups/popups.js';
import type { EffectsStage } from '../visuals/screenEffects/stage.js';
import type { Manifest } from '../types.js';
import type { LayerStage } from '../visuals/wallpaper/stage.js';

export interface ApiContext {
  readonly manifest: Manifest;
  readonly name: string;
  readonly path: string;
  readonly dataPath: string;
  readonly host: ExtensionHost;
  readonly scope: Scope;
  readonly translations: Translations;
  readonly values: SettingValues;
  readonly stored: StoredValues;
  readonly store: ExtensionStore;
  readonly popups: OpenPopups;
  readonly page: ExtensionPage;
  readonly shortcuts: { current: GrabbedShortcuts | null };
  readonly gestures: Gestures;
  readonly layers: LayerStage;
  readonly screenEffects: EffectsStage;
  readonly helpers: Set<Gio.Subprocess>;
  openSettings(): void;
  fromPerson<Args extends unknown[], Result>(callback: (...args: Args) => Result): (...args: Args) => Result | undefined;
}
