import Gio from 'gi://Gio';
import St from 'gi://St';

import { Registry } from '../../shared/registry.js';

const ICON_SIZE = 16;

export interface FileActionChoiceShape {
  key: string;
  label: string;
  icon: string;
  disabled: boolean;
  keepsMenuOpen: boolean;
  separator: boolean;
}

export interface FileActionShape {
  label: string;
  icon: string;
  kind: 'files' | 'folders' | 'any';
  types: readonly string[];
  extensions: readonly string[];
  multiple: boolean;
  items: FileActionChoiceShape[] | null;
}

export interface FileActionEntry {
  readonly id: string;
  shape(): FileActionShape | null;
  opened(): void;
  activate(paths: string[], choice: string): void;
  watch(changed: () => void): () => void;
}

export const fileActions = new Registry<FileActionEntry>();

let theme: St.IconTheme | null = null;

export function iconFile(icon: Gio.Icon): string {
  if (icon instanceof Gio.FileIcon) return icon.file.get_path() ?? '';
  theme ??= new St.IconTheme();
  return theme.lookup_by_gicon(icon, ICON_SIZE, St.IconLookupFlags.FORCE_SVG)?.get_filename() ?? '';
}
