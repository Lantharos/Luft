import type Meta from 'gi://Meta';

import { cameraMonitor } from '../privacy/camera.js';
import { playSound } from './sounds.js';

export class RecordingSounds {
  private readonly camera = cameraMonitor();
  private readonly controller = global.backend.get_remote_access_controller();
  private readonly cameraId: number;
  private readonly handleId: number;
  private cameraInUse: boolean;

  constructor() {
    this.cameraInUse = this.camera.cameras_in_use;
    this.cameraId = this.camera.connect('notify::cameras-in-use', () => {
      if (this.camera.cameras_in_use === this.cameraInUse) return;
      this.cameraInUse = this.camera.cameras_in_use;
      playSound(this.cameraInUse ? 'recording-started' : 'recording-stopped');
    });
    this.handleId = this.controller?.connect('new-handle', (_controller, handle: Meta.RemoteAccessHandle) => {
      playSound('recording-started');
      handle.connect('stopped', () => playSound('recording-stopped'));
    }) ?? 0;
  }

  destroy(): void {
    this.camera.disconnect(this.cameraId);
    if (this.handleId) this.controller!.disconnect(this.handleId);
  }
}
