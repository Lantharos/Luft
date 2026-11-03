globalThis.probeLoads = (globalThis.probeLoads ?? 0) + 1;

export default function enable(probe) {
  const state = globalThis.probe = { version: probe.version, ticks: 0, disabled: false };
  probe.taskbar.addItem({
    icon: 'face-smile-symbolic',
    label: probe.t('item'),
    onClick: () => probe.notifications.send({ title: probe.t('hello') }),
  });
  probe.quickSettings.addToggle({ title: probe.t('item'), icon: 'face-smile-symbolic', setting: 'on', menu: [{ setting: 'mood' }, 'settings'] });
  probe.search.addProvider({ title: probe.t('item'), search: query => [{ title: `Probe found ${query}`, activate() {} }] });
  probe.timers.interval(20, () => state.ticks++);
  probe.onDisable(() => (state.disabled = true));
}
