import GLib from 'gi://GLib';

function absolutePath(filename: string): string {
  if (GLib.path_is_absolute(filename)) return filename;

  const videoDir = GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_VIDEOS) || GLib.get_home_dir();
  return GLib.build_filenamev([videoDir, filename]);
}

function expandEscape(c: string): string {
  switch (c) {
    case '%':
      return '%';
    case 'd':
      return GLib.DateTime.new_now_local().format('%Y-%m-%d')!;
    case 't':
      return GLib.DateTime.new_now_local().format('%H-%M-%S')!;
    default:
      console.warn(`Unknown escape ${c}`);
      return '';
  }
}

export function filePathStem(template: string): string {
  let filename = '';
  let escape = false;

  for (const c of template) {
    if (escape) {
      filename += expandEscape(c);
      escape = false;
    } else if (c === '%') {
      escape = true;
    } else {
      filename += c;
    }
  }

  if (escape) filename += '%';

  return absolutePath(filename);
}
