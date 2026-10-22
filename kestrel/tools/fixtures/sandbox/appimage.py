import os
import subprocess
import sys
import tempfile

RUNTIME = "/usr/bin/true"
APPIMAGE_TYPE_2 = b"AI\x02"


def app_run(electron, app):
    return f'#!/bin/sh\nexec "$APPDIR/{os.path.basename(electron)}/electron" "$APPDIR/{os.path.basename(app)}" "$@"\n'


def entry(app_id, name):
    return f"[Desktop Entry]\nType=Application\nName={name}\nExec=AppRun %U\nIcon={app_id}\n"


def build(output, app_id, name, electron, app):
    with tempfile.TemporaryDirectory() as root:
        run = os.path.join(root, "AppRun")
        desktop = os.path.join(root, f"{app_id}.desktop")
        payload = os.path.join(root, "payload")
        with open(run, "w") as file:
            file.write(app_run(electron, app))
        os.chmod(run, 0o755)
        with open(desktop, "w") as file:
            file.write(entry(app_id, name))
        subprocess.run(
            ["mksquashfs", run, desktop, electron, app, payload, "-quiet", "-no-progress", "-noappend", "-all-root", "-comp", "lz4"],
            check=True,
        )
        with open(RUNTIME, "rb") as file:
            runtime = bytearray(file.read())
        runtime[8:11] = APPIMAGE_TYPE_2
        with open(output, "wb") as out, open(payload, "rb") as squashed:
            out.write(runtime)
            out.write(squashed.read())
        os.chmod(output, 0o755)


if __name__ == "__main__":
    build(*sys.argv[1:6])
