use std::collections::{HashMap, HashSet};
use std::mem;
use std::path::PathBuf;

use super::rules::{Rules, is_hidden, shapes_rules};
use super::tree::{Changes, Folder, Kind, ROOT, Tree};
use super::walk::Visit;
use super::watch::Event;

#[derive(Default)]
struct Pending {
    lost: bool,
    folders: HashMap<u32, bool>,
    edits: HashMap<u32, HashSet<String>>,
    unwatched: Vec<u32>,
}

impl Tree {
    pub fn refresh(&mut self) -> Changes {
        let pending = self.pending();
        for folder in pending.unwatched {
            if self.read_folder(folder).is_some() {
                self.folder_mut(folder).watch = None;
                self.polled.insert(folder);
            }
        }
        let everything = pending.lost || self.read_folder(ROOT).is_none();
        if everything {
            self.changes.everything = true;
            self.revisit(ROOT, false, true);
            return mem::take(&mut self.changes);
        }
        for (folder, force) in pending.folders {
            self.revisit(folder, force, false);
        }
        let polled: Vec<u32> = self.polled.iter().copied().collect();
        for folder in polled {
            self.revisit(folder, false, false);
            self.touch(folder, |_| true);
        }
        for (folder, names) in pending.edits {
            self.touch(folder, |name| names.contains(name));
        }
        mem::take(&mut self.changes)
    }

    fn pending(&mut self) -> Pending {
        let mut pending = Pending::default();
        self.watcher.drain(|event| match event {
            Event::Overflow => pending.lost = true,
            Event::Unwatched(folder) => pending.unwatched.push(folder),
            Event::Entry { folder, name, .. } if shapes_rules(&name) => {
                pending.folders.insert(folder, true);
            }
            Event::Entry { name, .. } if is_hidden(&name) => {}
            Event::Entry {
                folder,
                name,
                edit: true,
            } => {
                pending.edits.entry(folder).or_default().insert(name);
            }
            Event::Entry { folder, .. } => {
                pending.folders.entry(folder).or_insert(false);
            }
        });
        pending
    }

    fn read_folder(&self, id: u32) -> Option<&Folder> {
        self.folder(id).filter(|folder| folder.read.is_some())
    }

    fn revisit(&mut self, id: u32, force: bool, everything: bool) {
        if !everything && self.read_folder(id).is_none() {
            return;
        }
        let (mut path, mut rules, in_repository) = self.context(id);
        self.changes.names |= self.visit(
            id,
            Visit {
                path: &mut path,
                rules: &mut rules,
                in_repository,
                force,
                everything,
            },
        );
    }

    fn context(&self, id: u32) -> (PathBuf, Rules, bool) {
        let mut ancestors = Vec::new();
        let mut at = id;
        while at != ROOT {
            at = self.nodes[at as usize].parent;
            ancestors.push(at);
        }
        let mut rules = Rules::default();
        let mut in_repository = false;
        for folder in ancestors.into_iter().rev().filter_map(|id| self.folder(id)) {
            rules.push(folder.ignore.as_ref());
            in_repository |= folder.repository;
        }
        (self.path(id), rules, in_repository)
    }

    pub(super) fn touch(&mut self, id: u32, touched: impl Fn(&str) -> bool) {
        let Kind::Folder(folder) = &self.nodes[id as usize].kind else {
            return;
        };
        let files = folder.children.iter().copied().filter(|&child| {
            let node = &self.nodes[child as usize];
            matches!(node.kind, Kind::File) && touched(&node.name)
        });
        self.changes.files.extend(files);
    }
}
