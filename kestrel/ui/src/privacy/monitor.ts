import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import type { getGeoclueAgent } from 'resource:///com/lantharos/kestrel/ui/status/location.js';
import { getMixerControl } from 'resource:///com/lantharos/kestrel/ui/status/volume.js';

const LEVEL_METERS = ['org.gnome.VolumeControl', 'org.PulseAudio.pavucontrol'];

export interface PrivacyState {
  camera: boolean;
  microphone: boolean;
  sharing: boolean;
  recording: boolean;
  location: boolean;
}

export class PrivacyMonitor {
  readonly handles = new Set<Meta.RemoteAccessHandle>();
  private readonly camera = new Shell.CameraMonitor();
  private readonly mixer = getMixerControl();
  private geoclue: ReturnType<typeof getGeoclueAgent> | null = null;
  private readonly disconnectors: (() => void)[] = [];

  constructor(changed: () => void) {
    const camera = this.camera.connect('notify::cameras-in-use', changed);
    const mixer = ['stream-added', 'stream-removed'].map(signal => this.mixer.connect(signal, changed));
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
      () => this.camera.disconnect(camera),
      () => mixer.forEach(id => this.mixer.disconnect(id)),
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

  get state(): PrivacyState {
    return {
      camera: this.camera.cameras_in_use,
      microphone: this.mixer.get_source_outputs().some(output => !LEVEL_METERS.includes(output.get_application_id() ?? '')),
      sharing: [...this.handles].some(handle => !handle.is_recording),
      recording: [...this.handles].some(handle => handle.is_recording),
      location: this.geoclue?.inUse ?? false,
    };
  }

  destroy(): void {
    for (const disconnect of this.disconnectors) disconnect();
  }
}
