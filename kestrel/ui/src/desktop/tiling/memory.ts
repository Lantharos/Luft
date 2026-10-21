import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

interface Saved {
  floating: string[];
}

export class FloatingMemory {
  private readonly file = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'tiling.json']));
  private apps = new Set<string>();
  private saving = false;
  private dirty = false;

  constructor(loaded: () => void) {
    this.file.load_contents_async(null, (file, result) => {
      try {
        const [, contents] = file!.load_contents_finish(result);
        const saved = JSON.parse(new TextDecoder().decode(contents)) as Saved;
        this.apps = new Set([...saved.floating, ...this.apps]);
      } catch (error) {
        if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)))
          console.warn(`Floating windows could not be read: ${error}`);
      }
      loaded();
    });
  }

  floats(app: string | null): boolean {
    return !!app && this.apps.has(app);
  }

  remember(app: string | null, floating: boolean): void {
    if (!app || this.apps.has(app) === floating) return;
    if (floating) this.apps.add(app);
    else this.apps.delete(app);
    this.save();
  }

  private save(): void {
    if (this.saving) {
      this.dirty = true;
      return;
    }
    this.saving = true;
    const saved: Saved = { floating: [...this.apps].sort() };
    GLib.mkdir_with_parents(this.file.get_parent()!.get_path()!, 0o755);
    this.file.replace_contents_bytes_async(new GLib.Bytes(new TextEncoder().encode(JSON.stringify(saved))), null, false,
      Gio.FileCreateFlags.REPLACE_DESTINATION, null, (file, result) => {
        try {
          file!.replace_contents_finish(result);
        } catch (error) {
          console.warn(`Floating windows could not be saved: ${error}`);
        }
        this.saving = false;
        if (!this.dirty) return;
        this.dirty = false;
        this.save();
      });
  }
}
