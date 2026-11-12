import { ExtensionPorts } from './firewall.js';
import { DesktopState, type ExtensionHost } from './host.js';
import { ExtensionManager } from './runtime/manager.js';
import { FileActionsService } from './fileActions/service.js';
import { ExtensionsService } from './service.js';

type HostParts = Omit<ExtensionHost, 'desktop' | 'watchMonitors'>;

export class Extensions {
  private readonly desktop = new DesktopState();
  private readonly monitorListeners = new Set<() => void>();
  private readonly manager: ExtensionManager;
  readonly host: ExtensionHost;
  private readonly service: ExtensionsService;
  private readonly ports: ExtensionPorts;
  private readonly fileActions = new FileActionsService();
  private markReady: () => void = () => {};

  constructor(parts: HostParts) {
    this.host = {
      ...parts,
      desktop: this.desktop,
      watchMonitors: changed => {
        this.monitorListeners.add(changed);
        return () => this.monitorListeners.delete(changed);
      },
    };
    this.manager = new ExtensionManager(this.host, new Promise(resolve => (this.markReady = resolve)));
    this.service = new ExtensionsService(this.manager);
    this.ports = new ExtensionPorts(this.manager);
  }

  desktopReady(): void {
    this.markReady();
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
