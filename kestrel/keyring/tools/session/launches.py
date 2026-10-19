import os
import subprocess
import sys

from ownership import READER, launcher_entry, program_at

HERE = os.path.dirname(os.path.abspath(__file__))
INSIDE = "usr/bin/vault"


def exercise_launches(root, home, environment, check, script, requests):
    def asked():
        return len(requests("access"))

    def run(command, extra=None):
        env = dict(environment, **(extra or {}))
        return subprocess.run(command, env=env, capture_output=True, timeout=60, check=False).stdout.decode()

    image = program_at(os.path.join(root, "Applications/Vault.AppImage"))
    launcher_entry(home, "org.example.Vault", "Vault", image)

    def launched(*arguments):
        appimage = [image, os.path.join(HERE, "appimage.py"), root, INSIDE, sys.executable]
        return run([*appimage, READER, *arguments])

    launched("store", "Vault", "vault-key", "app", "vault")
    before = asked()
    check(
        launched("read", "app", "vault") == "vault-key" and asked() == before,
        "an AppImage reads what it stored though it runs from a new mount every launch",
    )
    script(access="allow", remember=True)
    check(launched("read", "service", "github.com") == "gh-token", "an AppImage is asked about another app's item")
    check(
        requests("access")[-1]["request"]["title"] == "Allow Vault to use “GitHub”?",
        "an AppImage is named after the launcher entry that starts it",
    )
    before = asked()
    check(
        launched("read", "service", "github.com") == "gh-token" and asked() == before,
        "an AppImage's remembered choice holds on its next launch",
    )

    script(access="deny", remember=False)
    posing = program_at(os.path.join(root, ".mount_Vaultposing", INSIDE))
    extra = {"APPDIR": os.path.join(root, ".mount_Vaultposing"), "APPIMAGE": image}
    before = asked()
    check(
        run([posing, READER, "read", "app", "vault"], extra) == "" and asked() > before,
        "a program that only claims to be an AppImage is asked first",
    )

    info = os.path.join(root, "flatpak-info")
    with open(info, "w") as file:
        file.write("[Application]\nname=org.example.Notebook\n")

    def sandboxed(*arguments):
        system = ["--ro-bind", "/usr", "/usr", "--ro-bind", "/etc", "/etc", "--proc", "/proc", "--dev", "/dev"]
        links = [part for name in ("bin", "lib", "lib64") for part in ("--symlink", f"usr/{name}", f"/{name}")]
        shared = ["--bind", "/tmp", "/tmp", "--ro-bind", HERE, HERE]
        sandbox = ["bwrap", *system, *links, *shared, "--ro-bind", info, "/.flatpak-info", "--"]
        return run([*sandbox, sys.executable, READER, *arguments])

    script(access="allow", remember=True)
    before = asked()
    check(
        sandboxed("read", "service", "github.com") == "gh-token" and asked() == before + 1,
        "a Flatpak is asked about another app's item",
    )
    check(
        sandboxed("read", "service", "github.com") == "gh-token" and asked() == before + 1,
        "a Flatpak's remembered choice holds on its next launch",
    )

    planted = subprocess.run(
        [
            program_at(os.path.join(root, "planter/planter")),
            READER,
            "store",
            "Planted",
            "planted",
            "app_id",
            "org.example.Notebook",
        ],
        env=environment,
        timeout=60,
        check=False,
    )
    own = sandboxed("portal").split("|")[0]
    check(
        planted.returncode == 0 and len(bytes.fromhex(own)) == 64 and own != b"planted".hex(),
        "another app's item naming a Flatpak isn't handed to that Flatpak as its portal secret",
    )
