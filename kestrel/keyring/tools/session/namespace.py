import os
import shutil
import subprocess
import sys
import tempfile

STAGE = "LUFT_KEYRING_TEST_STAGE"
ROOT = "LUFT_KEYRING_TEST_ROOT"
ACCOUNT = "LUFT_KEYRING_TEST_ACCOUNT"
AUTHENTICATE = "/run/kestrel/authenticate"
PROGRAM = "/run/luft-keyring-test/luft-keyring"
KEYRING_GROUP = 1


def seal(authenticator):
    runtime = os.environ["XDG_RUNTIME_DIR"]
    held = tempfile.mkdtemp()
    subprocess.run(["mount", "--rbind", runtime, held], check=True)
    subprocess.run(["mount", "-t", "tmpfs", "tmpfs", "/run"], check=True)
    os.makedirs(runtime)
    os.makedirs(os.path.dirname(AUTHENTICATE))
    subprocess.run(["mount", "--move", held, runtime], check=True)
    os.rmdir(held)
    os.symlink(authenticator, AUTHENTICATE)


def install(daemon):
    os.makedirs(os.path.dirname(PROGRAM))
    shutil.copy(daemon, PROGRAM)
    os.chown(PROGRAM, 0, KEYRING_GROUP)
    os.chmod(PROGRAM, 0o2755)


def enter(daemon):
    stage = os.environ.get(STAGE)
    if stage == "inner":
        return os.environ[ROOT]
    if stage is None:
        os.environ[STAGE] = "outer"
        os.environ[ACCOUNT] = f"{os.getuid()}:{os.getgid()}"
        outer = ["unshare", "--user", "--map-root-user", "--map-auto", "--mount", "--"]
        os.execvp("unshare", [*outer, sys.executable, *sys.argv])
    root = tempfile.mkdtemp(prefix="luft-keyring-")
    seal(os.path.join(root, "authenticate"))
    install(daemon)
    uid, gid = os.environ[ACCOUNT].split(":")
    os.environ.update({STAGE: "inner", ROOT: root})
    inner = ["unshare", "--user", f"--map-users={uid}:0:1", f"--map-groups={gid}:0:1",
             f"--map-groups={KEYRING_GROUP}:{KEYRING_GROUP}:1", "--"]
    os.execvp("unshare", [*inner, "dbus-run-session", "--", sys.executable, *sys.argv])
