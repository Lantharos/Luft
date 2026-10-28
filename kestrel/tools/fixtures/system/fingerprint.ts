import type Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {Publish} from './bus.js';

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
  <method name="VerifyStart"><arg type="s" direction="in"/></method>
  <method name="VerifyStop"/>
  <signal name="EnrollStatus"><arg type="s"/><arg type="b"/></signal>
  <signal name="VerifyFingerSelected"><arg type="s"/></signal>
  <signal name="VerifyStatus"><arg type="s"/><arg type="b"/></signal>
</interface></node>`;
const CONTROL = `<node><interface name="com.lantharos.KestrelChecks.Fingerprint">
  <method name="Enroll"><arg type="s" name="user" direction="in"/><arg type="as" name="fingers" direction="in"/></method>
  <method name="Scan"><arg type="s" name="result" direction="in"/><arg type="b" name="delivered" direction="out"/></method>
</interface></node>`;

export const FINGERPRINT_NAME = 'net.reactivated.Fprint';

const DEVICE_PATH = '/net/reactivated/Fprint/Device/0';
const STAGES = 3;
const SCAN_INTERVAL = 400;
const SAVED_BY_WINDOWS = ['right-index-finger'];
const RETRIES = ['verify-retry-scan', 'verify-swipe-too-short', 'verify-finger-not-centered', 'verify-remove-and-retry'];

export function publishFingerprint(publish: Publish, calls: string[]) {
  const enrolled = new Map<string, string[]>();
  let claimant = GLib.get_user_name();
  let verifying = false;
  const fingersOf = (user: string) => {
    const name = user || claimant;
    if (!enrolled.has(name))
      enrolled.set(name, []);
    return enrolled.get(name)!;
  };
  let device: Gio.DBusExportedObject | null = null;
  const status = (signal: string, result: string, done: boolean) => device!.emit_signal(signal, new GLib.Variant('(sb)', [result, done]));
  publish(MANAGER, {GetDevices: () => [DEVICE_PATH], GetDefaultDevice: () => DEVICE_PATH}, '/net/reactivated/Fprint/Manager');
  device = publish(DEVICE, {
    'scan-type': 'press',
    'num-enroll-stages': STAGES,
    Claim: (user: string) => {
      claimant = user || GLib.get_user_name();
      calls.push('fingerprint Claim');
    },
    Release: () => {
      verifying = false;
      calls.push('fingerprint Release');
    },
    ListEnrolledFingers: (user: string) => fingersOf(user),
    DeleteEnrolledFinger: (finger: string) => fingersOf('').splice(fingersOf('').indexOf(finger), 1),
    EnrollStart: (finger: string) => {
      calls.push(`fingerprint EnrollStart ${finger}`);
      let scans = 0;
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, SCAN_INTERVAL, () => {
        scans += 1;
        if (SAVED_BY_WINDOWS.includes(finger)) {
          status('EnrollStatus', 'enroll-duplicate', true);
          return GLib.SOURCE_REMOVE;
        }
        if (scans < STAGES) {
          status('EnrollStatus', 'enroll-stage-passed', false);
          return GLib.SOURCE_CONTINUE;
        }
        fingersOf('').push(finger);
        status('EnrollStatus', 'enroll-completed', true);
        return GLib.SOURCE_REMOVE;
      });
    },
    EnrollStop: () => calls.push('fingerprint EnrollStop'),
    VerifyStart: () => {
      verifying = true;
      device!.emit_signal('VerifyFingerSelected', new GLib.Variant('(s)', ['any']));
    },
    VerifyStop: () => (verifying = false),
  }, DEVICE_PATH);
  publish(CONTROL, {
    Enroll: (user: string, fingers: string[]) => {
      enrolled.set(user, fingers);
    },
    Scan: (result: string) => {
      if (!verifying)
        return false;
      const done = !RETRIES.includes(result);
      verifying = !done;
      status('VerifyStatus', result, done);
      return true;
    },
  }, '/com/lantharos/KestrelChecks/Fingerprint');
}
