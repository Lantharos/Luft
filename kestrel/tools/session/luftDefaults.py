#!/usr/bin/env python3
"""Write the settings Luft's image ships with as a dconf keyfile, with its wallpapers taken from this tree."""

import sys
from pathlib import Path

from gi.repository import Gio


def main(root: Path, keyfile: Path) -> None:
    schemas = Gio.SettingsSchemaSource.get_default()
    image = root / 'os/image/files/usr/share'
    lines = []
    for line in (image / 'glib-2.0/schemas/20_luft.gschema.override').read_text().splitlines():
        if line.startswith('['):
            line = f"[{schemas.lookup(line[1:-1], True).get_path().strip('/')}]"
        lines.append(line.replace('file:///usr/share/backgrounds/', (image / 'backgrounds').as_uri() + '/'))
    keyfile.parent.mkdir(parents=True, exist_ok=True)
    keyfile.write_text('\n'.join(lines) + '\n')


if __name__ == '__main__':
    main(Path(sys.argv[1]), Path(sys.argv[2]))
