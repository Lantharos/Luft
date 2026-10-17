import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import type { MenuEntry } from '../../../../desktop/menus/contextMenus.js';
import { fileIcon } from '../icons.js';
import type { SearchItem } from '../item.js';

const FOLDER_TYPE = 'inode/directory';

export interface FoundFile {
  uri: string;
  name: string;
  folder: boolean;
}

const home = GLib.get_home_dir();

export function shortFolder(path: string): string {
  return path === home || path.startsWith(`${home}/`) ? `~${path.slice(home.length)}` : path;
}

function launchContext(): Gio.AppLaunchContext {
  return (global as unknown as Shell.Global).create_app_launch_context(0, -1);
}

export class FileOpener {
  constructor(private readonly close: () => void) {}

  item(file: FoundFile, description: string): SearchItem {
    const reveal = file.folder ? undefined : () => this.reveal(file.uri);
    return {
      key: `file:${file.uri}`, title: file.name, description,
      icon: fileIcon(file.name, file.folder),
      activate: () => this.open(file.uri),
      reveal,
      menu: () => this.menu(file.uri, reveal),
    };
  }

  private menu(uri: string, reveal: (() => void) | undefined): MenuEntry[] {
    const entries: MenuEntry[] = [{ label: 'Open', run: () => this.open(uri) }];
    const manager = Gio.AppInfo.get_default_for_type(FOLDER_TYPE, false);
    if (reveal && manager) entries.push({ label: `Show in ${manager.get_name()}`, run: reveal });
    const path = Gio.File.new_for_uri(uri).get_path() ?? uri;
    entries.push({ label: 'Copy path', run: () => this.run(() => St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, path)) });
    return entries;
  }

  private reveal(uri: string): void {
    const manager = Gio.AppInfo.get_default_for_type(FOLDER_TYPE, false);
    if (manager) this.run(() => manager.launch_uris([uri], launchContext()));
  }

  private open(uri: string): void {
    this.run(() => Gio.AppInfo.launch_default_for_uri_async(uri, launchContext(), null, (_source, result) => {
      try {
        Gio.AppInfo.launch_default_for_uri_finish(result);
      } catch (error) {
        console.warn(`Could not open ${uri}: ${error}`);
      }
    }));
  }

  private run(action: () => void): void {
    this.close();
    action();
  }
}
