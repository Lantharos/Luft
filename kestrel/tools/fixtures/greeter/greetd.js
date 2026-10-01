import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {listen} from '../auth/framing.js';

const [socketPath, events] = ARGV;
const FAILURE_DELAY = 400;

const CONVERSATIONS = {
  kristof: [{secret: 'Password: ', answer: 'hunter2'}],
  ayesha: [
    {info: 'Welcome back, Ayesha'},
    {secret: 'Password: ', answer: 'tulips'},
    {secret: 'Verification code: ', answer: '424242'},
  ],
  sam: [
    {error: 'Your password expires in 3 days'},
    {secret: 'Password: ', answer: 'meadow'},
  ],
};
const UNKNOWN = [{secret: 'Password: ', answer: null}];

let configuring = null;

function record(event) {
  const stream = Gio.File.new_for_path(events).append_to(Gio.FileCreateFlags.NONE, null);
  stream.write_all(new TextEncoder().encode(`${JSON.stringify(event)}\n`), null);
  stream.close(null);
}

function message(step) {
  const [type, text] = Object.entries(step).find(([key]) => key !== 'answer');
  return {type: 'auth_message', auth_message_type: type, auth_message: text};
}

function error(description, type = 'error') {
  return {type: 'error', error_type: type, description};
}

async function respond(request) {
  switch (request.type) {
  case 'create_session':
    record({type: 'create_session', username: request.username});
    if (configuring)
      return error('a session is already being configured');
    configuring = {user: request.username, steps: CONVERSATIONS[request.username] ?? UNKNOWN, index: 0, accepted: true, ready: false};
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
      await new Promise(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, FAILURE_DELAY, () => resolve()));
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
