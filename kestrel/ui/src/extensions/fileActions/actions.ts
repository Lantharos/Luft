import Gio from 'gi://Gio';
import St from 'gi://St';

import { Registry } from '../../shared/registry.js';

const ICON_SIZE = 16;

/** A choice in an action's own menu, with its icon as a file Rover can draw. A separator has no key. */
export interface FileActionChoiceShape {
  key: string;
  label: string;
  icon: string;
  disabled: boolean;
  keepsMenuOpen: boolean;
  separator: boolean;
}

/** An action as Rover gets it: what it shows, which files it's for, and its own menu when it has one. */
export interface FileActionShape {
  label: string;
  icon: string;
  kind: 'files' | 'folders' | 'any';
  types: readonly string[];
  extensions: readonly string[];
  multiple: boolean;
  items: FileActionChoiceShape[] | null;
}

/** An action in the menu of files and folders, by `extension-id/key`, or Kestrel's own such as Post's. */
export interface FileActionEntry {
  readonly id: string;
  /** What it shows now, or `null` while it's hidden. */
  shape(): FileActionShape | null;
  opened(): void;
  activate(paths: string[], choice: string): void;
  watch(changed: () => void): () => void;
}

export const fileActions = new Registry<FileActionEntry>();

let theme: St.IconTheme | null = null;

/** The file an icon draws from, which Rover shows in its own colors. */
export function iconFile(icon: Gio.Icon): string {
  if (icon instanceof Gio.FileIcon) return icon.file.get_path() ?? '';
  theme ??= new St.IconTheme();
  return theme.lookup_by_gicon(icon, ICON_SIZE, St.IconLookupFlags.FORCE_SVG)?.get_filename() ?? '';
}
