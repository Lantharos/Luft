import os
import subprocess
import sys
import tempfile

RUNTIME = "/usr/bin/true"
APPIMAGE_TYPE_2 = b"AI\x02"


def entry(app_id, name):
    return f"[Desktop Entry]\nType=Application\nName={name}\nExec=AppRun %U\nIcon={app_id}\n"


def write(path, text, mode=0o644):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as file:
        file.write(text)
    os.chmod(path, mode)


def pack(output, sources):
    with tempfile.TemporaryDirectory() as root:
        payload = os.path.join(root, "payload")
        subprocess.run(
            ["mksquashfs", *sources, payload, "-quiet", "-no-progress", "-noappend", "-all-root", "-comp", "lz4"],
            check=True,
        )
        with open(RUNTIME, "rb") as file:
            runtime = bytearray(file.read())
        runtime[8:11] = APPIMAGE_TYPE_2
        with open(output, "wb") as out, open(payload, "rb") as squashed:
            out.write(runtime)
            out.write(squashed.read())
        os.chmod(output, 0o755)


def build(output, app_id, name, electron, app):
    with tempfile.TemporaryDirectory() as root:
        run = os.path.join(root, "AppRun")
        desktop = os.path.join(root, f"{app_id}.desktop")
        launch = f'exec "$APPDIR/{os.path.basename(electron)}/electron" "$APPDIR/{os.path.basename(app)}" "$@"'
        write(run, f"#!/bin/sh\n{launch}\n", 0o755)
        write(desktop, entry(app_id, name))
        pack(output, [run, desktop, electron, app])


if __name__ == "__main__":
    build(*sys.argv[1:6])
