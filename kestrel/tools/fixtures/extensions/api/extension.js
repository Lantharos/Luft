const state = globalThis.api = {
  shortcuts: 0, typed: null, closed: 0, sliders: [], ended: 0, levels: null, stored: null, actions: [], layerFrames: 0,
};

const panel = (count, slider) => ({
  type: 'column',
  children: [
    { type: 'text', text: `Pressed ${count} times`, style: 'title' },
    { type: 'slider', label: 'Amount', value: slider, onChanged: value => state.sliders.push(value) },
    { type: 'row', children: [
      { type: 'button', label: 'Plain', onActivate: () => state.actions.push('plain') },
      { type: 'button', label: 'Go', style: 'primary', onActivate: () => state.actions.push('go') },
    ] },
    { type: 'switch', label: 'Loud', checked: false, onToggled: checked => state.actions.push(`loud ${checked}`) },
    { type: 'entry', label: 'Note', placeholder: 'Write a note', onSubmit: text => state.actions.push(`note ${text}`) },
    { type: 'item', title: 'Pick me', subtitle: 'A row', icon: 'face-smile-symbolic', checked: true, onActivate: () => state.actions.push('item') },
  ],
});

export default function enable(api) {
  let presses = 0;
  const item = api.taskbar.addItem({
    icon: 'face-smile-symbolic',
    label: api.t('item'),
    onClick: () => {
      state.popup = api.popups.open({ anchor: item, title: 'Api', content: panel(presses, 0.25), onClosed: () => state.closed++ });
    },
  });
  state.update = () => state.popup.update(panel(++presses, 0.75));
  state.openWindow = () => {
    state.window = api.popups.open({
      anchor: 'top-right', kind: 'window', title: 'Api window', width: 260,
      content: { type: 'column', children: [{ type: 'text', text: '12:00', style: 'number' }, { type: 'progress', value: 0.4 }] },
      onClosed: () => state.closed++,
    });
  };
  state.typeNow = text => api.typing.type(text);
  api.shortcuts.onActivated('type', () => {
    state.shortcuts++;
    state.typed = api.typing.type('hi from api');
  });
  state.label = () => api.shortcuts.label('type');
  state.play = () => api.sounds.play('chime.wav').onEnded(() => state.ended++);
  state.loop = () => api.sounds.play('chime.wav', { loop: true, fadeIn: 200 });
  state.listen = bands => (state.listener = api.audioLevels.listen(bands));
  state.playing = () => api.audioLevels.playing;
  state.store = value => api.storage.set('kept', value);
  state.kept = () => api.storage.get('kept');
  state.layer = api.wallpaper.addLayer({
    depth: 'below-windows',
    area: ({ width, height }) => ({ x: 0, y: height - 120, width, height: 120 }),
    shader: 'layer_color = vec4(0.0, 0.0, 0.0, 0.0);',
    frame: () => state.layerFrames++,
  });
  api.settingsPage.describe(() => [
    { title: 'Look', items: [{ setting: 'look' }, { type: 'preview', image: `${api.settings.get('look')}.svg`, description: 'The look' }] },
    { title: 'Kept', items: [
      { type: 'row', title: 'Stored', value: String(api.storage.get('kept') ?? 'nothing') },
      { type: 'switch', title: 'Remembered', checked: !!api.storage.get('kept'), onToggled: checked => api.storage.set('kept', checked) },
      { type: 'button', title: 'Forget', label: 'Forget', danger: true, onActivate: () => { api.storage.delete('kept'); api.settingsPage.refresh(); } },
    ] },
  ]);
}
