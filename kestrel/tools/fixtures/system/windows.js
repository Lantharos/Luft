const WINDOWS = `<node><interface name="com.lantharos.Windows1">
  <method name="Status"><arg name="status" type="s" direction="out"/></method>
</interface></node>`;

const STATUS = {
  afterHibernation: false,
  installations: [{device: '/dev/nvme1n1p3', version: 'Windows 11 Pro', hibernated: false, mounted: false, fastStartup: false, universalClock: true, bluetooth: []}],
};

export const WINDOWS_NAME = 'com.lantharos.Windows1';

export function publishWindows(publish) {
  publish(WINDOWS, {Status: () => JSON.stringify(STATUS)}, '/com/lantharos/Windows1');
}
