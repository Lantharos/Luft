bun = find_program('bun')

kestrel_ui_js = custom_target('kestrel-ui',
  input: files('../../../ui/src/kestrelUi.ts', '../../../ui/build.ts'),
  output: 'kestrelUi.js',
  depfile: 'kestrelUi.js.d',
  command: [bun, files('../../../ui/build.ts'), 'kestrelUi', '@OUTPUT@'],
)

kestrel_locales = custom_target('kestrel-locales',
  input: files('../../../ui/locales.ts'),
  output: ['locale-en.ftl', 'locale-de.ftl', 'locale-sq.ftl', 'locale-hr.ftl', 'locale-sr.ftl', 'locale-sr-Latn.ftl', 'locale-bs.ftl'],
  depfile: 'kestrel-locales.d',
  command: [bun, files('../../../ui/locales.ts'), '@OUTDIR@', '@DEPFILE@'],
)

custom_target('kestrel-session',
  input: files('../../../ui/src/session/main.ts', '../../../ui/build.ts'),
  output: 'kestrel-session.js',
  depfile: 'kestrel-session.js.d',
  command: [bun, files('../../../ui/build.ts'), 'session/main', '@OUTPUT@'],
  install: true,
  install_dir: pkgdatadir,
)
