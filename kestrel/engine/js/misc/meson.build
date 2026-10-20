jsconf = configuration_data()
jsconf.set('PACKAGE_NAME', meson.project_name())
jsconf.set('PACKAGE_VERSION', meson.project_version())
jsconf.set('LIBMUTTER_API_VERSION', mutter_api_version)
jsconf.set('datadir', datadir)
jsconf.set('libexecdir', libexecdir)

config_js = configure_file(
  input: 'config.js.in',
  output: 'config.js',
  configuration: jsconf
)
