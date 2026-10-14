import GLib from 'gi://GLib';

const MANAGER = `<node><interface name="net.reactivated.Fprint.Manager">
  <method name="GetDevices"><arg type="ao" direction="out"/></method>
  <method name="GetDefaultDevice"><arg type="o" direction="out"/></method>
</interface></node>`;
const DEVICE = `<node><interface name="net.reactivated.Fprint.Device">
  <property name="scan-type" type="s" access="read"/>
  <property name="num-enroll-stages" type="i" access="read"/>
  <method name="Claim"><arg type="s" direction="in"/></method>
  <method name="Release"/>
  <method name="ListEnrolledFingers"><arg type="s" direction="in"/><arg type="as" direction="out"/></method>
  <method name="DeleteEnrolledFinger"><arg type="s" direction="in"/></method>
  <method name="EnrollStart"><arg type="s" direction="in"/></method>
  <method name="EnrollStop"/>
  <signal name="EnrollStatus"><arg type="s"/><arg type="b"/></signal>
</interface></node>`;

export const FINGERPRINT_NAME = 'net.reactivated.Fprint';

const DEVICE_PATH = '/net/reactivated/Fprint/Device/0';
const STAGES = 3;
const SCAN_INTERVAL = 400;

export function publishFingerprint(publish, calls) {
  const enrolled = [];
  let device = null;
  const status = (result, done) => device.emit_signal('EnrollStatus', new GLib.Variant('(sb)', [result, done]));
  publish(MANAGER, {GetDevices: () => [DEVICE_PATH], GetDefaultDevice: () => DEVICE_PATH}, '/net/reactivated/Fprint/Manager');
  device = publish(DEVICE, {
    'scan-type': 'press',
    'num-enroll-stages': STAGES,
    Claim: () => calls.push('fingerprint Claim'),
    Release: () => calls.push('fingerprint Release'),
    ListEnrolledFingers: () => enrolled,
    DeleteEnrolledFinger: finger => enrolled.splice(enrolled.indexOf(finger), 1),
    EnrollStart: finger => {
      calls.push(`fingerprint EnrollStart ${finger}`);
      let scans = 0;
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, SCAN_INTERVAL, () => {
        scans += 1;
        if (scans < STAGES) {
          status('enroll-stage-passed', false);
          return GLib.SOURCE_CONTINUE;
        }
        enrolled.push(finger);
        status('enroll-completed', true);
        return GLib.SOURCE_REMOVE;
      });
    },
    EnrollStop: () => calls.push('fingerprint EnrollStop'),
  }, DEVICE_PATH);
}
