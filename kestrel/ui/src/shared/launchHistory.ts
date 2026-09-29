import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const HALF_LIFE_SECONDS = 14 * 24 * 60 * 60;
const FORGOTTEN_BELOW = 0.1;
const REMEMBERED = 300;

type Launches = [count: number, lastSeconds: number];

function nowSeconds(): number {
  return Math.round(GLib.get_real_time() / GLib.USEC_PER_SEC);
}

function decayed([count, lastSeconds]: Launches, now: number): number {
  return count * 0.5 ** ((now - lastSeconds) / HALF_LIFE_SECONDS);
}

class LaunchHistory {
  private readonly file = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'launches.json']));
  private entries = new Map<string, Launches>();
  private saving = false;
  private dirty = false;

  constructor() {
    this.file.load_contents_async(null, (file, result) => {
      try {
        const [, contents] = file!.load_contents_finish(result);
        const saved = Object.entries(JSON.parse(new TextDecoder().decode(contents)) as Record<string, Launches>);
        this.entries = new Map([...saved, ...this.entries]);
      } catch (error) {
        if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)))
          console.warn(`Launch history could not be read: ${error}`);
      }
    });
  }

  weigher(): (key: string) => number {
    const now = nowSeconds();
    return key => {
      const launches = this.entries.get(key);
      return launches ? decayed(launches, now) : 0;
    };
  }

  record(key: string): void {
    const now = nowSeconds();
    const launches = this.entries.get(key);
    this.entries.set(key, [(launches ? decayed(launches, now) : 0) + 1, now]);
    this.entries = new Map([...this.entries]
      .map(([entry, value]) => [entry, value, decayed(value, now)] as const)
      .filter(([, , weight]) => weight >= FORGOTTEN_BELOW)
      .sort((a, b) => b[2] - a[2])
      .slice(0, REMEMBERED)
      .map(([entry, value]) => [entry, value]));
    this.save();
  }

  private save(): void {
    if (this.saving) {
      this.dirty = true;
      return;
    }
    this.saving = true;
    const rounded = Object.fromEntries([...this.entries].map(([key, [count, last]]) => [key, [Math.round(count * 1000) / 1000, last]]));
    GLib.mkdir_with_parents(this.file.get_parent()!.get_path()!, 0o755);
    this.file.replace_contents_bytes_async(new GLib.Bytes(new TextEncoder().encode(JSON.stringify(rounded))), null, false,
      Gio.FileCreateFlags.REPLACE_DESTINATION, null, (file, result) => {
        try {
          file!.replace_contents_finish(result);
        } catch (error) {
          console.warn(`Launch history could not be saved: ${error}`);
        }
        this.saving = false;
        if (!this.dirty) return;
        this.dirty = false;
        this.save();
      });
  }
}

export const launchHistory = new LaunchHistory();

export function appKey(appId: string): string {
  return `app:${appId}`;
}
