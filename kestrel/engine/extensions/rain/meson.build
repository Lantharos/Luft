rain_source = '../../../extensions/rain'
rain_dir = extensions_dir / 'com.lantharos.Rain'

custom_target('rain-extension',
  input: files(rain_source / 'src/extension.ts'),
  output: 'extension.js',
  depfile: 'extension.js.d',
  command: [bun, build_extension, '@INPUT@', '@OUTPUT@'],
  install: true,
  install_dir: rain_dir,
)

executable('rain-sound',
  files(rain_source / 'helper/clips.c', rain_source / 'helper/main.c', rain_source / 'helper/mix.c'),
  dependencies: [gio_dep, gstreamer_dep, libpipewire_dep, m_dep],
  install: true,
  install_dir: rain_dir,
)

install_data(rain_source / 'extension.toml', install_dir: rain_dir)
install_subdir(rain_source / 'locales', install_dir: rain_dir)
install_subdir(rain_source / 'sounds', install_dir: rain_dir)
