use std::collections::HashSet;
use std::mem;
use std::path::{Path, PathBuf};

use super::rules::IgnoreFile;
use super::stat::stat;
use super::watch::Watcher;

pub const ROOT: u32 = 0;

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
    pub(super) read: Option<i64>,
    pub(super) repository: bool,
    pub(super) ignore: Option<IgnoreFile>,
    pub(super) watch: Option<i32>,
}

#[derive(Default)]
pub struct Changes {
    pub everything: bool,
    pub names: bool,
    pub files: Vec<u32>,
    pub gone: Vec<PathBuf>,
}

pub struct Tree {
    pub root: PathBuf,
    pub nodes: Vec<Node>,
    pub(super) mount: u64,
    pub(super) watcher: Watcher,
    pub(super) polled: HashSet<u32>,
    pub(super) changes: Changes,
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
            watcher: Watcher::new(),
            polled: HashSet::new(),
            changes: Changes::default(),
            free: Vec::new(),
        })
    }

    pub fn folder(&self, id: u32) -> Option<&Folder> {
        match &self.nodes[id as usize].kind {
            Kind::Folder(folder) => Some(folder),
            _ => None,
        }
    }

    pub(super) fn folder_mut(&mut self, id: u32) -> &mut Folder {
        match &mut self.nodes[id as usize].kind {
            Kind::Folder(folder) => folder,
            _ => unreachable!("only folders are visited"),
        }
    }

    pub fn is_file(&self, id: u32) -> bool {
        matches!(self.nodes[id as usize].kind, Kind::File)
    }

    pub fn path(&self, id: u32) -> PathBuf {
        let mut names = Vec::new();
        let mut at = id;
        while at != ROOT {
            let node = &self.nodes[at as usize];
            names.push(&*node.name);
            at = node.parent;
        }
        let mut path = self.root.clone();
        path.extend(names.into_iter().rev());
        path
    }

    pub fn files(&self, mut each: impl FnMut(u32, &Path)) {
        let mut path = self.root.clone();
        self.files_in(ROOT, &mut path, &mut each);
    }

    fn files_in(&self, id: u32, path: &mut PathBuf, each: &mut impl FnMut(u32, &Path)) {
        let Some(folder) = self.folder(id) else {
            return;
        };
        for &child in &folder.children {
            let node = &self.nodes[child as usize];
            path.push(&*node.name);
            match node.kind {
                Kind::File => each(child, path),
                Kind::Folder(_) => self.files_in(child, path, each),
                Kind::Free => {}
            }
            path.pop();
        }
    }

    pub(super) fn allocate(&mut self, node: Node) -> u32 {
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

    pub(super) fn live(&self) -> usize {
        self.nodes.len() - self.free.len()
    }

    pub(super) fn detach(&mut self, id: u32, path: &Path) {
        self.changes.gone.push(path.to_path_buf());
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

    pub(super) fn discard(&mut self, id: u32, path: PathBuf) {
        self.changes.gone.push(path);
        self.remove(id);
    }

    fn remove(&mut self, id: u32) {
        let node = &mut self.nodes[id as usize];
        node.name = "".into();
        if let Kind::Folder(folder) = mem::replace(&mut node.kind, Kind::Free) {
            if let Some(watch) = folder.watch {
                self.watcher.unwatch(watch, id);
            }
            self.polled.remove(&id);
            for child in folder.children {
                self.remove(child);
            }
        }
        self.free.push(id);
    }
}
