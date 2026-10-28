import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {listen, type Request} from '../auth/framing.js';
import {MAX_TRIES, openReader, type Reader} from '../auth/fprintdPam.js';

const [socketPath, events] = ARGV;
const FAILURE_DELAY = 400;

interface Step {
  info?: string;
  visible?: string;
  error?: string;
  secret?: string;
  answer?: string | null;
}

const CONVERSATIONS: Record<string, Step[]> = {
  [GLib.get_user_name()]: [{secret: 'Password: ', answer: 'hunter2'}],
  mara: [
    {info: 'Welcome back, Mara'},
    {secret: 'Password: ', answer: 'tulips'},
    {secret: 'Verification code: ', answer: '424242'},
  ],
  theo: [
    {error: 'Your password expires in 3 days'},
    {secret: 'Password: ', answer: 'meadow'},
  ],
  ines: [{secret: 'Password: ', answer: 'harbor'}],
};
const UNKNOWN: Step[] = [{secret: 'Password: ', answer: null}];
const METHOD_QUESTION = 'Sign in with (fingerprint/password): ';
const FINGERPRINT_QUESTION = 'Touch the fingerprint reader, or type password: ';
const ROUND = 400;

interface Configuring {
  user: string;
  steps: Step[];
  index: number;
  accepted: boolean;
  ready: boolean;
  chosen: boolean;
  reader: Reader | null;
  tries: number;
}

let configuring: Configuring | null = null;

function record(event: object) {
  const stream = Gio.File.new_for_path(events).append_to(Gio.FileCreateFlags.NONE, null);
  stream.write_all(new TextEncoder().encode(`${JSON.stringify(event)}\n`), null);
  stream.close(null);
}

function message(step: Step) {
  const [type, text] = Object.entries(step).find(([key]) => key !== 'answer')!;
  return {type: 'auth_message', auth_message_type: type, auth_message: text};
}

function error(description: string, type = 'error') {
  return {type: 'error', error_type: type, description};
}

async function choose(session: Configuring, method: string | undefined, closed: Promise<void>) {
  session.chosen = true;
  record({type: 'sign-in-method', username: session.user, method});
  session.reader = method === 'fingerprint' ? await openReader(session.user, closed) : null;
  return session.reader ? message({visible: FINGERPRINT_QUESTION}) : message(session.steps[0]);
}

function stopReading(session: Configuring) {
  session.reader?.stop();
  session.reader = null;
  return message(session.steps[0]);
}

async function waitForFinger(session: Configuring, answer: string | undefined) {
  if (answer === 'password') {
    record({type: 'sign-in-method', username: session.user, method: 'password'});
    return stopReading(session);
  }
  const result = await session.reader!.next(ROUND);
  if (result === 'verify-match') {
    session.reader!.stop();
    session.ready = true;
    return {type: 'success'};
  }
  if (result === 'verify-disconnected' || result === 'verify-unknown-error')
    return stopReading(session);
  if (result === 'verify-no-match') {
    if (--session.tries === 0)
      return stopReading(session);
    await session.reader!.verify();
  }
  return message({visible: FINGERPRINT_QUESTION});
}

async function respond(request: Request, closed: Promise<void>) {
  switch (request.type) {
  case 'create_session':
    record({type: 'create_session', username: request.username});
    if (configuring)
      return error('a session is already being configured');
    configuring = {user: request.username!, steps: CONVERSATIONS[request.username!] ?? UNKNOWN, index: 0, accepted: true, ready: false,
      chosen: false, reader: null, tries: MAX_TRIES};
    return message({visible: METHOD_QUESTION});
  case 'post_auth_message_response': {
    if (!configuring || configuring.ready)
      return error('no session under configuration');
    if (!configuring.chosen)
      return choose(configuring, request.response, closed);
    if (configuring.reader)
      return waitForFinger(configuring, request.response);
    const step = configuring.steps[configuring.index++];
    if ('answer' in step && request.response !== step.answer)
      configuring.accepted = false;
    if (configuring.index < configuring.steps.length)
      return message(configuring.steps[configuring.index]);
    if (!configuring.accepted) {
      record({type: 'authentication-failed', username: configuring.user});
      await new Promise<void>(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, FAILURE_DELAY, () => {
        resolve();
        return GLib.SOURCE_REMOVE;
      }));
      return error('Authentication failure', 'auth_error');
    }
    configuring.ready = true;
    return {type: 'success'};
  }
  case 'start_session':
    if (!configuring?.ready)
      return error('session is not ready');
    record({type: 'start_session', username: configuring.user, cmd: request.cmd, env: request.env});
    configuring = null;
    return {type: 'success'};
  case 'cancel_session':
    record({type: 'cancel_session'});
    configuring?.reader?.stop();
    configuring = null;
    return {type: 'success'};
  }
  return error(`unknown request ${request.type}`);
}

listen(socketPath, 'greetd stand-in', closed => request => respond(request, closed));
new GLib.MainLoop(null, false).run();
