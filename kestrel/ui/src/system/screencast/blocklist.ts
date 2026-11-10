import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const BLOCKLIST_FILENAME = 'screencast-pipeline-blocklist';

export class PipelineBlocklist {
  private readonly file = Gio.File.new_for_path(
    GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY')!, BLOCKLIST_FILENAME]));
  private readonly previousCrashes: string[] = [];

  constructor() {
    try {
      const [, contents] = this.file.load_contents(null);
      this.previousCrashes = JSON.parse(new TextDecoder().decode(contents));
    } catch (e) {
      if (!(e instanceof GLib.Error && e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)))
        console.warn(`The screen recording pipelines that crashed before could not be read: ${e}`);
    }
  }

  crashedBefore(id: string): boolean {
    return this.previousCrashes.includes(id);
  }

  suspect(id: string): void {
    this.write([...this.previousCrashes, id]);
  }

  restore(): void {
    this.write(this.previousCrashes);
  }

  private write(blocklist: string[]): void {
    try {
      if (blocklist.length === 0) {
        GLib.unlink(this.file.get_path()!);
        return;
      }
      GLib.mkdir_with_parents(this.file.get_parent()!.get_path()!, 0o700);
      this.file.replace_contents(JSON.stringify(blocklist), null, false, Gio.FileCreateFlags.NONE, null);
    } catch (e) {
      console.log(`Failed to update pipeline-blocklist file: ${(e as Error).message}`);
    }
  }
}
