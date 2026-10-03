theme_deps = []

subdir('dbus-interfaces')
subdir('theme')

data_resources = [
  {'name': 'dbus-interfaces'},
  {'name': 'icons'},
  {'name': 'osk-layouts'},
  {'name': 'theme', 'deps': theme_deps}
]

install_subdir('sounds', install_dir: pkgdatadir)
subdir('fonts')
data_resources_targets = []
foreach resource : data_resources
  name = resource.get('name')
  deps = resource.get('deps', [])

  data_resources_targets += gnome.compile_resources(
    'kestrel-' + name,
    'kestrel-@0@.gresource.xml'.format(name),
    source_dir: name,
    dependencies: deps,
    gresource_bundle: true,
    install: true,
    install_dir: pkgdatadir
  )
endforeach

fs.copyfile('characters.json', install: true, install_dir: pkgdatadir)

cursor_theme_resource = gnome.compile_resources(
  'kestrel-cursor-theme',
  'kestrel-cursor-theme.gresource.xml',
  source_dir: 'cursor-theme')

keybinding_files = [
  '50-kestrel-accessibility.xml',
  '50-kestrel-hardware.xml',
  '50-kestrel-launchers.xml',
  '50-kestrel-screenshots.xml',
  '50-kestrel-sound-media.xml',
  '50-kestrel-system.xml',
]

install_data(keybinding_files, install_dir: keysdir)


schemaconf = configuration_data()
schemaconf.set('GETTEXT_PACKAGE', meson.project_name())
schemaconf.set('DASH_APPS', run_command(
  generate_app_list, 'default-apps/dash.txt',
  check: true,
).stdout())
configure_file(
  input: 'com.lantharos.kestrel.gschema.xml.in',
  output: 'com.lantharos.kestrel.gschema.xml',
  configuration: schemaconf,
  install_dir: schemadir
)
foreach name : ['diagnostics', 'media-keys', 'night-light', 'power', 'touchscreen']
  configure_file(
    input: 'com.lantharos.kestrel.@0@.gschema.xml'.format(name),
    output: 'com.lantharos.kestrel.@0@.gschema.xml'.format(name),
    copy: true,
    install_dir: schemadir,
  )
endforeach
install_data('00_com.lantharos.kestrel.gschema.override', install_dir: schemadir)

unitconf = configuration_data()
unitconf.set('bindir', bindir)
unitconf.set('schemadir', schemadir)
configure_file(
  input: 'kestrel.service.in',
  output: 'kestrel.service',
  configuration: unitconf,
  install_dir: systemduserunitdir
)
subdir('session')
subdir('system')
