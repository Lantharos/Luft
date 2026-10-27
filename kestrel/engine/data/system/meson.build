systemconf = configuration_data()
systemconf.set('libexecdir', libexecdir)
configure_file(
  input: 'kestrel-authenticate@.service.in',
  output: 'kestrel-authenticate@.service',
  configuration: systemconf,
  install_dir: systemunitdir,
)

install_data('kestrel-authenticate.socket', install_dir: systemunitdir)
install_data('geoclue.conf', install_dir: get_option('sysconfdir') / 'geoclue' / 'conf.d', rename: '90-kestrel.conf')
install_data('50-kestrel-drives.rules', install_dir: datadir / 'polkit-1' / 'rules.d')
install_data('65-kestrel-internal-ext4.rules', install_dir: get_option('prefix') / 'lib' / 'udev' / 'rules.d')
