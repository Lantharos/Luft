dconf_defaults = files('defaults/desktop')

custom_target(
  'kestrel-dconf-defaults',
  input: dconf_defaults,
  output: 'kestrel',
  command: [find_program('dconf'), 'compile', '@OUTPUT@', meson.current_source_dir() / 'defaults'],
  install: true,
  install_dir: pkgdatadir / 'dconf',
)

fs.copyfile(dconf_defaults, 'defaults.ini', install: true, install_dir: pkgdatadir / 'dconf')
