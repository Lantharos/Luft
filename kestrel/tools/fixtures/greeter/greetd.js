import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const [socketPath, events] = ARGV;
const FAILURE_DELAY = 400;
const LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

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

async function readExactly(input, size) {
  const data = new Uint8Array(size);
  for (let filled = 0; filled < size;) {
    const chunk = (await new Promise((resolve, reject) => input.read_bytes_async(size - filled, GLib.PRIORITY_DEFAULT, null,
      (stream, result) => {
        try {
          resolve(stream.read_bytes_finish(result));
        } catch (e) {
          reject(e);
        }
      }))).toArray();
    if (!chunk.length)
      return null;
    data.set(chunk, filled);
    filled += chunk.length;
  }
  return data;
}

async function serve(connection) {
  const input = connection.get_input_stream();
  const output = connection.get_output_stream();
  for (;;) {
    const header = await readExactly(input, 4);
    if (!header)
      return;
    const size = new DataView(header.buffer).getUint32(0, LITTLE_ENDIAN);
    const request = JSON.parse(new TextDecoder().decode(await readExactly(input, size)));
    const reply = new TextEncoder().encode(JSON.stringify(await respond(request)));
    const frame = new Uint8Array(4 + reply.length);
    new DataView(frame.buffer).setUint32(0, reply.length, LITTLE_ENDIAN);
    frame.set(reply, 4);
    output.write_all(frame, null);
  }
}

const service = new Gio.SocketService();
service.add_address(new Gio.UnixSocketAddress({path: socketPath}), Gio.SocketType.STREAM, Gio.SocketProtocol.DEFAULT, null);
service.connect('incoming', (_service, connection) => {
  serve(connection).catch(e => console.error(`greetd stand-in: ${e.message}`));
  return true;
});
service.start();
new GLib.MainLoop(null, false).run();
