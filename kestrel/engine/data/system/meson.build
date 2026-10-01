systemconf = configuration_data()
systemconf.set('libexecdir', libexecdir)
configure_file(
  input: 'kestrel-authenticate@.service.in',
  output: 'kestrel-authenticate@.service',
  configuration: systemconf,
  install_dir: systemunitdir,
)

install_data('kestrel-authenticate.socket', install_dir: systemunitdir)
