import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const INSTALLER = `<node><interface name="com.lantharos.Installer1">
  <property name="Phase" type="s" access="read"/>
  <property name="Stage" type="s" access="read"/>
  <property name="Progress" type="d" access="read"/>
  <property name="Error" type="s" access="read"/>
  <property name="SecureBootCode" type="s" access="read"/>
  <method name="Survey"><arg type="s" direction="out"/></method>
  <method name="Install"><arg type="s" direction="in"/></method>
  <method name="Configure"><arg type="s" direction="in"/></method>
  <method name="CreateAccount"><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/></method>
  <method name="FinishFirstBoot"/>
  <method name="EnrollSigningKey"><arg type="s" direction="out"/></method>
  <method name="EnrollFingerprint"><arg type="s" direction="in"/></method>
  <method name="StopFingerprint"/>
  <signal name="FingerprintStatus"><arg type="s"/><arg type="b"/></signal>
</interface></node>`;
const CONTROL = `<node><interface name="com.lantharos.KestrelChecks.Installer">
  <method name="SetPhase"><arg type="s" direction="in"/></method>
  <method name="SetStage"><arg type="s" direction="in"/><arg type="d" direction="in"/></method>
  <method name="Requests"><arg type="as" direction="out"/></method>
  <method name="UseMeet"><arg type="b" direction="in"/></method>
</interface></node>`;

export const INSTALLER_NAME = 'com.lantharos.Installer1';
const TRUST = ['com.lantharos.Trust1', '/com/lantharos/Trust1', 'com.lantharos.Trust1'];
const FPRINT = 'net.reactivated.Fprint';
const FPRINT_DEVICE = 'net.reactivated.Fprint.Device';

const GB = 1e9;
const MIB = 1024 ** 2;
const GIB = 1024 ** 3;
const SECURE_BOOT_CODE = '48203917';

const SURVEY = {
  drives: [
    {
      block: '/org/freedesktop/UDisks2/block_devices/nvme0n1', device: '/dev/nvme0n1', name: 'Samsung SSD 980 PRO', size: 1000 * GB,
      kind: 'nvme', removable: false, blocked: null, partitions: 4, esp: {offset: MIB, size: 100 * MIB}, startupSpace: 2 * GIB,
      windows: {
        block: '/org/freedesktop/UDisks2/block_devices/nvme0n1p3', offset: 129 * MIB, size: 998 * GB, used: 212 * GB,
        smallest: 233 * GB, room: 765 * GB, version: 'Windows 11 Home', fastStartup: true, universalClock: false, bluetooth: 3, blocked: null,
      },
      free: [], meet: false,
    },
    {
      block: '/org/freedesktop/UDisks2/block_devices/sda', device: '/dev/sda', name: 'WD Blue SA510', size: 500 * GB,
      kind: 'ssd', removable: false, blocked: null, partitions: 1, esp: null, startupSpace: GIB, windows: null,
      free: [{offset: 400 * GB, size: 100 * GB}], meet: false,
    },
    {
      block: '/org/freedesktop/UDisks2/block_devices/sdb', device: '/dev/sdb', name: 'SanDisk Ultra', size: 32 * GB,
      kind: 'usb', removable: true, blocked: 'running', partitions: 2, esp: null, startupSpace: GIB, windows: null, free: [], meet: false,
    },
  ],
  hints: {language: 'en_US', locale: 'de_DE', timezone: 'Europe/Berlin', keyboards: [{layout: 'de', variant: 'nodeadkeys'}]},
  smallestSystem: 32 * 1024 ** 3,
  meet: null,
  systems: [],
};
const ROOM = {offset: 600 * GB, size: 398 * GB};
const FROM_MEET = {
  ...SURVEY,
  drives: SURVEY.drives.map(drive => drive.device === '/dev/nvme0n1'
    ? {...drive, meet: true, windows: {...drive.windows, size: 600 * GB - 129 * MIB, room: 0}, free: [ROOM]}
    : drive),
  hints: {
    language: 'en_US', locale: 'de_AT', timezone: 'Europe/Vienna',
    keyboards: [{layout: 'at', variant: 'nodeadkeys'}, {layout: 'us', variant: ''}],
  },
  meet: {drive: '/org/freedesktop/UDisks2/block_devices/nvme0n1', space: ROOM, otherDrive: false, intent: 'install', room: ROOM, movingBox: null},
};

