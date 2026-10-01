import fcntl
import itertools
import os
import shutil
import subprocess
import sys
import termios

HERE = os.path.dirname(os.path.abspath(__file__))
READER = os.path.join(HERE, "reader.py")
scopes = itertools.count(1)


def program_at(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    shutil.copy(sys.executable, path)
    return path


def launcher_entry(home, desktop_id, name, command):
    folder = os.path.join(home, ".local/share/applications")
    os.makedirs(folder, exist_ok=True)
    with open(os.path.join(folder, f"{desktop_id}.desktop"), "w") as entry:
        entry.write(f"[Desktop Entry]\nType=Application\nName={name}\nExec=\"{command}\" %U\n")


def exercise_ownership(root, home, environment, check, script, requests, lock):
    def run(program, *arguments, scope=None, extra=None):
        command = [program, READER, *arguments]
        env = dict(environment, **(extra or {}))
        if scope:
            command = ["systemd-run", "--user", "--scope", "--quiet", f"--unit=app-{scope}-{os.getpid()}{next(scopes)}.scope", *command]
            env["XDG_RUNTIME_DIR"] = os.environ["XDG_RUNTIME_DIR"]
        return subprocess.run(command, env=env, capture_output=True, timeout=60).stdout.decode()

    def asked():
        return len(requests("access"))

    def secret_tool(*attributes):
        return subprocess.run(["secret-tool", "lookup", *attributes], env=environment, capture_output=True, timeout=60).stdout.decode()

    script(access="deny", remember=False)
    before = asked()
    check(secret_tool("application", "parley") == "" and asked() == before + 1,
          "a keyring tool is asked about an item that names another app instead of taking it")

    parley = os.path.join(root, "parley")
    first = program_at(os.path.join(parley, "app-1.0.159/Parley"))
    before = asked()
    check(run(first, "read", "application", "parley") == "parley-key" and asked() == before,
          "the app an imported item names takes it without being asked")
    script(access="allow", remember=True)
    check(run(first, "read", "service", "github.com") == "gh-token", "an app is allowed another app's item once")

    updated = program_at(os.path.join(parley, "app-1.0.160/Parley"))
    before = asked()
    check(run(updated, "read", "application", "parley") == "parley-key"
          and run(updated, "read", "service", "github.com") == "gh-token" and asked() == before,
          "an update that moves an app to a new folder keeps its items and choices")

    launcher_entry(home, "parley", "Parley", os.path.join(root, "bin/parley"))
    latest = program_at(os.path.join(parley, "app-1.0.161/Parley"))
    before = asked()
    check(run(latest, "read", "application", "parley") == "parley-key"
          and run(latest, "read", "service", "github.com") == "gh-token" and asked() == before,
          "an app found through its launcher entry quietly keeps what it had under its program path")

    launcher_entry(home, "luftnotes", "Notes", os.path.join(root, "bin/notes"))
    notes = program_at(os.path.join(root, "notes-a/notes"))
    moved = program_at(os.path.join(root, "notes-b/notes"))
    run(notes, "store", "Notes sync", "notes-token", "app", "notes", scope="luftnotes")
    before = asked()
    check(run(moved, "read", "app", "notes", scope="luftnotes") == "notes-token" and asked() == before,
          "an app launched from its entry keeps access when its program moves")
    script(access="deny", remember=False)
    check(run(moved, "read", "app", "notes") == "" and asked() > before,
          "the same program started outside its app is asked first")

    image = os.path.join(root, "Apps/Vault.AppImage")
    program_at(image)
    launcher_entry(home, "vault", "Vault", image)
    for mount in (".mount_a1B2c3", ".mount_x9Y8z7"):
        program_at(os.path.join(root, mount, "usr/bin/vault"))
    def from_image(mount, *arguments):
        folder = os.path.join(root, mount)
        return run(os.path.join(folder, "usr/bin/vault"), *arguments, extra={"APPDIR": folder, "APPIMAGE": image})
    from_image(".mount_a1B2c3", "store", "Vault", "vault-key", "app", "vault")
    before = asked()
    check(from_image(".mount_x9Y8z7", "read", "app", "vault") == "vault-key" and asked() == before,
          "an AppImage keeps its items though it runs from a new folder every time")

    terminal, child = os.openpty()
    def in_terminal():
        fcntl.ioctl(0, termios.TIOCSCTTY, 0)
    before = asked()
    typed = subprocess.run([sys.executable, READER, "read", "service", "mail.example.org"], env=environment, stdin=child,
                           stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, start_new_session=True, preexec_fn=in_terminal,
                           timeout=60)
    os.close(child)
    os.close(terminal)
    check(typed.stdout.decode() == "" and asked() > before, "a script run in a terminal is asked instead of taking an item")

    script(passwords=["correct horse"], access="allow", remember=True)
    subprocess.run(["secret-tool", "store", "--label", "Chromium Safe Storage", "application", "chromium"], input=b"browser-key",
                   env=environment, check=True)
    lock()
    secret_tool("network", "home")
    browser = program_at(os.path.join(root, "browser/browser"))
    open(os.path.join(root, "browser/chrome_100_percent.pak"), "w").close()
    before = asked()
    check(run(browser, "read", "application", "chromium") == "browser-key" and asked() == before,
          "an item a keyring tool took from the browser it names goes back when the keyring opens")
