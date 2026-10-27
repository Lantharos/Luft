#!/usr/bin/env python3
import argparse
import hashlib
import json
import re
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
STATUS_TRAILER = "Upstream-Status: "
STATUS_KINDS = ("upstream", "forwardable", "luft-only")
RELEASE_TAG = re.compile(r"(\d+)\.(alpha|beta|rc|\d+)(?:\.(\d+))?")
PRERELEASE_RANK = {"alpha": 0, "beta": 1, "rc": 2}
BUILDER = ("-c", "commit.gpgsign=false", "-c", "user.name=Kestrel Patch Builder",
           "-c", "user.email=kestrel@localhost")


def git(*args, cwd=SOURCE, capture=False):
    result = subprocess.run(["git", "-C", str(cwd), *args], check=True,
                            text=True, stdout=subprocess.PIPE if capture else None)
    return result.stdout.strip() if capture else None


def upstream():
    return json.loads(LOCK.read_text())


def upstream_status(path):
    header = path.read_text().split("\n---\n", 1)[0]
    values = [line.removeprefix(STATUS_TRAILER) for line in header.splitlines() if line.startswith(STATUS_TRAILER)]
    if len(values) != 1:
        raise RuntimeError(f"{path.name} needs exactly one {STATUS_TRAILER.rstrip(": ")} trailer")
    kind, _, detail = values[0].partition(" ")
    if kind not in STATUS_KINDS:
        raise RuntimeError(f"{path.name}: the status must be one of {', '.join(STATUS_KINDS)}")
    if kind == "upstream" and not detail.startswith("https://"):
        raise RuntimeError(f"{path.name}: an upstream status needs the merge request or commit URL")
    if kind == "luft-only" and not detail:
        raise RuntimeError(f"{path.name}: a luft-only status needs a reason")
    return kind, detail


def series():
    names = [line.strip() for line in SERIES.read_text().splitlines()
             if line.strip() and not line.startswith("#")]
    if len(names) != len(set(names)):
        raise RuntimeError("Duplicate patch in series")
    for name in names:
        if Path(name).name != name or not name.endswith(".patch"):
            raise RuntimeError(f"Invalid patch name: {name}")
        upstream_status(PATCHES / name)
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
                             check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
    if not present:
        git("fetch", "--depth=1", "origin", revision)


def init_source(spec):
    SOURCE.mkdir(parents=True, exist_ok=True)
    if any(SOURCE.iterdir()):
        raise RuntimeError(f"Source directory is not an empty Git checkout: {SOURCE}")
    git("init", "-q")
    git("remote", "add", "origin", spec["repository"])


def prepare():
    spec = upstream()
    if not (SOURCE / ".git").exists():
        init_source(spec)
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
                        check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
        raise RuntimeError("Existing checkout has no series record. Use export to adopt its committed patch stack.")
    git("remote", "set-url", "origin", spec["repository"])
    fetch_revision(spec["revision"])
    git("checkout", "-B", "kestrel", spec["revision"])
    names = series()
    if names:
        git(*BUILDER, "am", "--3way", *(str(PATCHES / name) for name in names))
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
        for path in files:
            upstream_status(path)
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
        if (STATE.exists() and json.loads(STATE.read_text())["fingerprint"] == fingerprint()
                and tree != git("rev-parse", "HEAD^{tree}", capture=True)):
            raise RuntimeError("Replayed series differs from the prepared checkout")
    finally:
        git("worktree", "remove", "--force", str(path))


def report():
    counts = dict.fromkeys(STATUS_KINDS, 0)
    for name in series():
        kind, detail = upstream_status(PATCHES / name)
        counts[kind] += 1
        print(f"{name[:4]}  {kind:<11}  {detail}".rstrip())
    print(", ".join(f"{count} {kind}" for kind, count in counts.items()))


def release_key(tag):
    major, stage, point = RELEASE_TAG.fullmatch(tag).groups()
    if stage in PRERELEASE_RANK:
        return int(major), PRERELEASE_RANK[stage], 0, int(point or 0)
    return int(major), len(PRERELEASE_RANK), int(stage), int(point or 0)


def latest_release():
    refs = git("ls-remote", "--tags", "--refs", "origin", capture=True).splitlines()
    tags = [ref.split("refs/tags/", 1)[1] for ref in refs]
    return max((tag for tag in tags if RELEASE_TAG.fullmatch(tag)), key=release_key)


def apply_patch(path, patch):
    if subprocess.run(["git", "-C", str(path), "apply", "--check", str(patch)],
                      check=False, stderr=subprocess.DEVNULL).returncode == 0:
        git(*BUILDER, "am", "--quiet", str(patch), cwd=path)
        return "applies"
    head = git("rev-parse", "HEAD", cwd=path, capture=True)
    merged = subprocess.run(["git", "-C", str(path), *BUILDER, "am", "--quiet", "--3way", str(patch)],
                            check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
    if merged:
        if git("rev-parse", "HEAD", cwd=path, capture=True) == head:
            return "already there"
        return "applies with a 3-way merge"
    git("am", "--abort", cwd=path)
    return "conflicts"


def trial(refs):
    spec = upstream()
    if not (SOURCE / ".git").exists():
        init_source(spec)
    fetch_revision(spec["revision"])
    names = series()
    path = Path(tempfile.mkdtemp(prefix="kestrel-trial-", dir=RUN))
    path.rmdir()
    git("worktree", "add", "--quiet", "--detach", str(path), spec["revision"])
    try:
        git(*BUILDER, "am", "--quiet", *(str(PATCHES / name) for name in names), cwd=path)
        for ref in refs:
            name = latest_release() if ref == "latest" else ref
            git("fetch", "--quiet", "--depth=1", "origin", name)
            revision = git("rev-parse", "FETCH_HEAD", capture=True)
            git("checkout", "--quiet", "--detach", revision, cwd=path)
            results = [(patch, upstream_status(PATCHES / patch)[0], apply_patch(path, PATCHES / patch))
                       for patch in names]
            conflicts = sum(result == "conflicts" for _, _, result in results)
            print(f"## Mutter {name} ({revision[:12]})\n")
            print(f"{len(names) - conflicts} of {len(names)} patches apply.\n")
            print("| Patch | Status | Result |\n| --- | --- | --- |")
            for patch, kind, result in results:
                print(f"| {patch.removesuffix('.patch')} | {kind} | {result} |")
            print()
    finally:
        git("worktree", "remove", "--force", str(path))


def main():
    parser = argparse.ArgumentParser(description="Prepare, export, verify and trial Kestrel's Mutter patch series")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("prepare")
    commands.add_parser("check")
    commands.add_parser("status")
    commands.add_parser("list")
    trier = commands.add_parser("trial")
    trier.add_argument("refs", nargs="+", metavar="ref")
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
    elif args.command == "list":
        report()
    elif args.command == "trial":
        trial(args.refs)
    else:
        print(json.dumps(upstream(), indent=2))
        git("status", "--short", "--branch")
        git("log", "--oneline", f"{upstream()['revision']}..HEAD")


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError) as error:
        raise SystemExit(str(error)) from error
