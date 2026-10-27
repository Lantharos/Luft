bun = find_program('bun')
build_ts = files('../../ui/build.ts')
build_config = '{"PACKAGE_NAME": "@0@", "PACKAGE_VERSION": "@1@", "LIBEXECDIR": "@2@", "PKGDATADIR": "@3@", "LIBMUTTER_API_VERSION": "@4@"}'.format(
  meson.project_name(), meson.project_version(), libexecdir, pkgdatadir, mutter_api_version)

kestrel_js = custom_target('kestrel-js',
  input: files('../../ui/src/kestrel.ts'),
  output: 'kestrel.js',
  depfile: 'kestrel.js.d',
  command: [bun, build_ts, 'kestrel.ts', '@OUTPUT@', build_config],
)

kestrel_locales = custom_target('kestrel-locales',
  input: files('../../ui/locales.ts'),
  output: [
    'locale-en.ftl',
    'locale-bs.ftl',
    'locale-ca.ftl',
    'locale-cs.ftl',
    'locale-da.ftl',
    'locale-de.ftl',
    'locale-et.ftl',
    'locale-es.ftl',
    'locale-fr.ftl',
    'locale-ga.ftl',
    'locale-hr.ftl',
    'locale-is.ftl',
    'locale-it.ftl',
    'locale-lv.ftl',
    'locale-lt.ftl',
    'locale-hu.ftl',
    'locale-mt.ftl',
    'locale-nl.ftl',
    'locale-nb.ftl',
    'locale-nn.ftl',
    'locale-pl.ftl',
    'locale-pt-BR.ftl',
    'locale-pt.ftl',
    'locale-ro.ftl',
    'locale-sq.ftl',
    'locale-sk.ftl',
    'locale-sl.ftl',
    'locale-sr-Latn.ftl',
    'locale-fi.ftl',
    'locale-sv.ftl',
    'locale-tr.ftl',
    'locale-el.ftl',
    'locale-bg.ftl',
    'locale-mk.ftl',
    'locale-ru.ftl',
    'locale-sr.ftl',
    'locale-uk.ftl',
  ],
  depfile: 'kestrel-locales.d',
  command: [bun, files('../../ui/locales.ts'), '@OUTDIR@', '@DEPFILE@'],
)

js_resources = gnome.compile_resources(
  'js-resources', 'kestrel.gresource.xml',
  source_dir: meson.current_build_dir(),
  c_name: 'shell_js_resources',
  dependencies: [kestrel_js, kestrel_locales],
)

custom_target('kestrel-session',
  input: files('../../ui/src/session/main.ts'),
  output: 'kestrel-session.js',
  depfile: 'kestrel-session.js.d',
  command: [bun, build_ts, 'session/main.ts', '@OUTPUT@', build_config],
  install: true,
  install_dir: pkgdatadir,
)

dbus_services = {
  'com.lantharos.Kestrel.Notifications': 'surfaces/notifications/service/main.ts',
  'com.lantharos.Kestrel.Screencast': 'system/screencast/main.ts',
}

foreach service, entry : dbus_services
  custom_target(service,
    input: files('../../ui/src/' + entry),
    output: service,
    depfile: service + '.d',
    command: [bun, build_ts, entry, '@OUTPUT@', build_config],
    install: true,
    install_dir: pkgdatadir,
  )

  serviceconf = configuration_data()
  serviceconf.set('service', service)
  serviceconf.set('gjs', gjs.full_path())
  serviceconf.set('pkgdatadir', pkgdatadir)

  configure_file(
    input: 'dbus-service.service.in',
    output: service + '.service',
    configuration: serviceconf,
    install_dir: servicedir,
  )
endforeach
