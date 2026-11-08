const state = globalThis.fileActionsFixture = { chosen: [], opened: 0 };

export default function enable(api) {
  const chose = (key, paths, choice) => state.chosen.push({ key, paths, choice: choice ?? null });
  api.fileActions.add({
    key: 'words',
    label: 'Count words',
    icon: 'accessories-text-editor-symbolic',
    on: { kind: 'files', types: ['text/*'], extensions: ['md'] },
    onActivate: paths => chose('words', paths),
  });
  api.fileActions.add({
    key: 'tidy',
    label: 'Tidy up',
    icon: 'folder-symbolic',
    on: { kind: 'folders', multiple: false },
    onActivate: paths => chose('tidy', paths),
  });
  let found = [];
  const share = api.fileActions.add({
    key: 'share',
    label: 'Share with',
    icon: 'send-to-symbolic',
    items: () => [
      ...found.length ? found.map(name => ({ key: name, label: name, icon: 'phone-symbolic' })) : [{ key: 'nobody', label: 'Nobody here', disabled: true }],
      'separator',
      { key: 'again', label: 'Look again', icon: 'view-refresh-symbolic', keepsMenuOpen: true },
    ],
    onOpened: () => state.opened++,
    onActivate: (paths, choice) => {
      chose('share', paths, choice);
      if (choice !== 'again') return;
      found = ['Pixel 8'];
      share.refresh();
    },
  });
  state.hide = () => share.update({ shown: false });
}
