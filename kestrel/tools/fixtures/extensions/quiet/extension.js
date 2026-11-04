const state = globalThis.quiet = { calls: 0, held: 0 };

export default function enable(api) {
  api.calls.onChanged(() => state.calls++);
  state.inCall = () => api.calls.active;
  state.hold = () => {
    state.current = api.doNotDisturb.hold();
    state.current.onHeld(() => state.held++);
  };
  state.heldNow = () => state.current.held;
  state.release = () => state.current.release();
  state.end = () => state.current.dispose();
  state.holding = () => api.doNotDisturb.holding;
  state.notify = title => api.notifications.send({ title });
  state.loop = () => api.sounds.play('chime.wav', { loop: true });
  state.keep = () => api.lockedSounds.keep();
  state.fetch = (url, options) => api.network.fetch(url, options);
  state.secrets = api.secrets;
}
