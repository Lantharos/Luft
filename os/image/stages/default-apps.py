#!/usr/bin/env python3
"""Write the default apps list that makes Luft's apps open everything they declare."""

import sys
import tomllib
from collections import defaultdict
from pathlib import Path

BROWSER = 'helium.desktop'
BROWSER_TYPES = ('x-scheme-handler/http', 'x-scheme-handler/https', 'text/html', 'application/xhtml+xml')


def handlers(apps: Path) -> dict[str, list[str]]:
    claimed = defaultdict(list)
    for manifest in sorted(apps.glob('*/Sabine.toml')):
        app = tomllib.loads(manifest.read_text())['app']
        for kind in app.get('mime_types', []):
            claimed[kind].append(f"{app['id']}.desktop")
    for kind in BROWSER_TYPES:
        claimed[kind].append(BROWSER)
    return claimed


def main(apps: Path, output: Path) -> None:
    lines = [f"{kind}={''.join(f'{app};' for app in claimants)}" for kind, claimants in sorted(handlers(apps).items())]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text('\n'.join(['[Default Applications]', *lines]) + '\n')


if __name__ == '__main__':
    main(Path(sys.argv[1]), Path(sys.argv[2]))
