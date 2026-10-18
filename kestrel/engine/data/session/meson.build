sessionconf = configuration_data()
sessionconf.set('bindir', bindir)
sessionconf.set('datadir', datadir)
sessionconf.set('pkgdatadir', pkgdatadir)

configure_file(
  input: 'kestrel.desktop.in',
  output: 'kestrel.desktop',
  configuration: sessionconf,
  install_dir: datadir / 'wayland-sessions',
)

configure_file(
  input: 'kestrel-greeter.in',
  output: 'kestrel-greeter',
  configuration: sessionconf,
  install_dir: bindir,
  install_mode: 'rwxr-xr-x',
)

configure_file(
  input: 'kestrel-session.in',
  output: 'kestrel-session',
  configuration: sessionconf,
  install_dir: bindir,
  install_mode: 'rwxr-xr-x',
)

managerconf = configuration_data()
managerconf.set('gjs', gjs.full_path())
managerconf.set('pkgdatadir', pkgdatadir)
configure_file(
  input: 'kestrel-session-manager.service.in',
  output: 'kestrel-session-manager.service',
  configuration: managerconf,
  install_dir: systemduserunitdir,
)

settingsconf = configuration_data()
settingsconf.set('libexecdir', libexecdir)
configure_file(
  input: 'kestrel-settings.service.in',
  output: 'kestrel-settings.service',
  configuration: settingsconf,
  install_dir: systemduserunitdir,
)

configure_file(
  input: 'kestrel-search.service.in',
  output: 'kestrel-search.service',
  configuration: settingsconf,
  install_dir: systemduserunitdir,
)

install_data('kestrel-session.target', 'kestrel-setup.target', install_dir: systemduserunitdir)
install_data('kestrel-portals.conf', install_dir: datadir / 'xdg-desktop-portal')
install_data('kestrel.portal', install_dir: datadir / 'xdg-desktop-portal' / 'portals')
install_data('org.freedesktop.impl.portal.desktop.kestrel.service', install_dir: servicedir)
foreach slice : ['app', 'background', 'user']
  install_data('slice-oomd.conf', install_dir: systemduserunitdir / slice + '.slice.d', rename: '50-kestrel-oomd.conf')
endforeach
install_data('root-slice.conf', install_dir: systemduserunitdir / '-.slice.d', rename: '50-kestrel-session.conf')
install_data('session-slice.conf', install_dir: systemduserunitdir / 'session.slice.d', rename: '50-kestrel-session.conf')
foreach service : ['dbus-broker', 'pipewire', 'pipewire-pulse', 'wireplumber', 'xdg-desktop-portal']
  install_data('session-service.conf', install_dir: systemduserunitdir / service + '.service.d', rename: '50-kestrel-session.conf')
endforeach
