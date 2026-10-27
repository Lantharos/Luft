import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as GnomeSession from '../system/gnomeSession.js';
import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../main.js';
import { ShellMountOperation } from '../dialogs/mount/mountOperation.js';

const AUTORUN_EXPIRE_TIMEOUT_SECS = 10;

const WRONG_PASSPHRASE_ERRORS = [
  'No key available with this passphrase',
  'No key available to unlock device',
  'Failed to activate device: Incorrect passphrase',
  'Failed to load device\'s parameters: Invalid argument',
  'Failed to load device\'s parameters: Operation not permitted',
];
const PIM_UNSUPPORTED_ERROR = 'Compiled against a version of libcryptsetup that does not support the VeraCrypt PIM setting';

interface MountOptions {
  checkSession?: boolean;
  useMountOp?: boolean;
  allowAutorun?: boolean;
}

interface AutorunVolume extends Gio.Volume {
  allowAutorun?: boolean;
  allowAutorunExpireId?: number;
}

export function allowsAutorun(volume: AutorunVolume): boolean {
  return !!volume.allowAutorun;
}

class AutomountManager {
  private readonly activeOperations = new Map<Gio.Volume, ShellMountOperation | null>();
  private readonly session = GnomeSession.SessionManager();
  private readonly volumeMonitor = Gio.VolumeMonitor.get();
  private inhibited = false;
  private cancellable: Gio.Cancellable | null = null;
  private mountAllId = 0;

  constructor() {
    this.session.connectSignal('InhibitorAdded', () => void this.inhibitorsChanged());
    this.session.connectSignal('InhibitorRemoved', () => void this.inhibitorsChanged());
  }

  enable(): void {
    this.cancellable = new Gio.Cancellable();

    this.volumeMonitor.connectObject(
      'volume-added', (_monitor: Gio.VolumeMonitor, volume: Gio.Volume) => this.checkAndMountVolume(volume),
      'volume-removed', (_monitor: Gio.VolumeMonitor, volume: Gio.Volume) => this.onVolumeRemoved(volume),
      'drive-eject-button', (_monitor: Gio.VolumeMonitor, drive: Gio.Drive) => this.onDriveEjectButton(drive), this);

    this.mountAllId = GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => this.startupMountAll());
    GLib.Source.set_name_by_id(this.mountAllId, '[kestrel] this._startupMountAll');
  }

  disable(): void {
    this.cancellable?.cancel();
    this.cancellable = null;

    this.volumeMonitor.disconnectObject(this);

    if (this.mountAllId > 0) {
      GLib.source_remove(this.mountAllId);
      this.mountAllId = 0;
    }
  }

  private async inhibitorsChanged(): Promise<void> {
    try {
      [this.inhibited] = await this.session.IsInhibitedAsync(GnomeSession.InhibitFlags.AUTOMOUNT);
    } catch {}
  }

  private startupMountAll(): void {
    for (const volume of this.volumeMonitor.get_volumes())
      this.checkAndMountVolume(volume, { checkSession: false, useMountOp: false, allowAutorun: false });

    this.mountAllId = 0;
  }

  private onDriveEjectButton(drive: Gio.Drive): void {
    if (!this.session.SessionIsActive) return;

    if (drive.can_stop()) {
      drive.stop(Gio.MountUnmountFlags.FORCE, null, null, (_drive, result) => {
        try {
          drive.stop_finish(result);
        } catch (error) {
          log(`Unable to stop the drive after drive-eject-button ${error}`);
        }
      });
    } else if (drive.can_eject()) {
      drive.eject_with_operation(Gio.MountUnmountFlags.FORCE, null, null, (_drive, result) => {
        try {
          drive.eject_with_operation_finish(result);
        } catch (error) {
          log(`Unable to eject the drive after drive-eject-button ${error}`);
        }
      });
    }
  }

  private checkAndMountVolume(volume: AutorunVolume, { checkSession = true, useMountOp = true, allowAutorun = true }: MountOptions = {}): void {
    if (checkSession && !this.session.SessionIsActive) return;
    if (this.inhibited) return;
    if (volume.get_mount()) return;

    if (!volume.should_automount() || !volume.can_mount()) {
      volume.allowAutorun = true;
      this.allowAutorunExpire(volume);
      return;
    }

    this.mountVolume(volume, useMountOp ? new ShellMountOperation(volume) : null, allowAutorun);
  }

  private mountVolume(volume: AutorunVolume, operation: ShellMountOperation | null, allowAutorun = false): void {
    if (allowAutorun) volume.allowAutorun = true;

    this.activeOperations.set(volume, operation);

    volume.mount(0, operation?.mountOp ?? null, this.cancellable, (_volume, result) => this.onVolumeMounted(volume, result));
  }

  private onVolumeMounted(volume: Gio.Volume, result: Gio.AsyncResult): void {
    this.allowAutorunExpire(volume);

    try {
      volume.mount_finish(result);
      this.closeOperation(volume);
    } catch (error) {
      const { message } = error as GLib.Error;
      if (WRONG_PASSPHRASE_ERRORS.some(wrongPassphrase => message.includes(wrongPassphrase))) {
        this.reaskPassword(volume);
        return;
      }

      if (message.includes(PIM_UNSUPPORTED_ERROR))
        Main.notifyError(KestrelUi.t('mount-unlock-failed'), KestrelUi.t('mount-pim-unsupported'));

      if (!(error as GLib.Error).matches(Gio.IOErrorEnum, Gio.IOErrorEnum.FAILED_HANDLED))
        log(`Unable to mount volume ${volume.get_name()}: ${error}`);
      this.closeOperation(volume);
    }
  }

  private onVolumeRemoved(volume: AutorunVolume): void {
    if (!volume.allowAutorunExpireId) return;

    GLib.source_remove(volume.allowAutorunExpireId);
    delete volume.allowAutorunExpireId;
  }

  private reaskPassword(volume: Gio.Volume): void {
    const existingDialog = this.activeOperations.get(volume)?.borrowPasswordDialog() ?? null;
    this.mountVolume(volume, new ShellMountOperation(volume, existingDialog));
  }

  private closeOperation(volume: Gio.Volume): void {
    const operation = this.activeOperations.get(volume);
    if (!operation) return;

    operation.close();
    this.activeOperations.delete(volume);
  }

  private allowAutorunExpire(volume: AutorunVolume): void {
    const id = GLib.timeout_add_seconds_once(GLib.PRIORITY_DEFAULT, AUTORUN_EXPIRE_TIMEOUT_SECS, () => {
      volume.allowAutorun = false;
      delete volume.allowAutorunExpireId;
    });
    volume.allowAutorunExpireId = id;
    GLib.Source.set_name_by_id(id, '[kestrel] volume.allowAutorun');
  }
}

export { AutomountManager as Component };
