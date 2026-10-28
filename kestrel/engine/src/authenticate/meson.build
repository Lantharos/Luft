pam_dep = cc.find_library('pam')

executable('kestrel-authenticate',
  'main.c',
  'protocol.c',
  dependencies: [json_glib_dep, pam_dep],
  install_dir: libexecdir,
  install: true,
)

shared_module('pam_kestrel_sign_in',
  'pam_kestrel_sign_in.c',
  name_prefix: '',
  c_args: '-DKESTREL_AUTHENTICATE="@0@"'.format(libexecdir / 'kestrel-authenticate'),
  dependencies: pam_dep,
  install_dir: get_option('libdir') / 'security',
  install: true,
)
