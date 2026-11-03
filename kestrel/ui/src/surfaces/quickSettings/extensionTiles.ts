import { Registry } from '../../shared/registry.js';
import type { SettingsLink } from '../../system/settingsPages.js';
import type { QuickControl } from './quickControls.js';

export interface ExtensionTile {
  id: string;
  actor: QuickControl;
  settingsPanel: SettingsLink;
}

export const extensionTiles = new Registry<ExtensionTile>();
