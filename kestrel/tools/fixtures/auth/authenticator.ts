import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {delay, error, fingerprintSteps, message, success, type Steps} from './fprintdPam.js';
import {listen, type Request} from './framing.js';

const [socketPath] = ARGV;
const PASSWORD = 'correct horse';
const KEY_PIN = '2468';
const CARD_PIN = '1357';
const FAILURE_DELAY = 400;

function passwordAllowed() {
  const reply = Gio.DBus.system.call_sync('com.lantharos.SignIn1', '/com/lantharos/SignIn1', 'com.lantharos.SignIn1', 'Ways',
    new GLib.Variant('(u)', [new Gio.Credentials().get_unix_user()]), null, Gio.DBusCallFlags.NONE, -1, null);
  return reply.deepUnpack<[string[]]>()[0].includes('password');
}

function pinSteps(conversation: [string, string, string?][]): Steps {
  let index = 0;
  return {
    start: async () => message(conversation[0][0], conversation[0][1]),
    async answer(request) {
      const [, , expected] = conversation[index];
      if (expected !== undefined && request.response !== expected) {
        await delay(FAILURE_DELAY);
        return error('Authentication failure', 'auth_error');
      }
      index += 1;
      return index < conversation.length ? message(conversation[index][0], conversation[index][1]) : success;
    },
    stop() {},
  };
}

function refused(): Steps {
  return {
    start: async () => message('error', 'Password sign-in is turned off'),
    async answer() {
      return error('Authentication failure', 'auth_error');
    },
    stop() {},
  };
}

function stepsFor(mode: string | undefined, username: string, closed: Promise<void>): Steps {
  switch (mode) {
  case 'fingerprint': return fingerprintSteps(username, closed);
  case 'security-key': return pinSteps([['secret', 'Security key PIN: ', KEY_PIN], ['info', 'Touch your security key']]);
  case 'smart-card': return pinSteps([['info', 'Insert your smart card'], ['secret', 'Smart card PIN: ', CARD_PIN]]);
  case 'lock-screen': return passwordAllowed() ? passwordSteps() : refused();
  default: return passwordSteps();
  }
}

function passwordSteps(): Steps {
  return {
    start: async () => message('secret', 'Password: '),
    async answer(request) {
      if (request.response === PASSWORD)
        return success;
      await delay(FAILURE_DELAY);
      return error('Authentication failure', 'auth_error');
    },
    stop() {},
  };
}

function conversation(closed: Promise<void>) {
  let steps: Steps | null = null;
  void closed.then(() => steps?.stop());
  return async (request: Request) => {
    switch (request.type) {
    case 'create_session':
      steps?.stop();
      if (request.username !== GLib.get_user_name())
        return error('Only the signed-in account can unlock this session');
      steps = stepsFor(request.mode, request.username, closed);
      return steps.start();
    case 'post_auth_message_response':
      return steps ? steps.answer(request) : error('no session under configuration');
    case 'cancel_session':
      steps?.stop();
      steps = null;
      return success;
    }
    return error('Unlocking only checks credentials');
  };
}

listen(socketPath, 'authenticator stand-in', conversation);
new GLib.MainLoop(null, false).run();
