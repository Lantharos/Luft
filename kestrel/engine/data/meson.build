data_builddir = meson.current_build_dir()

serviceconf = configuration_data()
serviceconf.set('libexecdir', libexecdir)
if have_portal_helper
  configure_file(
    input: 'org.gnome.Shell.PortalHelper.service.in',
    output: 'org.gnome.Shell.PortalHelper.service',
    configuration: serviceconf,
    install_dir: servicedir
  )
endif

theme_deps = []

subdir('dbus-interfaces')
subdir('icons')
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
    'gnome-shell-' + name,
    'gnome-shell-@0@.gresource.xml'.format(name),
    source_dir: name,
    dependencies: deps,
    gresource_bundle: true,
    install: true,
    install_dir: pkgdatadir
  )
endforeach

cursor_theme_resource = gnome.compile_resources(
  'gnome-shell-cursor-theme',
  'gnome-shell-cursor-theme.gresource.xml',
  source_dir: 'cursor-theme')

perfconf = configuration_data()
perfconf.set('datadir', datadir)
configure_file(
  input: 'perf-background.xml.in',
  output: 'perf-background.xml',
  configuration: perfconf,
  install_dir: pkgdatadir
)

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
schema = configure_file(
  input: 'com.lantharos.kestrel.gschema.xml.in',
  output: 'com.lantharos.kestrel.gschema.xml',
  configuration: schemaconf,
  install_dir: schemadir
)
settings_schemas = []
foreach name : ['media-keys', 'night-light', 'power', 'touchscreen']
  settings_schemas += configure_file(
    input: 'com.lantharos.kestrel.@0@.gschema.xml'.format(name),
    output: 'com.lantharos.kestrel.@0@.gschema.xml'.format(name),
    copy: true,
    install_dir: schemadir,
  )
endforeach
install_data('00_com.lantharos.kestrel.gschema.override', install_dir: schemadir)

if have_systemd
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
endif

# for unit tests - gnome.compile_schemas() only looks in srcdir
compiled_schemas = custom_target('compile-schemas',
  input: [schema, settings_schemas],
  output: 'gschemas.compiled',
  command: [find_program('glib-compile-schemas'), '--strict', data_builddir],
)
