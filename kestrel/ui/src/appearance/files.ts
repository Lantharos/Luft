import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

Gio._promisify(Gio.File.prototype, 'load_contents_async');
Gio._promisify(Gio.File.prototype, 'replace_contents_bytes_async', 'replace_contents_finish');
Gio._promisify(Gio.File.prototype, 'delete_async');

interface Markers {
  start: string;
  end: string;
}

export const userFile = (base: string, ...parts: string[]) => Gio.File.new_for_path(GLib.build_filenamev([base, ...parts]));

export const missing = (error: unknown) => error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND);

export async function readText(file: Gio.File): Promise<string | null> {
  try {
    const [contents] = await file.load_contents_async(null);
    return new TextDecoder().decode(contents);
  } catch (error) {
    if (missing(error)) return null;
    throw error;
  }
}

export async function writeText(file: Gio.File, contents: string): Promise<void> {
  GLib.mkdir_with_parents(file.get_parent()!.get_path()!, 0o755);
  await file.replace_contents_bytes_async(new GLib.Bytes(new TextEncoder().encode(contents)), null, false, Gio.FileCreateFlags.NONE, null);
}

export async function removeFile(file: Gio.File): Promise<void> {
  try {
    await file.delete_async(GLib.PRIORITY_DEFAULT, null);
  } catch (error) {
    if (!missing(error)) throw error;
  }
}

function withoutBlock(text: string, { start, end }: Markers): string {
  const from = text.indexOf(start);
  const to = text.indexOf(end, from);
  if (from < 0 || to < 0) return text;
  const after = text.slice(to + end.length).replace(/^\n\n?/, '');
  return text.slice(0, from) + after;
}

export async function writeBlock(file: Gio.File, markers: Markers, block: string): Promise<void> {
  const text = await readText(file);
  const rest = withoutBlock(text ?? '', markers);
  const next = `${markers.start}\n${block}${markers.end}\n${rest ? `\n${rest}` : ''}`;
  if (next !== text) await writeText(file, next);
}

export async function removeBlock(file: Gio.File, markers: Markers): Promise<void> {
  const text = await readText(file);
  if (text === null) return;
  const rest = withoutBlock(text, markers);
  if (rest === text) return;
  if (rest.trim()) await writeText(file, rest);
  else await removeFile(file);
}
