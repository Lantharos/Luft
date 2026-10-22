#!/usr/bin/env python3
"""Write launchers, desktop entries, D-Bus services and icons that start the Luft apps built in this tree."""

import shutil
import sys
import tomllib
from pathlib import Path


def values(items: list[str]) -> str:
    return ''.join(f'{item};' for item in items)


def launcher(path: Path, manifest: Path, binary: Path) -> Path:
    path.write_text(f'#!/bin/sh\nSABINE_MANIFEST_PATH="{manifest}" exec "{binary}" "$@"\n')
    path.chmod(0o755)
    return path


def entry(app: dict, start: Path) -> str:
    lines = [
        '[Desktop Entry]',
        'Type=Application',
        f"Name={app['name']}",
        f"GenericName={app['generic_name']}",
        f'Exec="{start}" %U',
        f"Icon={app['id']}",
        f"Categories={values(app['categories'])}",
        f"Keywords={values(app['keywords'])}",
        f"MimeType={values(app.get('mime_types', []))}",
        f"NoDisplay={str(not app.get('listed', True)).lower()}",
        'Terminal=false',
        'StartupNotify=true',
        f"StartupWMClass={app['id']}",
    ]
    return '\n'.join(lines) + '\n'


def bus_services(folder: Path, start: Path, services: Path) -> None:
    for service in sorted(folder.glob('data/dbus/*.service')):
        (services / service.name).write_text(service.read_text().replace(f'/usr/bin/{folder.name}', f'"{start}"'))


def main(root: Path, data: Path) -> None:
    applications = data / 'applications'
    icons = data / 'icons/hicolor/scalable/apps'
    launchers = data / 'bin'
    services = data / 'dbus-1/services'
    icons.mkdir(parents=True, exist_ok=True)
    launchers.mkdir(exist_ok=True)
    services.mkdir(parents=True, exist_ok=True)
    for manifest in sorted(root.glob('apps/*/Sabine.toml')):
        folder = manifest.parent
        binary = root / 'target/release' / folder.name
        if not binary.is_file():
            continue
        app = tomllib.loads(manifest.read_text())['app']
        start = launcher(launchers / folder.name, manifest, binary)
        (applications / f"{app['id']}.desktop").write_text(entry(app, start))
        bus_services(folder, start, services)
        shutil.copyfile(folder / app['icon'], icons / f"{app['id']}.svg")


if __name__ == '__main__':
    main(Path(sys.argv[1]), Path(sys.argv[2]))
