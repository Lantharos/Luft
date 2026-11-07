import GLib from 'gi://GLib';

import type {Publish} from './bus.js';
import {DRIVES, drivesService} from './drives.js';
import {LETTERS_RECOVERY_KEY, NEW_RECOVERY_KEY} from './recoveryKeys.js';
import type {Model} from './udisks/model.js';

const TRUST = `<node><interface name="com.lantharos.Trust1">
  <property name="SecureBoot" type="s" access="read"/>
  <property name="Tpm" type="a{sv}" access="read"/>
  <property name="SigningKey" type="a{sv}" access="read"/>
  <property name="Startup" type="a{sv}" access="read"/>
  <property name="Disk" type="a{sv}" access="read"/>
  <property name="AntiCheat" type="a{sv}" access="read"/>
  <method name="GenerateRecoveryKey"><arg name="key" type="s" direction="out"/></method>
  <method name="SetUpTpmUnlock">
    <arg name="unlock" type="s" direction="in"/><arg name="pin" type="s" direction="in"/><arg name="recovery_key" type="s" direction="out"/>
  </method>
  <method name="RemoveTpmUnlock"><arg name="unlock" type="s" direction="in"/></method>
  <method name="ShowRecoveryKey"><arg name="key" type="s" direction="out"/></method>
  <method name="AcceptSecureBootChange"/>
  <method name="ReplaceRecoveryKey"><arg name="unlock" type="s" direction="in"/><arg name="key" type="s" direction="out"/></method>
  <method name="EnrollSigningKey"><arg name="code" type="s" direction="out"/></method>
  <method name="CancelSigningKeyEnrollment"/>
  <method name="RemoveOtherKeys"><arg name="code" type="s" direction="out"/></method>
  <method name="KeepOtherKeys"/>
  <method name="InstallSignedStartup"/>
  <method name="OtherStartups"><arg name="startups" type="a(sssa(qs)as)" direction="out"/></method>
  <method name="RemoveStartups"><arg name="folders" type="a(ss)" direction="in"/><arg name="partitions" type="as" direction="in"/></method>
  <method name="RemoveOldSystem"/>
  <method name="GrowSystem"><arg name="unlock" type="s" direction="in"/><arg name="grown" type="t" direction="out"/></method>
  <method name="GrowSystemAtStart"/>
  <method name="CancelSystemResize"/>
  <method name="MoveSystem"><arg name="drive" type="s" direction="in"/><arg name="offset" type="t" direction="in"/><arg name="size" type="t" direction="in"/></method>
  <method name="EraseAndMoveSystem"><arg name="drive" type="s" direction="in"/></method>
  <method name="CancelSystemMove"/>
  <method name="ForgetSystemMoveFailure"/>
  <method name="RemoveEarlierCopy"/>
</interface></node>`;
const USB_PROTECTION = `<node><interface name="com.lantharos.UsbProtection1">
  <property name="Enabled" type="b" access="read"/>
  <property name="Guarding" type="b" access="read"/>
  <property name="Held" type="a(ss)" access="read"/>
  <method name="SetEnabled"><arg name="enabled" type="b" direction="in"/></method>
  <signal name="Released"><arg name="devices" type="a(ss)"/></signal>
</interface></node>`;
const FWUPD = `<node><interface name="org.freedesktop.fwupd">
  <property name="HostSecurityId" type="s" access="read"/>
  <method name="GetHostSecurityAttrs"><arg type="aa{sv}" direction="out"/></method>
</interface></node>`;

const WINDOWS_ESP = '10000000-0000-4000-8000-000001048576';
const DISK = {Device: 's', Encrypted: 'b', Unlock: 'as', RecoveryKeyStored: 'b', TpmRefused: 'b', SecureBootChanged: 'b', Resize: 's',
  Move: 's', MoveTo: 's', MoveRefused: 's', MoveNeeds: 't', MoveCopies: 't', MoveFailedTo: 's', MoveFailed: 's',
  EarlierCopy: 'as', EarlierCopyDrive: 's', EarlierCopySize: 't'};
const GB = 1000 ** 3;
const SUCCESS = 1 << 0;
const FIRMWARE_SETTING = 1 << 12;
const CONTACT_MAKER = 1 << 11;
const ANTI_CHEAT_CHECKS = ['signed-system', 'tpm', 'secure-boot', 'measured-startup', 'iommu', 'lockdown', 'kexec', 'bpf-lsm'];

export const variants = (signature: Record<string, string>, values: Record<string, unknown>) => Object.fromEntries(Object.entries(values).map(([key, value]) =>
  [key, new GLib.Variant(signature[key], value)]));

const attribute = (id: string, summary: string, level: number, flags: number) => ({
  AppstreamId: new GLib.Variant('s', `org.fwupd.hsi.${id}`),
  Summary: new GLib.Variant('s', summary),
  HsiLevel: new GLib.Variant('u', level),
  Flags: new GLib.Variant('t', flags),
});

type Startup = [string, string, string, [number, string][], string[]];

export const SECURITY_NAMES = ['com.lantharos.Trust1', 'com.lantharos.UsbProtection1', 'org.freedesktop.fwupd'];

const overridden = (defaults: object, overrides: object) => Object.defineProperties(defaults, Object.getOwnPropertyDescriptors(overrides));

