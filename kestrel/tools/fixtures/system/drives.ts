import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {failureOf} from '../../checks/lib/errors.js';
import type {Model} from './udisks/model.js';

export const DRIVES = `<node><interface name="com.lantharos.Trust1.Drives">
  <property name="Drives" type="a{sa{sv}}" access="read"/>
  <method name="Check"><arg type="s" direction="in"/><arg type="s" direction="out"/><arg type="a(sbs)" direction="out"/><arg type="s" direction="out"/></method>
  <method name="Encrypt">
    <arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="b" direction="in"/><arg type="s" direction="out"/>
  </method>
  <method name="Decrypt"><arg type="s" direction="in"/><arg type="s" direction="in"/></method>
  <method name="SetUpUnlocking"><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="b" direction="in"/></method>
  <method name="Pause"><arg type="s" direction="in"/></method>
  <method name="Resume"><arg type="s" direction="in"/><arg type="s" direction="in"/></method>
  <method name="ShowRecoveryKey"><arg type="s" direction="in"/><arg type="s" direction="out"/></method>
  <method name="Continue"/>
</interface></node>`;

const STEP_MS = 400;
const STEPS = 6;
const SYSTEM = ['/dev/nvme0n1p1', '/dev/nvme0n1p2', '/dev/nvme0n1p3'];
const REFORMAT = ['/dev/sdb1'];
const WRONG_KEY = 'com.lantharos.Trust1.Error.WrongKey';

type Drive = {
  Device: string;
  State?: string;
  Change?: string;
  Progress?: number;
  Remaining?: number;
  AutoUnlock?: boolean;
  RecoveryKeyStored?: boolean;
};

const SIGNATURES: Record<string, string> = {
  Device: 's', State: 's', Change: 's', Progress: 'd', Remaining: 't', AutoUnlock: 'b', RecoveryKeyStored: 'b',
};

const entry = (values: Drive) => Object.fromEntries(Object.entries<[string, unknown]>({
  Device: ['s', ''], State: ['s', 'on'], Change: ['s', ''], Progress: ['d', 1], Remaining: ['t', 0], AutoUnlock: ['b', false],
  RecoveryKeyStored: ['b', false], ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, [SIGNATURES[key], value]])),
}).map(([key, [signature, value]]) => [key, new GLib.Variant(signature, value)]));

class Failure extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

