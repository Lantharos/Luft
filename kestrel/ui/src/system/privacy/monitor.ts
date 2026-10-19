import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import type { getGeoclueAgent } from 'resource:///com/lantharos/kestrel/ui/status/location.js';

import { ownDictation } from '../dictation/listening.js';
import { windowAccess } from '../peek/access/grants.js';
import { mixer } from '../mediaKeys/mixer.js';

export interface PrivacyState {
  camera: boolean;
  microphone: boolean;
  sharing: boolean;
  recording: boolean;
  location: boolean;
  windows: boolean;
}

export class PrivacyMonitor {
  readonly handles = new Set<Meta.RemoteAccessHandle>();
  private readonly camera = new Shell.CameraMonitor();
  private readonly mixer = mixer();
  private geoclue: ReturnType<typeof getGeoclueAgent> | null = null;
  private readonly disconnectors: (() => void)[] = [];
  private dictationIsOurs = false;

  constructor(changed: () => void) {
    const dictationChanged = () => {
      this.dictationIsOurs = ownDictation.active || (this.dictationIsOurs && this.mixer.dictating);
      changed();
    };
    const camera = this.camera.connect('notify::cameras-in-use', changed);
    const recording = this.mixer.connect('notify::recording', changed);
    const dictating = this.mixer.connect('notify::dictating', dictationChanged);
    const controller = (global as unknown as Shell.Global).backend.get_remote_access_controller();
    const handles = controller?.connect('new-handle', (_controller, handle: Meta.RemoteAccessHandle) => {
      this.handles.add(handle);
      handle.connect('stopped', () => {
        this.handles.delete(handle);
        changed();
      });
      changed();
    });
    this.disconnectors.push(
      windowAccess.watch(changed),
      ownDictation.watch(dictationChanged),
      () => this.camera.disconnect(camera),
      () => this.mixer.disconnect(recording),
      () => this.mixer.disconnect(dictating),
      () => { if (handles) controller!.disconnect(handles); },
    );
    void import('resource:///com/lantharos/kestrel/ui/status/location.js').then(({ getGeoclueAgent }) => {
      const geoclue = getGeoclueAgent();
      const location = geoclue.connect('notify::in-use', changed);
      this.geoclue = geoclue;
      this.disconnectors.push(() => geoclue.disconnect(location));
      changed();
    });
  }

  get ownDictation(): boolean {
    return this.dictationIsOurs;
  }

  get state(): PrivacyState {
    return {
      camera: this.camera.cameras_in_use,
      microphone: this.mixer.recording || (this.mixer.dictating && !this.dictationIsOurs),
      sharing: [...this.handles].some(handle => !handle.is_recording),
      recording: [...this.handles].some(handle => handle.is_recording),
      location: this.geoclue?.inUse ?? false,
      windows: windowAccess.active.length > 0,
    };
  }

  destroy(): void {
    for (const disconnect of this.disconnectors) disconnect();
  }
}
