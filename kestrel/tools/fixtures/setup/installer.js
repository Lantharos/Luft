import GLib from 'gi://GLib';

const INSTALLER = `<node><interface name="com.lantharos.Installer1">
  <property name="Phase" type="s" access="read"/>
  <property name="Stage" type="s" access="read"/>
  <property name="Progress" type="d" access="read"/>
  <property name="Error" type="s" access="read"/>
  <method name="Survey"><arg type="s" direction="out"/></method>
  <method name="Install"><arg type="s" direction="in"/></method>
  <method name="Configure"><arg type="s" direction="in"/></method>
  <method name="CreateAccount"><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/></method>
  <method name="FinishFirstBoot"/>
</interface></node>`;
const CONTROL = `<node><interface name="com.lantharos.KestrelChecks.Installer">
  <method name="SetPhase"><arg type="s" direction="in"/></method>
  <method name="SetStage"><arg type="s" direction="in"/><arg type="d" direction="in"/></method>
  <method name="Requests"><arg type="as" direction="out"/></method>
</interface></node>`;

export const INSTALLER_NAME = 'com.lantharos.Installer1';

const GB = 1e9;
const MIB = 1024 ** 2;

const SURVEY = {
  drives: [
    {
      block: '/org/freedesktop/UDisks2/block_devices/nvme0n1', device: '/dev/nvme0n1', name: 'Samsung SSD 980 PRO', size: 1000 * GB,
      kind: 'nvme', removable: false, blocked: null, partitions: 4, esp: {offset: MIB, size: 100 * MIB},
      windows: {
        block: '/org/freedesktop/UDisks2/block_devices/nvme0n1p3', offset: 129 * MIB, size: 998 * GB, used: 212 * GB,
        smallest: 233 * GB, room: 765 * GB, version: 'Windows 11 Home', fastStartup: true, blocked: null,
      },
      free: [],
    },
    {
      block: '/org/freedesktop/UDisks2/block_devices/sda', device: '/dev/sda', name: 'WD Blue SA510', size: 500 * GB,
      kind: 'ssd', removable: false, blocked: null, partitions: 1, esp: null, windows: null, free: [{offset: 400 * GB, size: 100 * GB}],
    },
    {
      block: '/org/freedesktop/UDisks2/block_devices/sdb', device: '/dev/sdb', name: 'SanDisk Ultra', size: 32 * GB,
      kind: 'usb', removable: true, blocked: 'running', partitions: 2, esp: null, windows: null, free: [],
    },
  ],
  hints: {timezone: 'Europe/Berlin', keyboard: {layout: 'de', variant: 'nodeadkeys'}, locale: 'de_DE'},
  firmwareLanguage: 'en-US',
  smallestSystem: 32 * 1024 ** 3,
};

export function publishInstaller(publish, calls) {
  const state = {Phase: 'live', Stage: 'idle', Progress: 0, Error: ''};
  const requests = [];
  let exported = null;
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
    Survey: () => JSON.stringify(SURVEY),
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
  }, '/com/lantharos/Installer1');
  publish(CONTROL, {
    SetPhase: phase => set({Phase: phase}),
    SetStage: (stage, progress) => set({Stage: stage, Progress: progress}),
    Requests: () => requests.splice(0),
  }, '/com/lantharos/KestrelChecks/Installer');
}
