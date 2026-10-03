src_builddir = meson.current_build_dir()

service_data = configuration_data()
service_data.set('libexecdir', libexecdir)

introspection_common = {
  'install_gir': false,
  'install_typelib': true,
  'install_dir_typelib': pkglibdir,
  'fatal_warnings': get_option('werror'),
}

install_rpath = ':'.join([mutter_dep.get_variable('libdir'), mutter_typelibdir, pkglibdir])

subdir('hotplug-sniffer')
subdir('st')
subdir('authenticate')
subdir('wallpaper')

typelib_cflags = [
  '-DMUTTER_TYPELIB_DIR="@0@"'.format(mutter_typelibdir),
  '-DSHELL_TYPELIB_DIR="@0@"'.format(pkglibdir),
]

kestrel_cflags = [
  '-DCLUTTER_ENABLE_EXPERIMENTAL_API',
  '-DCOGL_ENABLE_EXPERIMENTAL_API',
  '-DVERSION="@0@"'.format(meson.project_version()),
  '-DLOCALEDIR="@0@"'.format(localedir),
  '-DDATADIR="@0@"'.format(datadir),
  '-DKESTREL_LIBEXECDIR="@0@"'.format(libexecdir),
  '-DKESTREL_DATADIR="@0@"'.format(pkgdatadir),
  '-DKESTREL_PKGLIBDIR="@0@"'.format(pkglibdir)
]

kestrel_deps = [
  gio_unix_dep,
  libxml_dep,
  atk_bridge_dep,
  gdk_pixbuf_dep,
  gjs_dep,
  mtk_dep,
  clutter_dep,
  gi_dep,
  polkit_dep,
  libsystemd_dep,
  libpipewire_dep,
  pango_dep,
  fontconfig_dep,
  nm_deps,
]

if have_xwayland
  kestrel_deps += x11_dep
endif

libshell_menu_sources = [
  'gtkactionmuxer.h',
  'gtkactionmuxer.c',
  'gtkactionobservable.h',
  'gtkactionobservable.c',
  'gtkactionobserver.h',
  'gtkactionobserver.c'
]

libshell_menu = library('kestrel-menu',
  sources: libshell_menu_sources,
  dependencies: [gio_dep, clutter_dep, mtk_dep],
  include_directories: conf_inc,
  build_rpath: mutter_typelibdir,
  install_rpath: mutter_typelibdir,
  install_dir: pkglibdir,
  install: true
)

libshell_menu_dep = declare_dependency(link_with: libshell_menu)

libshell_public_headers = [
  'shell-app.h',
  'shell-app-system.h',
  'shell-blur-effect.h',
  'shell-camera-monitor.h',
  'shell-edge-drag-gesture.h',
  'shell-glyph-renderer.h',
  'shell-global.h',
  'shell-invert-lightness-effect.h',
  'shell-action-modes.h',
  'shell-mount-operation.h',
  'shell-network-agent.h',
  'shell-screenshot.h',
  'shell-stack.h',
  'shell-systemd.h',
  'shell-texture-file.h',
  'shell-time-change-source.h',
  'shell-util.h',
  'shell-window-tracker.h',
  'shell-wm.h',
  'shell-xkb-info.h',
]

libshell_private_headers = [
  'shell-app-private.h',
  'shell-app-cache-private.h',
  'shell-app-system-private.h',
  'shell-global-private.h',
  'shell-wm-private.h'
]

libshell_sources = [
  'kestrel-plugin.c',
  'shell-app.c',
  'shell-app-system.c',
  'shell-blur-effect.c',
  'shell-backdrop.c',
  'shell-camera-monitor.c',
  'shell-edge-drag-gesture.c',
  'shell-glyph-renderer.c',
  'shell-global.c',
  'shell-invert-lightness-effect.c',
  'shell-mount-operation.c',
  'shell-network-agent.c',
  'shell-polkit-authentication-agent.c',
  'shell-polkit-authentication-agent.h',
  'shell-screenshot.c',
  'shell-stack.c',
  'shell-systemd.c',
  'shell-texture-file.c',
  'shell-time-change-source.c',
  'shell-util.c',
  'shell-window-tracker.c',
  'shell-wm.c',
  'shell-xkb-info.c',
]

libshell_private_sources = [
  'shell-app-cache.c',
]

libshell_enums = gnome.mkenums_simple('shell-enum-types',
  sources: libshell_public_headers
)

libshell_gir_sources = [
  libshell_enums,
  libshell_public_headers,
  libshell_sources
]

libshell_no_gir_sources = [
  js_resources,
  libshell_private_headers,
  libshell_private_sources
]

dbus_generated = gnome.gdbus_codegen('org-gtk-application',
  'org.gtk.Application.xml',
  namespace: 'Shell'
)

dbus_generated += gnome.gdbus_codegen('switcheroo-control',
  '../data/dbus-interfaces/net.hadess.SwitcherooControl.xml',
  namespace: 'Shell'
)

libshell_no_gir_sources += dbus_generated

libshell = library('shell-' + mutter_api_version,
  sources: libshell_gir_sources + libshell_no_gir_sources,
  dependencies: kestrel_deps + [libshell_menu_dep, libst_dep, mutter_dep, xkbregistry_dep, m_dep, cairo_dep, fontconfig_dep, harfbuzz_dep, harfbuzz_raster_dep],
  include_directories: [conf_inc],
  c_args: kestrel_cflags,
  build_rpath: mutter_typelibdir,
  install_rpath: install_rpath,
  install_dir: pkglibdir,
  install: true
)

libshell_dep = declare_dependency(
  link_with: libshell,
  dependencies: [libst_dep, mutter_dep],
)

libshell_gir_includes = [
  'Clutter-@0@'.format(mutter_api_version),
  'Meta-@0@'.format(mutter_api_version),
  'GioUnix-2.0',
  'PolkitAgent-1.0',
  'GdkPixbuf-2.0',
  'NM-1.0',
  libgvc_gir[0],
  libst_gir[0]
]

libshell_gir = gnome.generate_gir(libshell,
  sources: libshell_gir_sources,
  nsversion: mutter_api_version,
  namespace: 'Shell',
  includes: libshell_gir_includes,
  extra_args: ['--quiet'],
  kwargs: introspection_common,
)

executable('kestrel', 'main.c',
  c_args: kestrel_cflags + typelib_cflags,
  dependencies: kestrel_deps + [libshell_dep, libst_dep, mutter_dep],
  include_directories: [conf_inc],
  build_rpath: mutter_typelibdir,
  install_rpath: install_rpath,
  install: true
)
