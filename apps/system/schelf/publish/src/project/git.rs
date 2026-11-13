use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::LazyLock;

use regex::Regex;

static GITHUB_REMOTE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"github\.com[:/]([A-Za-z0-9-]+)/([A-Za-z0-9._-]+?)(?:\.git)?/?$").unwrap()
});

#[derive(Clone, Debug, PartialEq)]
pub struct Repository {
    pub owner: String,
    pub name: String,
}

impl Repository {
    pub fn full_name(&self) -> String {
        format!("{}/{}", self.owner, self.name)
    }
}

pub fn parse_remote(url: &str) -> Option<Repository> {
    let found = GITHUB_REMOTE.captures(url.trim())?;
    Some(Repository {
        owner: found[1].to_owned(),
        name: found[2].to_owned(),
    })
}

/// Runs git in `root` and gives what it printed, trimmed, when it succeeded.
pub fn git(root: &Path, arguments: &[&str]) -> Option<String> {
    let output = Command::new("git")
        .args(arguments)
        .current_dir(root)
        .output()
        .ok()?;
    output
        .status
        .success()
        .then(|| String::from_utf8_lossy(&output.stdout).trim().to_owned())
}

pub fn github_repository(root: &Path) -> Option<Repository> {
    let remotes = git(root, &["remote"]).unwrap_or_default();
    let names: Vec<&str> = remotes.lines().filter(|name| !name.is_empty()).collect();
    std::iter::once("origin")
        .chain(names.iter().copied().filter(|name| *name != "origin"))
        .filter(|remote| names.contains(remote))
        .find_map(|remote| parse_remote(&git(root, &["remote", "get-url", remote])?))
}

pub fn repository_root(folder: &Path) -> PathBuf {
    git(folder, &["rev-parse", "--show-toplevel"])
        .map(PathBuf::from)
        .unwrap_or_else(|| folder.to_path_buf())
}

pub fn default_branch(root: &Path) -> String {
    let head = git(
        root,
        &["symbolic-ref", "--short", "refs/remotes/origin/HEAD"],
    )
    .unwrap_or_else(|| "origin/main".to_owned());
    head.strip_prefix("origin/").unwrap_or(&head).to_owned()
}
