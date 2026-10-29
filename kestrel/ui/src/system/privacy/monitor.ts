import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import { getGeoclueAgent } from './location.js';

import { LEVEL_METERS } from '../../shared/apps/levelMeters.js';
import { ownDictation } from '../dictation/listening.js';
import { windowAccess } from '../peek/access/grants.js';
import { cameraMonitor } from './camera.js';

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
  private readonly camera = cameraMonitor();
  private readonly mixer = Shell.Mixer.get_default();
  private readonly geoclue = getGeoclueAgent();
  private readonly disconnectors: (() => void)[] = [];

  constructor(changed: () => void) {
    this.mixer.set_level_meters(LEVEL_METERS);
    const dictationChanged = () => {
      if (!ownDictation.active && !this.mixer.dictating) ownDictation.process = null;
      this.mixer.set_dictation_process(ownDictation.pid);
      changed();
    };
    const camera = this.camera.connect('notify::cameras-in-use', changed);
    const recording = this.mixer.connect('notify::recording', changed);
    const dictating = this.mixer.connect('notify::dictating', dictationChanged);
    const controller = global.backend.get_remote_access_controller();
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
    const location = this.geoclue.connect('notify::in-use', changed);
    this.disconnectors.push(() => this.geoclue.disconnect(location));
  }

  get dictationPid(): number {
    return ownDictation.pid;
  }

  get state(): PrivacyState {
    return {
      camera: this.camera.cameras_in_use,
      microphone: this.mixer.recording,
      sharing: [...this.handles].some(handle => !handle.is_recording),
      recording: [...this.handles].some(handle => handle.is_recording),
      location: this.geoclue.inUse,
      windows: windowAccess.active.length > 0,
    };
  }

  destroy(): void {
    for (const disconnect of this.disconnectors) disconnect();
  }
}
