import os
import sys
import tempfile

from appimage import entry, pack, write


def build(output, app_id, name, sandbox):
    with tempfile.TemporaryDirectory() as root:
        write(os.path.join(root, "AppRun"), "#!/bin/sh\nexec \"$@\"\n", 0o755)
        write(os.path.join(root, f"{app_id}.desktop"), entry(app_id, name))
        manifest = f'[app]\nid = "{app_id}"\nname = "{name}"\nversion = "1.0.0"\n\n[sandbox]\n{sandbox}'
        write(os.path.join(root, "usr", "lib", "sabine", app_id, "resources", "Sabine.toml"), manifest)
        pack(output, [os.path.join(root, name) for name in os.listdir(root)])


if __name__ == "__main__":
    build(*sys.argv[1:5])
