import type Meta from 'gi://Meta';
import St from 'gi://St';

export class AnimationsSettings {
  private animationsEnabled = true;
  private readonly handles = new Set<Meta.RemoteAccessHandle>();

  constructor() {
    global.connect('notify::force-animations', () => this.syncAnimationsEnabled());
    this.syncAnimationsEnabled();

    const remoteAccessController = global.backend.get_remote_access_controller();
    remoteAccessController?.connect('new-handle', (_, handle) => this.onNewRemoteAccessHandle(handle));
  }

  private shouldEnableAnimations(): boolean {
    if (global.force_animations) return true;
    if (this.handles.size > 0) return false;
    return global.backend.is_rendering_hardware_accelerated();
  }

  private syncAnimationsEnabled(): void {
    const shouldEnableAnimations = this.shouldEnableAnimations();
    if (this.animationsEnabled === shouldEnableAnimations) return;
    this.animationsEnabled = shouldEnableAnimations;

    const settings = St.Settings.get();
    if (shouldEnableAnimations)
      settings.uninhibit_animations();
    else
      settings.inhibit_animations();
  }

  private onRemoteAccessHandleStopped(handle: Meta.RemoteAccessHandle): void {
    this.handles.delete(handle);
    this.syncAnimationsEnabled();
  }

  private onNewRemoteAccessHandle(handle: Meta.RemoteAccessHandle): void {
    if (!handle.get_disable_animations()) return;

    this.handles.add(handle);
    this.syncAnimationsEnabled();
    handle.connect('stopped', stopped => this.onRemoteAccessHandleStopped(stopped));
  }
}
