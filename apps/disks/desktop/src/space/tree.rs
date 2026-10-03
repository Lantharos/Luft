use std::ffi::OsStr;
use std::sync::atomic::{AtomicI64, AtomicU64, Ordering};
use std::sync::{Arc, Weak};

use parking_lot::RwLock;
use serde::Serialize;

const SHOWN: usize = 240;
const INNER: usize = 12;

pub struct File {
    pub name: Box<OsStr>,
    pub size: u64,
}

#[derive(Default)]
pub struct Contents {
    pub dirs: Vec<Arc<Node>>,
    pub files: Vec<File>,
    pub other_count: u64,
    pub other_size: u64,
}

pub struct Node {
    pub name: Box<OsStr>,
    parent: Weak<Node>,
    size: AtomicU64,
    items: AtomicU64,
    pending: AtomicI64,
    pub contents: RwLock<Contents>,
}

#[derive(Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Item {
    Dir {
        name: String,
        size: u64,
        items: u64,
        done: bool,
        inner: Vec<u64>,
    },
    File {
        name: String,
        size: u64,
    },
    Other {
        count: u64,
        size: u64,
    },
}

impl Item {
    fn size(&self) -> u64 {
        match self {
            Item::Dir { size, .. } | Item::File { size, .. } | Item::Other { size, .. } => *size,
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct View {
    pub path: Vec<String>,
    pub size: u64,
    pub items: u64,
    pub done: bool,
    pub children: Vec<Item>,
    pub hidden_count: u64,
    pub hidden_size: u64,
}

pub fn display(name: &OsStr) -> String {
    name.to_string_lossy().into_owned()
}

impl Node {
    pub fn root(name: &OsStr, own: u64) -> Arc<Self> {
        Arc::new(Self::new(name, Weak::new(), own))
    }

    pub fn child(parent: &Arc<Node>, name: &OsStr, own: u64) -> Arc<Self> {
        Arc::new(Self::new(name, Arc::downgrade(parent), own))
    }

    fn new(name: &OsStr, parent: Weak<Node>, own: u64) -> Self {
        Self {
            name: name.into(),
            parent,
            size: AtomicU64::new(own),
            items: AtomicU64::new(0),
            pending: AtomicI64::new(1),
            contents: RwLock::default(),
        }
    }

    pub fn size(&self) -> u64 {
        self.size.load(Ordering::Relaxed)
    }

    pub fn items(&self) -> u64 {
        self.items.load(Ordering::Relaxed)
    }

    pub fn done(&self) -> bool {
        self.pending.load(Ordering::Acquire) <= 0
    }

    fn adjust(&self, size: i64, items: i64, pending: i64) {
        self.size.fetch_add(size as u64, Ordering::Relaxed);
        self.items.fetch_add(items as u64, Ordering::Relaxed);
        self.pending.fetch_add(pending, Ordering::AcqRel);
    }

    pub fn settle(&self, size: i64, items: i64, pending: i64) {
        self.adjust(size, items, pending);
        let mut parent = self.parent.upgrade();
        while let Some(node) = parent {
            node.adjust(size, items, pending);
            parent = node.parent.upgrade();
        }
    }

    pub fn find(self: &Arc<Self>, path: &[String]) -> Option<Arc<Node>> {
        let mut node = self.clone();
        for name in path {
            let next = node
                .contents
                .read()
                .dirs
                .iter()
                .find(|dir| display(&dir.name) == *name)
                .cloned()?;
            node = next;
        }
        Some(node)
    }

    fn inner(&self) -> Vec<u64> {
        let contents = self.contents.read();
        let mut sizes: Vec<u64> = contents
            .dirs
            .iter()
            .map(|dir| dir.size())
            .chain(contents.files.iter().map(|file| file.size))
            .chain((contents.other_size > 0).then_some(contents.other_size))
            .collect();
        sizes.sort_unstable_by(|a, b| b.cmp(a));
        sizes.truncate(INNER);
        sizes
    }

    pub fn view(&self, path: Vec<String>) -> View {
        let mut children: Vec<(Item, Option<Arc<Node>>)> = {
            let contents = self.contents.read();
            contents
                .dirs
                .iter()
                .map(|dir| {
                    let item = Item::Dir {
                        name: display(&dir.name),
                        size: dir.size(),
                        items: dir.items(),
                        done: dir.done(),
                        inner: Vec::new(),
                    };
                    (item, Some(dir.clone()))
                })
                .chain(contents.files.iter().map(|file| {
                    let item = Item::File {
                        name: display(&file.name),
                        size: file.size,
                    };
                    (item, None)
                }))
                .chain((contents.other_count > 0).then_some((
                    Item::Other {
                        count: contents.other_count,
                        size: contents.other_size,
                    },
                    None,
                )))
                .collect()
        };
        children.sort_unstable_by_key(|(item, _)| std::cmp::Reverse(item.size()));
        let hidden = children.split_off(children.len().min(SHOWN));
        View {
            path,
            size: self.size(),
            items: self.items(),
            done: self.done(),
            hidden_count: hidden
                .iter()
                .map(|(item, _)| match item {
                    Item::Other { count, .. } => *count,
                    _ => 1,
                })
                .sum(),
            hidden_size: hidden.iter().map(|(item, _)| item.size()).sum(),
            children: children
                .into_iter()
                .map(|(mut item, node)| {
                    if let (Item::Dir { inner, .. }, Some(node)) = (&mut item, node) {
                        *inner = node.inner();
                    }
                    item
                })
                .collect(),
        }
    }

    pub fn exact(&self, name: &str) -> Option<Box<OsStr>> {
        let contents = self.contents.read();
        contents
            .dirs
            .iter()
            .map(|dir| &dir.name)
            .chain(contents.files.iter().map(|file| &file.name))
            .find(|candidate| display(candidate) == name)
            .cloned()
    }

    pub fn measuring(&self, name: &str) -> bool {
        self.contents
            .read()
            .dirs
            .iter()
            .any(|dir| display(&dir.name) == name && !dir.done())
    }

    pub fn forget(&self, name: &str) {
        let removed = {
            let mut contents = self.contents.write();
            if let Some(index) = contents
                .dirs
                .iter()
                .position(|dir| display(&dir.name) == name)
            {
                let dir = contents.dirs.remove(index);
                Some((dir.size(), dir.items() + 1))
            } else {
                contents
                    .files
                    .iter()
                    .position(|file| display(&file.name) == name)
                    .map(|index| (contents.files.remove(index).size, 1))
            }
        };
        if let Some((size, items)) = removed {
            self.settle(-(size as i64), -(items as i64), 0);
        }
    }
}
