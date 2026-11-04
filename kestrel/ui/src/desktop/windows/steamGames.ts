import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { readText, userFile, writeText } from '../../appearance/files.js';
import { findSteamGame, type SteamGame } from './steamLibrary.js';

const ENTRY = 'Desktop Entry';

function desktopEntry(id: string, { name, icon }: SteamGame): string {
  const entry = new GLib.KeyFile();
  entry.set_string(ENTRY, 'Type', 'Application');
  entry.set_string(ENTRY, 'Name', name);
  if (icon) entry.set_string(ENTRY, 'Icon', icon);
  entry.set_string(ENTRY, 'Exec', `gio open steam://rungameid/${id}`);
  entry.set_string(ENTRY, 'Categories', 'Game;');
  entry.set_boolean(ENTRY, 'NoDisplay', true);
  return entry.to_data()[0];
}

async function describe(id: string): Promise<void> {
  if (Shell.AppSystem.get_default().lookup_steam_game(id)?.get_app_info()?.should_show()) return;
  const game = await findSteamGame(id);
  if (!game) return;
  const file = userFile(GLib.get_user_data_dir(), 'applications', `steam_app_${id}.desktop`);
  const entry = desktopEntry(id, game);
  if (await readText(file) !== entry) await writeText(file, entry);
}

export class SteamGames {
  private readonly described = new Set<string>();
  private readonly tracker = Shell.WindowTracker.get_default();
  private readonly signal = this.tracker.connect('steam-game-opened', (_tracker, id: string) => {
    if (this.described.has(id)) return;
    this.described.add(id);
    describe(id).catch(logError);
  });

  destroy(): void {
    this.tracker.disconnect(this.signal);
  }
}
