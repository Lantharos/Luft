use std::collections::HashMap;
use std::fs;
use std::mem;
use std::path::{Path, PathBuf};

use super::rules::{
    CACHE_TAG, IgnoreFile, REPOSITORY, Rules, ignore_file_modified, is_hidden, is_skipped_folder,
    load_ignore_file,
};
use super::stat::stat;

pub const ROOT: u32 = 0;
const MAX_NODES: usize = 2_000_000;

pub struct Node {
    pub parent: u32,
    pub name: Box<str>,
    pub modified: i64,
    pub kind: Kind,
}

pub enum Kind {
    Free,
    File,
    Folder(Folder),
}

#[derive(Default)]
pub struct Folder {
    pub children: Vec<u32>,
    pub excluded: bool,
    read: Option<i64>,
    repository: bool,
    ignore: Option<IgnoreFile>,
}

struct Visit<'a> {
    path: &'a mut PathBuf,
    rules: &'a mut Rules,
    in_repository: bool,
    force: bool,
}

pub struct Tree {
    pub root: PathBuf,
    pub nodes: Vec<Node>,
    mount: u64,
    free: Vec<u32>,
}

impl Tree {
    pub fn new(root: PathBuf) -> Option<Self> {
        let mount = stat(&root).filter(|info| info.is_dir())?.mount;
        let node = Node {
            parent: ROOT,
            name: "".into(),
            modified: 0,
            kind: Kind::Folder(Folder::default()),
        };
        Some(Self {
            root,
            nodes: vec![node],
            mount,
            free: Vec::new(),
        })
    }

    pub fn folder(&self, id: u32) -> Option<&Folder> {
        match &self.nodes[id as usize].kind {
            Kind::Folder(folder) => Some(folder),
            _ => None,
        }
    }

    pub fn refresh(&mut self) -> bool {
        let mut path = self.root.clone();
        let mut rules = Rules::default();
        self.visit(
            ROOT,
            Visit {
                path: &mut path,
                rules: &mut rules,
                in_repository: false,
                force: false,
            },
        )
    }

    fn folder_mut(&mut self, id: u32) -> &mut Folder {
        match &mut self.nodes[id as usize].kind {
            Kind::Folder(folder) => folder,
            _ => unreachable!("only folders are visited"),
        }
    }

    fn visit(&mut self, id: u32, visit: Visit) -> bool {
        let Some(info) = stat(visit.path).filter(|info| info.is_dir() && info.mount == self.mount)
        else {
            self.detach(id);
            return true;
        };
        let Visit {
            path,
            rules,
            in_repository,
            mut force,
        } = visit;
        let folder = self.folder_mut(id);
        if folder.read.is_some() {
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
            .filter(|&child| matches!(self.nodes[child as usize].kind, Kind::Folder(_)))
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
                },
            );
            path.pop();
        }
        rules.pop(pushed);
        changed
    }

    fn read(
        &mut self,
        id: u32,
        path: &Path,
        rules: &mut Rules,
        in_repository: bool,
        modified: i64,
    ) -> bool {
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
                self.remove(child);
            }
            if self.nodes.len() - self.free.len() >= MAX_NODES {
                break;
            }
            let Some(info) = stat(&path.join(&name)) else {
                continue;
            };
            if is_dir && !info.writable {
                continue;
            }
            let modified = info.modified;
            let kind = if is_dir {
                Kind::Folder(Folder::default())
            } else {
                Kind::File
            };
            children.push(self.allocate(Node {
                parent: id,
                name: name.into(),
                modified,
                kind,
            }));
            changed = true;
        }
        for child in known.into_values() {
            self.remove(child);
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
        };
        changed
    }

    fn allocate(&mut self, node: Node) -> u32 {
        match self.free.pop() {
            Some(id) => {
                self.nodes[id as usize] = node;
                id
            }
            None => {
                self.nodes.push(node);
                (self.nodes.len() - 1) as u32
            }
        }
    }

    fn detach(&mut self, id: u32) {
        if id == ROOT {
            for child in mem::take(&mut self.folder_mut(ROOT).children) {
                self.remove(child);
            }
            self.folder_mut(ROOT).read = None;
            return;
        }
        let parent = self.nodes[id as usize].parent;
        self.folder_mut(parent)
            .children
            .retain(|&child| child != id);
        self.remove(id);
    }

    fn remove(&mut self, id: u32) {
        let node = &mut self.nodes[id as usize];
        node.name = "".into();
        if let Kind::Folder(folder) = mem::replace(&mut node.kind, Kind::Free) {
            for child in folder.children {
                self.remove(child);
            }
        }
        self.free.push(id);
    }
}
