pam_dep = cc.find_library('pam')

executable('kestrel-authenticate',
  'main.c',
  'protocol.c',
  dependencies: [json_glib_dep, pam_dep],
  install_dir: libexecdir,
  install: true,
)
