import { DesktopState, type ExtensionHost } from './host.js';
import { ExtensionManager } from './runtime/manager.js';
import { ExtensionsService } from './service.js';

export type HostParts = Omit<ExtensionHost, 'desktop' | 'watchMonitors'>;

/** Luft extensions in this session: the runtime and its D-Bus interface. */
export class Extensions {
  private readonly desktop = new DesktopState();
  private readonly monitorListeners = new Set<() => void>();
  private readonly manager: ExtensionManager;
  private readonly service: ExtensionsService;

  constructor(parts: HostParts) {
    this.manager = new ExtensionManager({
      ...parts,
      desktop: this.desktop,
      watchMonitors: changed => {
        this.monitorListeners.add(changed);
        return () => this.monitorListeners.delete(changed);
      },
    });
    this.service = new ExtensionsService(this.manager);
  }

  syncDesktop(wallpaperShown: boolean, active: boolean, locked: boolean): void {
    this.desktop.update(wallpaperShown, active, locked);
  }

  monitorsChanged(): void {
    for (const listener of [...this.monitorListeners]) listener();
  }

  shutdown(): void {
    this.service.destroy();
    this.manager.shutdown();
  }
}