function relay([name, path, iface], method, parameters = null) {
  return new Promise((resolve, reject) => Gio.DBus.system.call(name, path, iface, method, parameters, null, Gio.DBusCallFlags.NONE, -1, null,
    (bus, result) => {
      try {
        resolve(bus.call_finish(result));
      } catch (error) {
        reject(error);
      }
    }));
}

function answer(invocation, reply) {
  reply.then(value => invocation.return_value(value), error => invocation.return_gerror(error));
}

function relayFingerprints(emit) {
  let reader = null;
  let watch = 0;
  const device = () => [FPRINT, reader, FPRINT_DEVICE];
  const stop = async () => {
    if (!reader)
      return;
    Gio.DBus.system.signal_unsubscribe(watch);
    await relay(device(), 'EnrollStop').catch(() => null);
    await relay(device(), 'Release').catch(() => null);
    reader = null;
  };
  const start = async finger => {
    await stop();
    [reader] = (await relay([FPRINT, '/net/reactivated/Fprint/Manager', 'net.reactivated.Fprint.Manager'], 'GetDefaultDevice')).deepUnpack();
    watch = Gio.DBus.system.signal_subscribe(FPRINT, FPRINT_DEVICE, 'EnrollStatus', reader, null, Gio.DBusSignalFlags.NONE,
      (_bus, _sender, _path, _iface, _signal, status) => {
        emit(status);
        if (status.deepUnpack()[1])
          void stop();
      });
    await relay(device(), 'Claim', new GLib.Variant('(s)', ['']));
    await relay(device(), 'EnrollStart', new GLib.Variant('(s)', [finger]));
    return null;
  };
  return {start, stop: async () => {
    await stop();
    return null;
  }};
}

export function publishInstaller(publish, calls) {
  const state = {Phase: 'live', Stage: 'idle', Progress: 0, Error: '', SecureBootCode: ''};
  const requests = [];
  let survey = SURVEY;
  let exported = null;
  const fingerprints = relayFingerprints(status => exported.emit_signal('FingerprintStatus', status));
  const set = changes => {
    Object.assign(state, changes);
    for (const [name, value] of Object.entries(changes))
      exported.emit_property_changed(name, new GLib.Variant(name === 'Progress' ? 'd' : 's', value));
  };
  exported = publish(INSTALLER, {
    get Phase() {
      return state.Phase;
    },
    get Stage() {
      return state.Stage;
    },
    get Progress() {
      return state.Progress;
    },
    get Error() {
      return state.Error;
    },
    get SecureBootCode() {
      return state.SecureBootCode;
    },
    Survey: () => JSON.stringify(survey),
    Install: request => {
      requests.push(request);
      calls.push('installer Install');
      set({Stage: 'copying', Progress: 0.37});
    },
    Configure: regional => {
      requests.push(regional);
      calls.push('installer Configure');
    },
    CreateAccount: (name, fullName) => calls.push(`installer CreateAccount ${name} ${fullName}`),
    FinishFirstBoot: () => calls.push('installer FinishFirstBoot'),
    EnrollSigningKeyAsync: (_parameters, invocation) => answer(invocation, relay(TRUST, 'EnrollSigningKey')),
    EnrollFingerprintAsync: ([finger], invocation) => answer(invocation, fingerprints.start(finger)),
    StopFingerprintAsync: (_parameters, invocation) => answer(invocation, fingerprints.stop()),
  }, '/com/lantharos/Installer1');
  publish(CONTROL, {
    SetPhase: phase => set({Phase: phase}),
    SetStage: (stage, progress) => set({Stage: stage, Progress: progress, SecureBootCode: stage === 'finished' ? SECURE_BOOT_CODE : ''}),
    Requests: () => requests.splice(0),
    UseMeet: meet => {
      survey = meet ? FROM_MEET : SURVEY;
    },
  }, '/com/lantharos/KestrelChecks/Installer');
}
