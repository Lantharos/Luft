import GLib from 'gi://GLib';

const TRUST = `<node><interface name="com.lantharos.Trust1">
  <property name="SecureBoot" type="s" access="read"/>
  <property name="Tpm" type="a{sv}" access="read"/>
  <property name="SigningKey" type="a{sv}" access="read"/>
  <property name="Startup" type="a{sv}" access="read"/>
  <property name="Disk" type="a{sv}" access="read"/>
  <method name="GenerateRecoveryKey"><arg name="key" type="s" direction="out"/></method>
  <method name="CheckEncryption"><arg name="checks" type="a(sbs)" direction="out"/></method>
  <method name="TurnOnEncryption">
    <arg name="recovery_key" type="s" direction="in"/><arg name="pin" type="s" direction="in"/><arg name="passphrase" type="s" direction="in"/>
  </method>
  <method name="TurnOffEncryption"><arg name="unlock" type="s" direction="in"/></method>
  <method name="SetUpTpmUnlock">
    <arg name="unlock" type="s" direction="in"/><arg name="pin" type="s" direction="in"/><arg name="recovery_key" type="s" direction="out"/>
  </method>
  <method name="RemoveTpmUnlock"><arg name="unlock" type="s" direction="in"/></method>
  <method name="ShowRecoveryKey"><arg name="key" type="s" direction="out"/></method>
  <method name="ReplaceRecoveryKey"><arg name="unlock" type="s" direction="in"/><arg name="key" type="s" direction="out"/></method>
  <method name="EnrollSigningKey"><arg name="code" type="s" direction="out"/></method>
  <method name="CancelSigningKeyEnrollment"/>
  <method name="InstallSignedStartup"/>
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

const RECOVERY_KEY = 'bfgdekjl-vtictulg-gcjginrv-hcddchdu-ihruiigb-bednnflv-hluincci-cdktjdrh';
const SUCCESS = 1 << 0;
const FIRMWARE_SETTING = 1 << 12;
const CONTACT_MAKER = 1 << 11;

const variants = (signature, values) => Object.fromEntries(Object.entries(values).map(([key, value]) =>
  [key, new GLib.Variant(signature[key], value)]));

const attribute = (id, summary, level, flags) => ({
  AppstreamId: new GLib.Variant('s', `org.fwupd.hsi.${id}`),
  Summary: new GLib.Variant('s', summary),
  HsiLevel: new GLib.Variant('u', level),
  Flags: new GLib.Variant('t', flags),
});

export const SECURITY_NAMES = ['com.lantharos.Trust1', 'com.lantharos.UsbProtection1', 'org.freedesktop.fwupd'];

export function publishSecurity(publish, calls) {
  publish(TRUST, {
    SecureBoot: 'on',
    Tpm: variants({Present: 'b', Version: 's', Usable: 'b', Reason: 's'}, {Present: true, Version: '2.0', Usable: true, Reason: ''}),
    SigningKey: variants({State: 's', Available: 'b', Reason: 's', Protection: 's', DriverKeyEnrolled: 'b'},
      {State: 'enrolled', Available: true, Reason: '', Protection: 'tpm', DriverKeyEnrolled: true}),
    Startup: variants({Installed: 'b', Measured: 'b', Available: 'b', Reason: 's'}, {Installed: true, Measured: true, Available: true, Reason: ''}),
    Disk: variants({Device: 's', Encrypted: 'b', State: 's', Progress: 'd', Remaining: 't', Unlock: 'as', RecoveryKeyStored: 'b', TpmRefused: 'b'},
      {Device: '/dev/nvme0n1p3', Encrypted: true, State: 'on', Progress: 0, Remaining: 0, Unlock: ['tpm', 'pin', 'recovery-key'],
        RecoveryKeyStored: true, TpmRefused: false}),
    GenerateRecoveryKey: () => RECOVERY_KEY,
    CheckEncryption: () => [['space', true, 'There’s enough free space to encrypt the disk.'], ['power', true, 'The computer is plugged in.']],
    TurnOnEncryption: () => calls.push('TurnOnEncryption'),
    TurnOffEncryption: () => calls.push('TurnOffEncryption'),
    SetUpTpmUnlock: () => {
      calls.push('SetUpTpmUnlock');
      return '';
    },
    RemoveTpmUnlock: () => calls.push('RemoveTpmUnlock'),
    ShowRecoveryKey: () => RECOVERY_KEY,
    ReplaceRecoveryKey: () => RECOVERY_KEY,
    EnrollSigningKey: () => '48203917',
    CancelSigningKeyEnrollment: () => calls.push('CancelSigningKeyEnrollment'),
    InstallSignedStartup: () => calls.push('InstallSignedStartup'),
  }, '/com/lantharos/Trust1');

  publish(USB_PROTECTION, {
    Enabled: true,
    Guarding: false,
    Held: [],
    SetEnabled: enabled => calls.push(`SetEnabled ${enabled}`),
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
