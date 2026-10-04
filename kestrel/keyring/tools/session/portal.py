import itertools
import os
import subprocess

from ownership import READER, launcher_entry, program_at


def exercise_portal(root, home, environment, check):
    launches = itertools.count(1)

    def ask(program, scope):
        command = ["systemd-run", "--user", "--scope", "--quiet", f"--unit=app-{scope}-{os.getpid()}{next(launches)}.scope",
                   program, READER, "portal"]
        env = dict(environment, XDG_RUNTIME_DIR=os.environ["XDG_RUNTIME_DIR"])
        return subprocess.run(command, env=env, capture_output=True, timeout=60).stdout.decode().split("|")

    lumen = program_at(os.path.join(root, "lumen/lumen"))
    launcher_entry(home, "lumen", "Lumen", lumen)
    quill = program_at(os.path.join(root, "quill-a/QuillHost"))
    moved = program_at(os.path.join(root, "quill-b/QuillHost"))
    launcher_entry(home, "quill", "Quill", quill)

    own, claimed, unsent, unidentified = ask(lumen, "kestrel-lumen")
    check(len(bytes.fromhex(own)) == 64, "an app started by the desktop gets a secret through the portal")
    check(claimed == own, "an app gets its own secret whatever app ID the portal passes along")
    check(unsent == "AccessDenied", "only the desktop portal may ask for apps' secrets")
    check(unidentified == "AccessDenied", "a request from an app that can't be identified is refused")
    check(ask(lumen, "org.chromium.Chromium")[0] == own,
          "an app that moves itself into a scope of its own, as Chromium does, keeps its secret")
    other = ask(quill, "kestrel-quill")[0]
    check(len(bytes.fromhex(other)) == 64 and other != own, "another app gets a different secret")
    check(ask(moved, "kestrel-quill")[0] == other, "an app the desktop started keeps its secret when its program moves")
