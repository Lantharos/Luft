gstreamer_dep = dependency('gstreamer-1.0')
gmodule_dep = dependency('gmodule-2.0')

executable('kestrel-wallpaper',
  'cuda.c',
  'main.c',
  'player.c',
  'still.c',
  'surfaces.c',
  dependencies: [gtk_dep, gio_unix_dep, gmodule_dep, gstreamer_dep],
  install_dir: libexecdir,
  install: true,
)
