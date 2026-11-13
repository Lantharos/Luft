use std::io::Write;

use super::*;

fn tool(kind: &str) -> Tool {
    let index = serde_json::json!({
        "path": "index/v1/tools/alice/notes.json",
        "serial": 3,
        "expires": "2999-01-01T00:00:00.000Z",
        "version": 1,
        "generated": "2026-11-13T10:00:00.000Z",
        "name": "notes",
        "address": "alice/notes",
        "short": false,
        "project": { "id": "alice.notes", "address": "alice/notes", "part": null },
        "publisher": { "name": "Alice", "slug": "alice", "verified": false },
        "distribution": "open",
        "repository": "alice/notes",
        "releases": [{
            "version": "1.2.0",
            "channel": "stable",
            "published": "2026-11-13T10:00:00.000Z",
            "rollout": { "percent": 100, "paused": false },
            "files": [{
                "platform": TARGET,
                "kind": kind,
                "url": "https://dl.schelf.store/apps/alice.notes/1.2.0/notes",
                "size": 1,
                "sha256": "a".repeat(64),
                "attestation": null,
            }],
        }],
    });
    Tool {
        index: serde_json::from_value(index).unwrap(),
        channel: STABLE.to_owned(),
    }
}

#[test]
fn a_tools_program_lands_in_the_folder_by_its_name_ready_to_run() {
    let folder = tempfile::tempdir().unwrap();
    let download = folder.path().join("download");
    let mut file = fs::File::create(&download).unwrap();
    file.write_all(b"#!/bin/sh\necho notes\n").unwrap();
    let tool = tool("binary");
    let (release, file) = tool.index.release_for(STABLE, 0.5, TARGET).unwrap();
    let bin = folder.path().join("bin");
    let installed = place(&tool, release, file, &download, &bin).unwrap();
    assert_eq!(installed.path, bin.join("notes"));
    assert_eq!(installed.version, "1.2.0");
    let mode = fs::metadata(bin.join("notes"))
        .unwrap()
        .permissions()
        .mode();
    assert_eq!(mode & 0o777, 0o755);
    assert!(!bin.join(".notes.partial").exists());
}

#[test]
fn a_program_that_doesnt_unpack_leaves_the_old_one_where_it_was() {
    let folder = tempfile::tempdir().unwrap();
    let download = folder.path().join("download");
    fs::write(&download, b"not a tarball").unwrap();
    let bin = folder.path().join("bin");
    fs::create_dir_all(&bin).unwrap();
    fs::write(bin.join("notes"), b"old").unwrap();
    let tool = tool("tarball");
    let (release, file) = tool.index.release_for(STABLE, 0.5, TARGET).unwrap();
    assert!(place(&tool, release, file, &download, &bin).is_err());
    assert_eq!(fs::read(bin.join("notes")).unwrap(), b"old");
    assert!(!bin.join(".notes.partial").exists());
}
