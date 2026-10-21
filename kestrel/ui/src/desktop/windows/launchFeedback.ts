import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

function identities(window: Meta.Window): Set<string> {
  const app = Shell.WindowTracker.get_default().get_window_app(window);
  return new Set([app?.id?.replace(/\.desktop$/, ''), window.get_gtk_application_id(), window.get_sandboxed_app_id(), window.get_wm_class(), window.get_wm_class_instance()]
    .filter((name): name is string => !!name).map(name => name.toLowerCase()));
}

function launchedAs(sequence: Meta.StartupSequence): string[] {
  const application = sequence.get_application_id();
  return [application && GLib.path_get_basename(application).replace(/\.desktop$/, ''), sequence.get_wmclass()]
    .filter((name): name is string => !!name).map(name => name.toLowerCase());
}

function completeLaunchesOf(window: Meta.Window): void {
  const names = identities(window);
  for (const sequence of Shell.WindowTracker.get_default().get_startup_sequences())
    if (!sequence.get_completed() && launchedAs(sequence).some(name => names.has(name))) sequence.complete();
}

export class LaunchFeedback {
  private readonly signals: number[];

  constructor() {
    const display = global.display;
    this.signals = [
      display.connect('window-created', (_display, window: Meta.Window) => {
        const shown = window.connect('shown', () => {
          window.disconnect(shown);
          completeLaunchesOf(window);
        });
      }),
      display.connect('notify::focus-window', () => {
        if (display.focus_window) completeLaunchesOf(display.focus_window);
      }),
    ];
  }

  destroy(): void {
    const display = global.display;
    for (const signal of this.signals) display.disconnect(signal);
  }
}
