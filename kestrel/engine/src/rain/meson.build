executable('kestrel-rain',
  'clips.c',
  'main.c',
  'mix.c',
  c_args: ['-DKESTREL_DATADIR="@0@"'.format(pkgdatadir)],
  dependencies: [gio_dep, gstreamer_dep, libpipewire_dep, m_dep],
  install_dir: libexecdir,
  install: true,
)
