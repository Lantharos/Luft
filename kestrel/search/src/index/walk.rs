use std::collections::HashMap;
use std::fs;
use std::mem;
use std::path::{Path, PathBuf};

use super::rules::{
    CACHE_TAG, REPOSITORY, Rules, ignore_file_modified, is_hidden, is_skipped_folder,
    load_ignore_file,
};
use super::stat::stat;
use super::tree::{Folder, Kind, Node, Tree};

const MAX_NODES: usize = 2_000_000;

pub struct Visit<'a> {
    pub path: &'a mut PathBuf,
    pub rules: &'a mut Rules,
    pub in_repository: bool,
    pub force: bool,
    pub everything: bool,
}

impl Tree {
    pub(super) fn visit(&mut self, id: u32, visit: Visit) -> bool {
        let Some(info) = stat(visit.path).filter(|info| info.is_dir() && info.mount == self.mount)
        else {
            self.detach(id, visit.path);
            return true;
        };
        let Visit {
            path,
            rules,
            in_repository,
            mut force,
            everything,
        } = visit;
        let folder = self.folder_mut(id);
        if everything && folder.read.is_some() {
            let ignore_modified = folder.ignore.as_ref().map_or(0, |file| file.modified);
            force |=
                ignore_file_modified(path, in_repository || folder.repository) != ignore_modified;
        }
        let mut changed = false;
        if force || folder.read != Some(info.modified) {
            changed = self.read(id, path, rules, in_repository, info.modified);
        }
        let Some(folder) = self.folder(id).filter(|folder| !folder.excluded) else {
            return changed;
        };
        let in_repository = in_repository || folder.repository;
        let ignore = folder.ignore.clone();
        let pushed = rules.push(ignore.as_ref());
        let folders: Vec<u32> = folder
            .children
            .iter()
            .copied()
            .filter(|&child| match &self.nodes[child as usize].kind {
                Kind::Folder(folder) => everything || force || folder.read.is_none(),
                _ => false,
            })
            .collect();
        for child in folders {
            path.push(&*self.nodes[child as usize].name);
            changed |= self.visit(
                child,
                Visit {
                    path,
                    rules,
                    in_repository,
                    force,
                    everything,
                },
            );
            path.pop();
        }
        rules.pop(pushed);
        changed
    }

    fn watch(&mut self, id: u32, path: &Path) {
        let folder = self.folder_mut(id);
        if folder.watch.is_some() {
            return;
        }
        let missed_edits = folder.read.is_some();
        let watch = self.watcher.watch(path, id);
        self.folder_mut(id).watch = watch;
        if watch.is_none() {
            self.polled.insert(id);
            return;
        }
        self.polled.remove(&id);
        if missed_edits {
            self.touch(id, |_| true);
        }
    }

    fn read(
        &mut self,
        id: u32,
        path: &Path,
        rules: &mut Rules,
        in_repository: bool,
        modified: i64,
    ) -> bool {
        self.watch(id, path);
        let Ok(entries) = fs::read_dir(path) else {
            return false;
        };
        let mut found = Vec::new();
        let mut repository = false;
        let mut excluded = false;
        for entry in entries.flatten() {
            let Ok(name) = entry.file_name().into_string() else {
                continue;
            };
            repository |= name == REPOSITORY;
            excluded |= name == CACHE_TAG;
            let Ok(kind) = entry.file_type() else {
                continue;
            };
            if !is_hidden(&name) {
                found.push((name, kind.is_dir()));
            }
        }
        let ignore = load_ignore_file(path, in_repository || repository);
        if excluded {
            found.clear();
        }
        let pushed = rules.push(ignore.as_ref());
        found.retain(|(name, is_dir)| {
            !(*is_dir && is_skipped_folder(name)) && !rules.ignores(&path.join(name), *is_dir)
        });
        rules.pop(pushed);

        let previous = mem::take(&mut self.folder_mut(id).children);
        let mut known: HashMap<Box<str>, u32> = previous
            .iter()
            .map(|&child| (self.nodes[child as usize].name.clone(), child))
            .collect();
        let mut changed = false;
        let mut children = Vec::with_capacity(found.len());
        for (name, is_dir) in found {
            if let Some(child) = known.remove(name.as_str()) {
                if matches!(self.nodes[child as usize].kind, Kind::Folder(_)) == is_dir {
                    children.push(child);
                    continue;
                }
                self.discard(child, path.join(&name));
            }
            if self.live() >= MAX_NODES {
                break;
            }
            let Some(info) = stat(&path.join(&name)) else {
                continue;
            };
            if is_dir && !info.writable {
                continue;
            }
            let kind = if is_dir {
                Kind::Folder(Folder::default())
            } else {
                Kind::File
            };
            let child = self.allocate(Node {
                parent: id,
                name: name.into(),
                modified: info.modified,
                kind,
            });
            if !is_dir {
                self.changes.files.push(child);
            }
            children.push(child);
            changed = true;
        }
        for (name, child) in known {
            self.discard(child, path.join(&*name));
            changed = true;
        }
        let folder = self.folder_mut(id);
        changed |= folder.excluded != excluded;
        *folder = Folder {
            children,
            excluded,
            read: Some(modified),
            repository,
            ignore,
            watch: folder.watch,
        };
        changed
    }
}
