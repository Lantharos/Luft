sessionconf = configuration_data()
sessionconf.set('bindir', bindir)
sessionconf.set('datadir', datadir)

configure_file(
  input: 'kestrel.desktop.in',
  output: 'kestrel.desktop',
  configuration: sessionconf,
  install_dir: datadir / 'wayland-sessions',
)

configure_file(
  input: 'kestrel-session.in',
  output: 'kestrel-session',
  configuration: sessionconf,
  install_dir: bindir,
  install_mode: 'rwxr-xr-x',
)

install_data('kestrel.session', install_dir: datadir / 'gnome-session' / 'sessions')
install_data('session.conf', install_dir: systemduserunitdir / 'gnome-session@kestrel.target.d')
