import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';

const APP_ID = 'com.lantharos.kestrel.quicksettings';
const NAME = 'com.lantharos.Kestrel.QuickSettings';
const PATH = '/com/lantharos/Kestrel/QuickSettings';

export class StandaloneQuickSettings {
  private running = false;

  constructor(private readonly position: (width: number, height: number) => [number, number]) {
    Gio.bus_watch_name(Gio.BusType.SESSION, NAME, Gio.BusNameWatcherFlags.NONE, () => (this.running = true), () => (this.running = false));
    global.display.connect('window-created', (_display, window) => {
      const shown = window.connect('shown', () => {
        window.disconnect(shown);
        if (window.get_wm_class() === APP_ID) this.place(window);
      });
    });
  }

  get available(): boolean {
    return this.running;
  }

  toggle(): void {
    Gio.DBus.session.call(NAME, PATH, NAME, 'Toggle', null, null, Gio.DBusCallFlags.NONE, -1, null, null);
  }

  private place(window: Meta.Window): void {
    const move = () => {
      const { width, height } = window.get_frame_rect();
      window.move_frame(true, ...this.position(width, height));
    };
    window.connect('size-changed', move);
    move();
  }
}
