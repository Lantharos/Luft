#!/usr/bin/env python3
import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / "run" / "gnome-shell-source"
LOCK = ROOT / "upstream.json"


def git(*args, capture=False):
    result = subprocess.run(["git", "-C", str(SOURCE), *args], check=True,
                            text=True, stdout=subprocess.PIPE if capture else None)
    return result.stdout.strip() if capture else None


def upstream():
    return json.loads(LOCK.read_text())


def fetch(spec, ref):
    if not (SOURCE / ".git").exists():
        SOURCE.mkdir(parents=True, exist_ok=True)
        git("init", "-q")
        git("remote", "add", "origin", spec["repository"])
    git("remote", "set-url", "origin", spec["repository"])
    git("fetch", "--quiet", "--filter=blob:none", "origin", ref)
    return git("rev-parse", "FETCH_HEAD", capture=True)


def carried(spec):
    upstream_paths = set(git("ls-tree", "-r", "--name-only", spec["revision"], "--", "src", capture=True).splitlines())
    engine_paths = {str(path.relative_to(ROOT)) for path in (ROOT / "src").rglob("*") if path.is_file()}
    return sorted(upstream_paths & engine_paths)


def changes(ref):
    spec = upstream()
    head = fetch(spec, ref)
    paths = carried(spec)
    commits = git("log", "--reverse", "--format=%H %s", f"{spec['revision']}..{head}", "--", *paths,
                  capture=True).splitlines()
    pending = [line for line in commits if line.split(" ", 1)[0] not in spec["picked"]]
    for line in pending:
        commit, subject = line.split(" ", 1)
        print(f"{commit[:12]} {subject}")
        touched = git("diff-tree", "--no-commit-id", "--name-only", "-r", commit, "--", *paths, capture=True)
        for path in touched.splitlines():
            print(f"    {path}")
    print(f"{len(pending)} upstream changes to {len(paths)} carried files since {spec['version']}")


def show(commit):
    git("show", "--format=email", commit, "--", *carried(upstream()))


def main():
    parser = argparse.ArgumentParser(description="Follow GNOME Shell changes to the files the engine carries")
    commands = parser.add_subparsers(dest="command", required=True)
    changes_parser = commands.add_parser("changes")
    changes_parser.add_argument("ref", nargs="?", default="main")
    show_parser = commands.add_parser("show")
    show_parser.add_argument("commit")
    args = parser.parse_args()
    if args.command == "changes":
        changes(args.ref)
    else:
        show(args.commit)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError) as error:
        raise SystemExit(str(error)) from error
