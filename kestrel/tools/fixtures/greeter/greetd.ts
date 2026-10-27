import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {listen, type Request} from '../auth/framing.js';

const [socketPath, events] = ARGV;
const FAILURE_DELAY = 400;

interface Step {
  info?: string;
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
};
const UNKNOWN: Step[] = [{secret: 'Password: ', answer: null}];

let configuring: {user: string; steps: Step[]; index: number; accepted: boolean; ready: boolean} | null = null;

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

async function respond(request: Request) {
  switch (request.type) {
  case 'create_session':
    record({type: 'create_session', username: request.username});
    if (configuring)
      return error('a session is already being configured');
    configuring = {user: request.username!, steps: CONVERSATIONS[request.username!] ?? UNKNOWN, index: 0, accepted: true, ready: false};
    return message(configuring.steps[0]);
  case 'post_auth_message_response': {
    if (!configuring || configuring.ready)
      return error('no session under configuration');
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
    configuring = null;
    return {type: 'success'};
  }
  return error(`unknown request ${request.type}`);
}

listen(socketPath, 'greetd stand-in', () => respond);
new GLib.MainLoop(null, false).run();
