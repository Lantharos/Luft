#!/usr/bin/env python3
import argparse
import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RUN = ROOT.parent / "run"
SOURCE = RUN / "mutter-source"
LOCK = ROOT / "upstream.json"
PATCHES = ROOT / "patches"
SERIES = ROOT / "series"
STATE = SOURCE / ".git" / "kestrel-series.json"


def git(*args, cwd=SOURCE, capture=False):
    result = subprocess.run(["git", "-C", str(cwd), *args], check=True,
                            text=True, stdout=subprocess.PIPE if capture else None)
    return result.stdout.strip() if capture else None


def upstream():
    return json.loads(LOCK.read_text())


def series():
    names = [line.strip() for line in SERIES.read_text().splitlines()
             if line.strip() and not line.startswith("#")]
    if len(names) != len(set(names)):
        raise RuntimeError("Duplicate patch in series")
    for name in names:
        if Path(name).name != name or not name.endswith(".patch"):
            raise RuntimeError(f"Invalid patch name: {name}")
    return names


def fingerprint():
    digest = hashlib.sha256(LOCK.read_bytes())
    for name in series():
        digest.update(name.encode())
        digest.update((PATCHES / name).read_bytes())
    return digest.hexdigest()


def ensure_clean():
    if git("status", "--porcelain", capture=True):
        raise RuntimeError("The source checkout has edits. Commit them and run patches.py export first.")
    if (SOURCE / ".git" / "rebase-apply").exists() or (SOURCE / ".git" / "rebase-merge").exists():
        raise RuntimeError("Finish or abort the Git am/rebase operation in the source checkout first.")


def write_state():
    STATE.write_text(json.dumps({"fingerprint": fingerprint(),
                                "head": git("rev-parse", "HEAD", capture=True)}, indent=2) + "\n")


def fetch_revision(revision):
    present = subprocess.run(["git", "-C", str(SOURCE), "cat-file", "-e", f"{revision}^{{commit}}"],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
    if not present:
        git("fetch", "--depth=1", "origin", revision)


def prepare():
    spec = upstream()
    if not (SOURCE / ".git").exists():
        SOURCE.mkdir(parents=True, exist_ok=True)
        if any(SOURCE.iterdir()):
            raise RuntimeError(f"Source directory is not an empty Git checkout: {SOURCE}")
        git("init", "-q")
        git("remote", "add", "origin", spec["repository"])
    else:
        ensure_clean()
    if STATE.exists():
        state = json.loads(STATE.read_text())
        if git("rev-parse", "HEAD", capture=True) != state["head"]:
            raise RuntimeError("The checkout has local commits. Export them before preparing a new series.")
        if state["fingerprint"] == fingerprint():
            print(f"Patch series is current: {SOURCE}")
            return
        git("update-ref", "refs/kestrel/previous", state["head"])
    elif subprocess.run(["git", "-C", str(SOURCE), "rev-parse", "--verify", "HEAD"],
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
        raise RuntimeError("Existing checkout has no series record. Use export to adopt its committed patch stack.")
    git("remote", "set-url", "origin", spec["repository"])
    fetch_revision(spec["revision"])
    git("checkout", "-B", "kestrel", spec["revision"])
    names = series()
    if names:
        git("-c", "commit.gpgsign=false", "-c", "user.name=Kestrel Patch Builder",
            "-c", "user.email=kestrel@localhost", "am", "--3way",
            *(str(PATCHES / name) for name in names))
    write_state()


def export(base, version):
    ensure_clean()
    spec = upstream()
    if bool(base) != bool(version):
        raise RuntimeError("An upstream change requires both --base and --version")
    revision = git("rev-parse", f"{base or spec['revision']}^{{commit}}", capture=True)
    git("merge-base", "--is-ancestor", revision, "HEAD")
    if git("rev-list", "--merges", f"{revision}..HEAD", capture=True):
        raise RuntimeError("Rebase the patch stack into a linear series before exporting")
    old_names = series() if SERIES.exists() else []
    with tempfile.TemporaryDirectory(prefix="kestrel-export-", dir=RUN) as staging:
        git("format-patch", "--no-signature", "--zero-commit", "--full-index",
            "--output-directory", staging, f"{revision}..HEAD")
        files = sorted(Path(staging).glob("*.patch"))
        names = [path.name for path in files]
        PATCHES.mkdir(exist_ok=True)
        for path in files:
            shutil.copyfile(path, PATCHES / path.name)
        for name in set(old_names) - set(names):
            (PATCHES / name).unlink()
        SERIES.write_text("".join(f"{name}\n" for name in names))
    if base:
        spec.update(revision=revision, version=version)
        LOCK.write_text(json.dumps(spec, indent=2) + "\n")
    write_state()
    print(f"Exported {len(names)} patches")


def check():
    spec = upstream()
    fetch_revision(spec["revision"])
    path = Path(tempfile.mkdtemp(prefix="kestrel-check-", dir=RUN))
    path.rmdir()
    git("worktree", "add", "--detach", str(path), spec["revision"])
    try:
        for name in series():
            git("apply", "--index", str(PATCHES / name), cwd=path)
        tree = git("write-tree", cwd=path, capture=True)
        print(f"Series applies cleanly; resulting tree: {tree}")
        if STATE.exists() and json.loads(STATE.read_text())["fingerprint"] == fingerprint():
            if tree != git("rev-parse", "HEAD^{tree}", capture=True):
                raise RuntimeError("Replayed series differs from the prepared checkout")
    finally:
        git("worktree", "remove", "--force", str(path))


def main():
    parser = argparse.ArgumentParser(description="Prepare, export, and verify Kestrel's Mutter patch series")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("prepare")
    commands.add_parser("check")
    commands.add_parser("status")
    exporter = commands.add_parser("export")
    exporter.add_argument("--base")
    exporter.add_argument("--version")
    args = parser.parse_args()
    RUN.mkdir(parents=True, exist_ok=True)
    if args.command == "prepare":
        prepare()
    elif args.command == "export":
        export(args.base, args.version)
    elif args.command == "check":
        check()
    else:
        print(json.dumps(upstream(), indent=2))
        git("status", "--short", "--branch")
        git("log", "--oneline", f"{upstream()['revision']}..HEAD")


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError) as error:
        raise SystemExit(str(error)) from error
