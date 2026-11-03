import type Gio from 'gi://Gio';

import type { ExtensionHost } from '../../host.js';
import type { Scope } from '../../runtime/scope.js';
import type { Translations } from '../../runtime/translations.js';
import type { SettingValues } from '../../runtime/values.js';
import type { Manifest } from './types.js';
import type { LayerStage } from './wallpaper/stage.js';

/** Everything one run of an extension's API is built from. */
export interface ApiContext {
  readonly manifest: Manifest;
  /** The extension's name in Kestrel's language. */
  readonly name: string;
  readonly path: string;
  readonly host: ExtensionHost;
  readonly scope: Scope;
  readonly translations: Translations;
  readonly values: SettingValues;
  readonly layers: LayerStage;
  /** The helper processes running, so Settings can show what they use. */
  readonly helpers: Set<Gio.Subprocess>;
  openSettings(): void;
}
