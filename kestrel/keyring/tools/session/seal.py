import os

RUNTIME = f"/run/user/{os.getuid()}"

BEHIND_EMPTY_RUN = f"""
held=$(mktemp -d)
mount -n --rbind {RUNTIME} "$held"
mount -n -t tmpfs tmpfs /run
mkdir -p {RUNTIME} /run/kestrel
mount -n --move "$held" {RUNTIME}
rmdir "$held"
ln -s "$1" /run/kestrel/authenticate
shift
exec unshare --user --map-user={os.getuid()} --map-group={os.getgid()} -- "$@"
"""


def sealed(command, authenticator):
    return [
        "unshare",
        "--map-root-user",
        "--mount",
        "--",
        "sh",
        "-ec",
        BEHIND_EMPTY_RUN,
        "sealed",
        authenticator,
        *command,
    ]


def in_daemon_user_namespace(daemon):
    return ["nsenter", "--user", f"--target={daemon}", "--preserve-credentials", "--"]