export function drivesService(calls: string[], model: Model, recoveryKey: string) {
  const drives = new Map<string, Drive>([['archive-luks', {Device: '/dev/sda1', AutoUnlock: false, RecoveryKeyStored: true}]]);
  let exported: Gio.DBusExportedObject | null = null;
  const changed = () => exported?.emit_property_changed('Drives', new GLib.Variant('a{sa{sv}}',
    Object.fromEntries([...drives].map(([uuid, values]) => [uuid, entry(values)]))));
  const answer = (invocation: Gio.DBusMethodInvocation, work: () => GLib.Variant | void) => {
    try {
      const result = work();
      invocation.return_value(result === undefined ? null : result);
    } catch (error) {
      const failure = failureOf(error);
      invocation.return_dbus_error(failure instanceof Error && failure.name.startsWith('com.') ? failure.name : 'com.lantharos.Trust1.Error.Failed', failure.message);
    }
  };
  const uuidOf = (device: string) => model.byDevice(device).IdUUID;
  const progress = (uuid: string, finish: (drive: Drive) => void) => {
    let step = 2;
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, STEP_MS, () => {
      const drive = drives.get(uuid);
      if (!drive || drive.State === 'paused') return GLib.SOURCE_REMOVE;
      step += 1;
      drive.Progress = Math.min(1, step / STEPS);
      if (step >= STEPS) finish(drive);
      changed();
      return step >= STEPS ? GLib.SOURCE_REMOVE : GLib.SOURCE_CONTINUE;
    });
  };
  const requireKey = (uuid: string, unlock: string) => {
    const drive = drives.get(uuid);
    if (!unlock && !(drive?.AutoUnlock || drive?.RecoveryKeyStored)) throw new Failure(WRONG_KEY, 'Enter the disk’s recovery key or passphrase to continue.');
  };

  const implementation = {
    get Drives() {
      return Object.fromEntries([...drives].map(([uuid, values]) => [uuid, entry(values)]));
    },
    CheckAsync: ([device]: [string], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
      calls.push(`Check ${device}`);
      if (SYSTEM.includes(device))
        return new GLib.Variant('(sa(sbs)s)', ['none', [['use', false, 'The computer needs it to start, so it can’t be encrypted here.']], '']);
      if (REFORMAT.includes(device))
        return new GLib.Variant('(sa(sbs)s)', ['reformat', [['room', false, 'There’s no free space right after it on the drive, and exFAT can’t make room for encryption without erasing it.'],
          ['tools', true, 'Everything needed is installed.'], ['power', true, 'The computer is plugged in.']], '']);
      return new GLib.Variant('(sa(sbs)s)', ['in-place', [['room', true, 'It grows by 32 MB into the free space after it, to make room for encryption.'],
        ['tools', true, 'Everything needed is installed.'], ['power', true, 'The computer is plugged in.']], '']);
    }),
    EncryptAsync: ([device, , passphrase, autoUnlock]: [string, string, string, boolean], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
      calls.push(`Encrypt ${device} auto=${autoUnlock} passphrase=${passphrase.length > 0}`);
      const uuid = model.encryptInPlace(device, passphrase || recoveryKey);
      drives.set(uuid, {Device: device, State: 'encrypting', Change: 'encrypt', Progress: 0.2, Remaining: 2400, AutoUnlock: autoUnlock, RecoveryKeyStored: true});
      changed();
      progress(uuid, drive => Object.assign(drive, {State: 'on', Change: '', Remaining: 0}));
      return new GLib.Variant('(s)', [uuid]);
    }),
    DecryptAsync: ([device, unlock]: [string, string], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
      const uuid = uuidOf(device);
      requireKey(uuid, unlock);
      calls.push(`Decrypt ${device}`);
      const drive = drives.get(uuid) ?? {Device: device};
      drives.set(uuid, Object.assign(drive, {State: 'decrypting', Change: 'decrypt', Progress: 0.1, Remaining: 900}));
      changed();
      progress(uuid, () => {
        drives.delete(uuid);
        model.decryptInPlace(device);
      });
    }),
    SetUpUnlockingAsync: ([device, unlock, recovery, autoUnlock]: [string, string, string, boolean], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
      const uuid = uuidOf(device);
      requireKey(uuid, unlock);
      calls.push(`SetUpUnlocking ${device} auto=${autoUnlock} recovery=${recovery.length > 0}`);
      const drive = drives.get(uuid) ?? {Device: device};
      drives.set(uuid, Object.assign(drive, {AutoUnlock: autoUnlock, RecoveryKeyStored: drive.RecoveryKeyStored || recovery.length > 0}));
      changed();
    }),
    PauseAsync: ([uuid]: [string], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
      calls.push(`Pause ${uuid}`);
      drives.get(uuid)!.State = 'paused';
      changed();
    }),
    ResumeAsync: ([uuid, unlock]: [string, string], invocation: Gio.DBusMethodInvocation) => answer(invocation, () => {
      requireKey(uuid, unlock);
      calls.push(`Resume ${uuid}`);
      const drive = drives.get(uuid)!;
      drive.State = drive.Change === 'decrypt' ? 'decrypting' : 'encrypting';
      changed();
      progress(uuid, done => Object.assign(done, {State: 'on', Change: '', Remaining: 0}));
    }),
    ShowRecoveryKey: () => recoveryKey,
    Continue: () => calls.push('Continue'),
  };
  return {implementation, attach: (published: Gio.DBusExportedObject) => (exported = published)};
}
