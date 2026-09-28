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

settings_daemons = [
  ['a11y-settings', 'org.gnome.SettingsDaemon.A11ySettings', 'Accessibility settings', 'kestrel-session.target'],
  ['color', 'org.gnome.SettingsDaemon.Color', 'Display color and night light', 'kestrel-session.target'],
  ['datetime', 'org.gnome.SettingsDaemon.Datetime', 'Automatic time zone', 'kestrel-session.target'],
  ['housekeeping', 'org.gnome.SettingsDaemon.Housekeeping', 'Disk space and cache housekeeping', 'kestrel-session.target'],
  ['keyboard', 'org.gnome.SettingsDaemon.Keyboard', 'Keyboard settings', 'kestrel-session.target'],
  ['media-keys', 'org.gnome.SettingsDaemon.MediaKeys', 'Media and hardware keys', 'kestrel-session.target'],
  ['power', 'org.gnome.SettingsDaemon.Power', 'Power management', 'kestrel-session.target'],
  ['print-notifications', 'org.gnome.SettingsDaemon.PrintNotifications', 'Printer notifications', 'kestrel-session.target'],
  ['rfkill', 'org.gnome.SettingsDaemon.Rfkill', 'Airplane mode', 'kestrel-session.target'],
  ['screensaver-proxy', 'org.gnome.SettingsDaemon.ScreensaverProxy', 'Screen saver requests from apps', 'kestrel-session.target'],
  ['sound', 'org.gnome.SettingsDaemon.Sound', 'Sound theme', 'kestrel-session.target'],
  ['xsettings', 'org.gnome.SettingsDaemon.XSettings', 'Settings for X11 apps', 'kestrel-x11-services.target'],
]

session_services = []
x11_services = []
foreach daemon : settings_daemons
  binary = find_program('gsd-' + daemon[0], dirs: [get_option('prefix') / get_option('libexecdir'), '/usr/libexec'], required: false)
  if binary.found()
    unit = 'kestrel-settings-' + daemon[0] + '.service'
    unitconf = configuration_data()
    unitconf.set('binary', binary.full_path())
    unitconf.set('busname', daemon[1])
    unitconf.set('description', daemon[2])
    unitconf.set('target', daemon[3])
    configure_file(
      input: 'kestrel-settings.service.in',
      output: unit,
      configuration: unitconf,
      install_dir: systemduserunitdir,
    )
    if daemon[3] == 'kestrel-session.target'
      session_services += unit
    else
      x11_services += unit
    endif
  endif
endforeach

targetconf = configuration_data()
targetconf.set('services', ' '.join(session_services))
configure_file(
  input: 'kestrel-session.target.in',
  output: 'kestrel-session.target',
  configuration: targetconf,
  install_dir: systemduserunitdir,
)

x11conf = configuration_data()
x11conf.set('services', ' '.join(x11_services))
configure_file(
  input: 'kestrel-x11-services.target.in',
  output: 'kestrel-x11-services.target',
  configuration: x11conf,
  install_dir: systemduserunitdir,
)

install_data('kestrel-portals.conf', install_dir: datadir / 'xdg-desktop-portal')
install_data('app-slice-oomd.conf', install_dir: systemduserunitdir / 'app.slice.d', rename: '50-kestrel-oomd.conf')
