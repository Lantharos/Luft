import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Placement } from '../../desktop/windows/recovery/placement.js';
import type { SavedWindow } from '../../desktop/windows/recovery/snapshot.js';

export type Ending = 'running' | 'update' | 'ordinary';

export interface RecordedWindow extends Placement {
  app: string;
  tag: string;
  monitor: number;
  stack: number;
  focused: boolean;
}

export interface SessionRecord {
  ending: Ending;
  windows: RecordedWindow[];
}

const PRIVATE = Gio.FileCreateFlags.PRIVATE | Gio.FileCreateFlags.REPLACE_DESTINATION;
const file = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'session.json']));

function recorded({ appId, tag, monitor, focused, frame, workspace, maximized, fullscreen, minimized, above, edges }: SavedWindow, stack: number): RecordedWindow {
  return { app: appId, tag, monitor, stack, focused, frame, workspace, maximized, fullscreen, minimized, above, edges };
}

export function recordedWindows(stacked: SavedWindow[]): RecordedWindow[] {
  return stacked.map((saved, stack) => ({ saved, stack }))
    .filter(({ saved }) => saved.appId)
    .sort((a, b) => a.saved.sequence - b.saved.sequence)
    .map(({ saved, stack }) => recorded(saved, stack));
}

const encoded = (record: SessionRecord) => new TextEncoder().encode(JSON.stringify(record));

function prepareFolder(): void {
  GLib.mkdir_with_parents(file.get_parent()!.get_path()!, 0o700);
}

export function load(): Promise<SessionRecord | null> {
  return new Promise(resolve => file.load_contents_async(null, (_file, result) => {
    try {
      const [, contents] = file.load_contents_finish(result);
      resolve(JSON.parse(new TextDecoder().decode(contents)) as SessionRecord);
    } catch (error) {
      if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)))
        console.warn(`The apps open in the last session could not be read: ${error}`);
      resolve(null);
    }
  }));
}

export function store(record: SessionRecord, stored: () => void): void {
  prepareFolder();
  file.replace_contents_bytes_async(new GLib.Bytes(encoded(record)), null, false, PRIVATE, null, (_file, result) => {
    try {
      file.replace_contents_finish(result);
    } catch (error) {
      console.warn(`The open apps could not be noted: ${error}`);
    }
    stored();
  });
}

export function storeNow(record: SessionRecord): void {
  prepareFolder();
  try {
    file.replace_contents(encoded(record), null, false, PRIVATE, null);
  } catch (error) {
    console.warn(`The open apps could not be noted before the session ended: ${error}`);
  }
}
