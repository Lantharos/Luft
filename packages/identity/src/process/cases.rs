use std::fs::{self, File};
use std::os::fd::OwnedFd;
use std::os::unix::fs::symlink;
use std::path::Path;

use glib::{KeyFile, KeyFileFlags};

use super::{Sandbox, read_sandbox};

const CASES: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/sandbox-cases.ini");

fn process_folder(cases: &KeyFile, case: &str, folder: &Path) -> OwnedFd {
    let root = folder.join("root");
    if cases.boolean(case, "hidden").unwrap_or(false) {
        fs::write(&root, "").unwrap();
    } else {
        fs::create_dir(&root).unwrap();
    }
    let info = root.join(".flatpak-info");
    if cases.boolean(case, "info-link").unwrap_or(false) {
        symlink("/proc/self/root/.flatpak-info", &info).unwrap();
    } else if let Ok(contents) = cases.string(case, "info") {
        fs::write(&info, contents.as_str()).unwrap();
    }
    if let Ok(mounts) = cases.string(case, "mountinfo") {
        fs::write(folder.join("mountinfo"), mounts.as_str()).unwrap();
    }
    File::open(folder).unwrap().into()
}

fn expected(cases: &KeyFile, case: &str) -> String {
    match cases.string(case, "expect").unwrap().as_str() {
        "app" => format!("app {}", cases.string(case, "app").unwrap()),
        verdict => verdict.to_owned(),
    }
}

fn verdict(sandbox: Sandbox) -> String {
    match sandbox {
        Sandbox::None => "you".into(),
        Sandbox::App(id) => format!("app {id}"),
        Sandbox::Unreadable => "unknown".into(),
    }
}

#[test]
fn processes_are_judged_as_the_shared_cases_say() {
    let cases = KeyFile::new();
    cases.load_from_file(CASES, KeyFileFlags::NONE).unwrap();
    let mut wrong = Vec::new();
    for case in cases.groups() {
        let folder = tempfile::tempdir().unwrap();
        let judged = verdict(read_sandbox(&process_folder(&cases, &case, folder.path())));
        let expected = expected(&cases, &case);
        if judged != expected {
            wrong.push(format!("{case}: {judged}, expected {expected}"));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}
