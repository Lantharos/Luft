bun = find_program('bun')

kestrel_ui_js = custom_target('kestrel-ui',
  input: files('../../../ui/src/kestrelUi.ts', '../../../ui/build.ts'),
  output: 'kestrelUi.js',
  depfile: 'kestrelUi.js.d',
  command: [bun, files('../../../ui/build.ts'), 'kestrelUi', '@OUTPUT@'],
)

custom_target('kestrel-session',
  input: files('../../../ui/src/session/main.ts', '../../../ui/build.ts'),
  output: 'kestrel-session.js',
  depfile: 'kestrel-session.js.d',
  command: [bun, files('../../../ui/build.ts'), 'session/main', '@OUTPUT@'],
  install: true,
  install_dir: pkgdatadir,
)
