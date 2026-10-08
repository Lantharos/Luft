import os
import sys

RUNTIME = f"/run/user/{os.getuid()}"

BEHIND_EMPTY_RUN = f"""
held=$(mktemp -d)
mount -n --rbind {RUNTIME} "$held"
mount -n -t tmpfs tmpfs /run
mkdir -p {RUNTIME}
mount -n --move "$held" {RUNTIME}
rmdir "$held"
exec unshare --user --map-user={os.getuid()} --map-group={os.getgid()} -- "$@"
"""


def seal_off_system_services():
    if os.listdir("/run") == ["user"]:
        return
    os.execvp(
        "unshare",
        [
            "unshare",
            "--map-root-user",
            "--mount",
            "--",
            "sh",
            "-ec",
            BEHIND_EMPTY_RUN,
            "sealed",
            sys.executable,
            *sys.argv,
        ],
    )
