import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {listen, type Request} from './framing.js';

const [socketPath] = ARGV;
const PASSWORD = 'correct horse';
const FAILURE_DELAY = 400;
const INSTRUCTION = 'Place your finger on the fingerprint reader';
const CONTROL_XML = `<node><interface name="com.lantharos.KestrelChecks.Authenticator">
  <method name="SetFingerprint"><arg type="b" name="enrolled" direction="in"/></method>
  <method name="Touch"><arg type="b" name="matched" direction="in"/></method>
</interface></node>`;

let enrolled = false;
let touched: ((matched: boolean) => void) | null = null;

const success = {type: 'success'};
const message = (type: string, text: string) => ({type: 'auth_message', auth_message_type: type, auth_message: text});
const error = (description: string, type = 'error') => ({type: 'error', error_type: type, description});
const delay = (milliseconds: number) => new Promise<void>(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
  resolve();
  return GLib.SOURCE_REMOVE;
}));

function passwordSteps() {
  return {
    start: () => message('secret', 'Password: '),
    async answer(request: Request) {
      if (request.response === PASSWORD)
        return success;
      await delay(FAILURE_DELAY);
      return error('Authentication failure', 'auth_error');
    },
  };
}

function fingerprintSteps() {
  let mismatched = false;
  return {
    start: () => enrolled ? message('info', INSTRUCTION) : message('error', 'No fingerprints enrolled'),
    async answer() {
      if (!enrolled)
        return error('Authentication service cannot retrieve authentication info', 'auth_error');
      if (mismatched) {
        mismatched = false;
        return message('info', INSTRUCTION);
      }
      const matched = await new Promise<boolean>(resolve => (touched = resolve));
      if (matched)
        return success;
      mismatched = true;
      return message('error', 'Failed to match fingerprint');
    },
  };
}

function conversation() {
  let steps: ReturnType<typeof passwordSteps> | null = null;
  return async (request: Request) => {
    switch (request.type) {
    case 'create_session':
      if (request.username !== GLib.get_user_name())
        return error('Only the signed-in account can unlock this session');
      steps = request.mode === 'fingerprint' ? fingerprintSteps() : passwordSteps();
      return steps.start();
    case 'post_auth_message_response':
      return steps ? steps.answer(request) : error('no session under configuration');
    case 'cancel_session':
      steps = null;
      return success;
    }
    return error('Unlocking only checks credentials');
  };
}

listen(socketPath, 'authenticator stand-in', conversation);

const control = Gio.DBusExportedObject.wrapJSObject(CONTROL_XML, {
  SetFingerprint(value: boolean) {
    enrolled = value;
  },
  Touch(matched: boolean) {
    touched?.(matched);
    touched = null;
  },
});
control.export(Gio.DBus.session, '/com/lantharos/KestrelChecks/Authenticator');
Gio.bus_own_name_on_connection(Gio.DBus.session, 'com.lantharos.KestrelChecks.Authenticator', Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
