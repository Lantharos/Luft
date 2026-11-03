import type Gio from 'gi://Gio';

import type { ExtensionHost } from '../../host.js';
import type { Gestures } from '../../runtime/gestures.js';
import type { ExtensionPage } from '../../runtime/page.js';
import type { Scope } from '../../runtime/scope.js';
import type { GrabbedShortcuts } from '../../runtime/shortcuts.js';
import type { ExtensionStore } from '../../runtime/store.js';
import type { StoredValues } from '../../runtime/storage.js';
import type { Translations } from '../../runtime/translations.js';
import type { SettingValues } from '../../runtime/values.js';
import type { OpenPanels } from './popups/popups.js';
import type { Manifest } from './types.js';
import type { LayerStage } from './wallpaper/stage.js';

/** Everything one run of an extension's API is built from. */
export interface ApiContext {
  readonly manifest: Manifest;
  /** The extension's name in Kestrel's language. */
  readonly name: string;
  readonly path: string;
  /** The extension's own data folder, made on first use. */
  readonly dataPath: string;
  readonly host: ExtensionHost;
  readonly scope: Scope;
  readonly translations: Translations;
  readonly values: SettingValues;
  readonly stored: StoredValues;
  readonly store: ExtensionStore;
  /** The extension's open panels, which close before it types. */
  readonly panels: OpenPanels;
  /** The page it describes for Settings. */
  readonly page: ExtensionPage;
  /** The shortcuts grabbed while it runs, so Settings can tell what they're bound to. */
  readonly shortcuts: { current: GrabbedShortcuts | null };
  /** When people last used the extension, for what only they may start. */
  readonly gestures: Gestures;
  readonly layers: LayerStage;
  /** The helper processes running, so Settings can show what they use. */
  readonly helpers: Set<Gio.Subprocess>;
  openSettings(): void;
  /** `callback` guarded, and counted as people using the extension when it runs. */
  fromPerson<Args extends unknown[], Result>(callback: (...args: Args) => Result): (...args: Args) => Result | undefined;
}
