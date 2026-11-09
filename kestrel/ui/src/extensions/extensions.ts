import { ExtensionPorts } from './firewall.js';
import { DesktopState, type ExtensionHost } from './host.js';
import { ExtensionManager } from './runtime/manager.js';
import { FileActionsService } from './fileActions/service.js';
import { ExtensionsService } from './service.js';

export type HostParts = Omit<ExtensionHost, 'desktop' | 'watchMonitors'>;

/** Luft extensions in this session: the runtime and its D-Bus interface. */
export class Extensions {
  private readonly desktop = new DesktopState();
  private readonly monitorListeners = new Set<() => void>();
  private readonly manager: ExtensionManager;
  /** What the extension API stands on, which Kestrel's own pop-ups use too. */
  readonly host: ExtensionHost;
  private readonly service: ExtensionsService;
  private readonly ports: ExtensionPorts;
  private readonly fileActions = new FileActionsService();

  constructor(parts: HostParts) {
    this.host = {
      ...parts,
      desktop: this.desktop,
      watchMonitors: changed => {
        this.monitorListeners.add(changed);
        return () => this.monitorListeners.delete(changed);
      },
    };
    this.manager = new ExtensionManager(this.host);
    this.service = new ExtensionsService(this.manager);
    this.ports = new ExtensionPorts(this.manager);
  }

  syncDesktop(wallpaperShown: boolean, active: boolean, locked: boolean): void {
    this.desktop.update(wallpaperShown, active, locked);
  }

  monitorsChanged(): void {
    for (const listener of [...this.monitorListeners]) listener();
  }

  shutdown(): void {
    this.ports.destroy();
    this.fileActions.destroy();
    this.service.destroy();
    this.manager.shutdown();
  }
}
