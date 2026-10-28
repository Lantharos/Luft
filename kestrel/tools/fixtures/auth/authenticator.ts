import GLib from 'gi://GLib';

import {delay, error, fingerprintSteps, message, success, type Steps} from './fprintdPam.js';
import {listen, type Request} from './framing.js';

const [socketPath] = ARGV;
const PASSWORD = 'correct horse';
const FAILURE_DELAY = 400;

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
      steps = request.mode === 'fingerprint' ? fingerprintSteps(request.username, closed) : passwordSteps();
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