export function publishSecurity(publish: Publish, calls: string[], model: Model, trust: object = {}) {
  const startups: Startup[] = [[WINDOWS_ESP, 'EFI/Microsoft', 'windows', [[0, 'Windows Boot Manager']], []]];
  const disk = {Device: '/dev/nvme0n1p3', Encrypted: true, Unlock: ['tpm', 'pin', 'recovery-key'], RecoveryKeyStored: true, TpmRefused: false,
    SecureBootChanged: false, Resize: '', Move: '', MoveTo: '', MoveRefused: '', MoveNeeds: 48 * GB, MoveCopies: 31 * GB, MoveFailedTo: '',
    MoveFailed: '', EarlierCopy: [] as string[], EarlierCopyDrive: '', EarlierCopySize: 0};
  const moving = (drive: string) => {
    disk.Move = 'waiting';
    disk.MoveTo = drive.split('/').at(-1)?.replaceAll('_', ' ') ?? drive;
  };
  publish(TRUST, overridden({
    SecureBoot: 'on',
    Tpm: variants({Present: 'b', Version: 's', Usable: 'b', Reason: 's'}, {Present: true, Version: '2.0', Usable: true, Reason: ''}),
    SigningKey: variants({State: 's', Available: 'b', Reason: 's', Missed: 'u', MissedThisBoot: 'b', OtherKeys: 'as', RemovingOtherKeys: 'b'},
      {State: 'enrolled', Available: true, Reason: '', Missed: 0, MissedThisBoot: false, OtherKeys: [], RemovingOtherKeys: false}),
    Startup: variants({Installed: 'b', Measured: 'b', Available: 'b', Reason: 's', WithoutKey: 'b'},
      {Installed: true, Measured: true, Available: true, Reason: '', WithoutKey: false}),
    get Disk() {
      return variants(DISK, disk);
    },
    AntiCheat: variants({Checks: 'a(sbs)', UsesLuftKey: 'b'},
      {Checks: ANTI_CHEAT_CHECKS.map(id => [id, true, '']), UsesLuftKey: true}),
    GenerateRecoveryKey: () => NEW_RECOVERY_KEY,
    SetUpTpmUnlock: () => {
      calls.push('SetUpTpmUnlock');
      return '';
    },
    RemoveTpmUnlock: () => calls.push('RemoveTpmUnlock'),
    ShowRecoveryKey: () => LETTERS_RECOVERY_KEY,
    AcceptSecureBootChange: () => calls.push('AcceptSecureBootChange'),
    ReplaceRecoveryKey: () => NEW_RECOVERY_KEY,
    EnrollSigningKey: () => '48203917',
    CancelSigningKeyEnrollment: () => calls.push('CancelSigningKeyEnrollment'),
    RemoveOtherKeys: () => '51740386',
    KeepOtherKeys: () => calls.push('KeepOtherKeys'),
    InstallSignedStartup: () => calls.push('InstallSignedStartup'),
    OtherStartups: () => startups,
    RemoveStartups: (folders: [string, string][], partitions: string[]) => {
      calls.push(`RemoveStartups ${folders.map(([, folder]) => folder).join(',')} partitions=${partitions.length}`);
      startups.splice(0, startups.length, ...startups.filter(([esp, folder]) => !folders.some(([gone, name]) => gone === esp && name === folder)));
    },
    RemoveOldSystem: () => calls.push('RemoveOldSystem'),
    GrowSystem: () => {
      calls.push('GrowSystem');
      return 0;
    },
    GrowSystemAtStart: () => calls.push('GrowSystemAtStart'),
    CancelSystemResize: () => calls.push('CancelSystemResize'),
    MoveSystem: (drive: string, offset: number, size: number) => {
      calls.push(`MoveSystem ${drive}`);
      calls.push(`MoveSystem size ${size} at ${offset}`);
      moving(drive);
    },
    EraseAndMoveSystem: (drive: string) => {
      calls.push(`EraseAndMoveSystem ${drive}`);
      moving(drive);
    },
    CancelSystemMove: () => {
      calls.push('CancelSystemMove');
      disk.Move = '';
    },
    ForgetSystemMoveFailure: () => calls.push('ForgetSystemMoveFailure'),
    RemoveEarlierCopy: () => calls.push('RemoveEarlierCopy'),
  }, trust), '/com/lantharos/Trust1');
  const drives = drivesService(calls, model, LETTERS_RECOVERY_KEY);
  drives.attach(publish(DRIVES, drives.implementation, '/com/lantharos/Trust1'));

  publish(USB_PROTECTION, {
    Enabled: true,
    Guarding: false,
    Held: [],
    SetEnabled: (enabled: boolean) => calls.push(`SetEnabled ${enabled}`),
  }, '/com/lantharos/UsbProtection1');

  publish(FWUPD, {
    HostSecurityId: 'HSI:2 (v2.1.8)',
    GetHostSecurityAttrs: () => [
      attribute('Uefi.SecureBoot', 'UEFI Secure Boot', 1, SUCCESS),
      attribute('Tpm.Version20', 'TPM v2.0', 1, SUCCESS),
      attribute('Iommu', 'IOMMU Protection', 2, SUCCESS),
      attribute('PrebootDma', 'Pre-boot DMA Protection', 3, FIRMWARE_SETTING),
      attribute('IntelBootguard.Verified', 'Intel BootGuard Verified Boot', 3, CONTACT_MAKER),
      attribute('EncryptedRam', 'Encrypted RAM', 4, FIRMWARE_SETTING),
    ],
  }, '/');
}
