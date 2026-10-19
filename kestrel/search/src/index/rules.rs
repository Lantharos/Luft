use std::path::Path;
use std::sync::Arc;

use ignore::gitignore::{Gitignore, GitignoreBuilder};

use super::stat::stat;

const SKIPPED_FOLDERS: [&str; 3] = ["node_modules", "__pycache__", "lost+found"];
pub const CACHE_TAG: &str = "CACHEDIR.TAG";
pub const REPOSITORY: &str = ".git";
const GIT_IGNORE: &str = ".gitignore";
const IGNORE: &str = ".ignore";

pub fn is_hidden(name: &str) -> bool {
    name.starts_with('.')
}

pub fn shapes_rules(name: &str) -> bool {
    [REPOSITORY, GIT_IGNORE, IGNORE].contains(&name)
}

pub fn is_skipped_folder(name: &str) -> bool {
    SKIPPED_FOLDERS.contains(&name)
}

#[derive(Clone)]
pub struct IgnoreFile {
    pub modified: i64,
    pub rules: Arc<Gitignore>,
}

fn ignore_files(in_repository: bool) -> &'static [&'static str] {
    if in_repository {
        &[GIT_IGNORE, IGNORE]
    } else {
        &[IGNORE]
    }
}

pub fn ignore_file_modified(dir: &Path, in_repository: bool) -> i64 {
    ignore_files(in_repository)
        .iter()
        .filter_map(|name| stat(&dir.join(name)))
        .map(|file| file.modified)
        .max()
        .unwrap_or(0)
}

pub fn load_ignore_file(dir: &Path, in_repository: bool) -> Option<IgnoreFile> {
    let modified = ignore_file_modified(dir, in_repository);
    if modified == 0 {
        return None;
    }
    let mut builder = GitignoreBuilder::new(dir);
    for name in ignore_files(in_repository) {
        let path = dir.join(name);
        if path.exists() {
            builder.add(path);
        }
    }
    let rules = builder.build().ok()?;
    Some(IgnoreFile {
        modified,
        rules: Arc::new(rules),
    })
}

#[derive(Default)]
pub struct Rules {
    stack: Vec<Arc<Gitignore>>,
}

impl Rules {
    pub fn push(&mut self, rules: Option<&IgnoreFile>) -> bool {
        let Some(file) = rules else { return false };
        self.stack.push(file.rules.clone());
        true
    }

    pub fn pop(&mut self, pushed: bool) {
        if pushed {
            self.stack.pop();
        }
    }

    pub fn ignores(&self, path: &Path, is_dir: bool) -> bool {
        for rules in self.stack.iter().rev() {
            let matched = rules.matched(path, is_dir);
            if matched.is_ignore() {
                return true;
            }
            if matched.is_whitelist() {
                return false;
            }
        }
        false
    }
}
