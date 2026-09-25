bun = find_program('bun')

kestrel_ui_js = custom_target('kestrel-ui',
  input: files('../../../ui/src/kestrelUi.ts', '../../../ui/build.ts'),
  output: 'kestrelUi.js',
  depfile: 'kestrelUi.js.d',
  command: [bun, files('../../../ui/build.ts'), '@OUTPUT@'],
)
