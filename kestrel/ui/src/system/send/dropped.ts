import Gio from 'gi://Gio';

import type { Received } from './received.js';
import { openSendSheet, sendSheetOpen } from './sheet.js';

function described(path: string): Received {
  const file = Gio.File.new_for_path(path);
  const info = file.query_info('standard::display-name,standard::content-type', Gio.FileQueryInfoFlags.NONE, null);
  return { path, name: info.get_display_name(), contentType: info.get_content_type() ?? 'application/octet-stream' };
}

/** Opens the Send sheet for files people dropped on Post or the taskbar, which are theirs, so need no copies. */
export function sendDropped(paths: string[]): void {
  if (!paths.length || sendSheetOpen()) return;
  let files: Received[];
  try {
    files = paths.map(described);
  } catch (error) {
    logError(error);
    return;
  }
  openSendSheet(files, null).catch(logError);
}
