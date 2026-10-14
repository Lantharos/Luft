import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import type Shell from 'gi://Shell';
import { LockBackdrop } from 'resource:///com/lantharos/kestrel/ui/lockScreen/backdrop.js';

import { AppearanceService } from '../../appearance/service.js';
import type { Rgb } from '../../appearance/color.js';
import { PortalBackend } from '../../portal/backend.js';
import { terminateOnceShown } from '../../shared/handoff.js';
import { animateActor } from '../../shared/motion.js';
import { centerOnArrival } from './placement.js';

const APP = 'com.lantharos.setup.desktop';
const NAME = 'com.lantharos.Kestrel.Setup';
const PATH = '/com/lantharos/Kestrel/Setup';
const INTERFACE = `<node><interface name="${NAME}"><method name="Finish"/></interface></node>`;
const FIRST_WINDOW_TIMEOUT = 10000;
const FINISH_DURATION = 250;

export interface SetupContext {
  layoutManager: {
    backgroundGroup: Clutter.Actor;
  };
}

function shell(): Shell.Global {
  return global as unknown as Shell.Global;
}

function firstWindow(): Promise<void> {
  return new Promise(resolve => {
    const display = shell().display;
    const timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, FIRST_WINDOW_TIMEOUT, () => {
      display.disconnect(created);
      resolve();
      return GLib.SOURCE_REMOVE;
    });
    const created = display.connect('window-created', (_display, window: Meta.Window) => {
      const shown = window.connect('shown', () => {
        window.disconnect(shown);
        display.disconnect(created);
        GLib.source_remove(timeout);
        resolve();
      });
    });
  });
}

export class Setup {
  private readonly backdrop = new LockBackdrop();
  private readonly portal = PortalBackend.forSetup();
  private readonly appearance = new AppearanceService(color => this.portal.setAccent(color));
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(INTERFACE, this);
  private readonly nameId: number;
  private readonly placement: () => void;
  private finishing = false;
  readonly ready: Promise<void>;

  constructor(context: SetupContext) {
    context.layoutManager.backgroundGroup.add_child(this.backdrop.actor);
    this.placement = centerOnArrival();
    this.dbus.export(Gio.DBus.session, PATH);
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, NAME, Gio.BusNameOwnerFlags.NONE, null, null);
    const launched = this.launch();
    this.ready = Promise.all([this.backdrop.loaded, launched ? firstWindow() : Promise.resolve()]).then(() => {});
  }

  private launch(): boolean {
    const app = GioUnix.DesktopAppInfo.new(APP);
    if (!app) return false;
    const context = shell().create_app_launch_context(0, -1);
    return app.launch_uris_as_manager([], context, GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD, null, (_app, pid) => {
      GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, () => {
        GLib.spawn_close_pid(pid);
        this.Finish();
      });
    });
  }

  wallpaperSampled(samples: Rgb[]): void {
    this.appearance.apply(samples);
  }

  Finish(): void {
    if (this.finishing) return;
    this.finishing = true;
    for (const actor of shell().get_window_actors())
      animateActor(actor, { opacity: 0, duration: FINISH_DURATION, mode: Clutter.AnimationMode.EASE_IN_QUAD });
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, FINISH_DURATION, () => {
      terminateOnceShown();
      return GLib.SOURCE_REMOVE;
    });
  }

  destroy(): void {
    this.appearance.destroy();
    this.portal.destroy();
    this.placement();
    this.dbus.unexport();
    Gio.bus_unown_name(this.nameId);
  }
}
