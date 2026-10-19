mod score;

use std::collections::BinaryHeap;
use std::path::PathBuf;

use memchr::memmem::Finder;

use crate::index::tree::{Kind, ROOT, Tree};
use score::{Candidate, Scored, score};

const NO_PARENT: u32 = u32::MAX;

struct Entry {
    lower: u32,
    name: u32,
    parent: u32,
    depth: u16,
    folder: bool,
    modified: i64,
}

pub struct Hit {
    pub path: String,
    pub folder: bool,
    pub score: f32,
}

#[derive(Default)]
pub struct Names {
    root: PathBuf,
    lower: Vec<u8>,
    names: String,
    entries: Vec<Entry>,
}

impl Names {
    pub fn build(tree: &Tree) -> Self {
        let mut names = Self {
            root: tree.root.clone(),
            ..Self::default()
        };
        let mut stack = vec![(ROOT, NO_PARENT, 0u16)];
        while let Some((id, parent, depth)) = stack.pop() {
            let Some(folder) = tree.folder(id) else {
                continue;
            };
            if folder.excluded {
                continue;
            }
            for &child in &folder.children {
                let node = &tree.nodes[child as usize];
                let index = names.entries.len() as u32;
                let is_folder = matches!(node.kind, Kind::Folder(_));
                names.entries.push(Entry {
                    lower: names.lower.len() as u32,
                    name: names.names.len() as u32,
                    parent,
                    depth,
                    folder: is_folder,
                    modified: node.modified,
                });
                names.lower.extend(node.name.to_lowercase().bytes());
                names.lower.push(0);
                names.names.push_str(&node.name);
                if is_folder {
                    stack.push((child, index, depth + 1));
                }
            }
        }
        names
    }

    fn name(&self, index: usize) -> &str {
        let end = self
            .entries
            .get(index + 1)
            .map_or(self.names.len(), |next| next.name as usize);
        &self.names[self.entries[index].name as usize..end]
    }

    fn lower(&self, index: usize) -> &[u8] {
        let end = self
            .entries
            .get(index + 1)
            .map_or(self.lower.len(), |next| next.lower as usize)
            - 1;
        &self.lower[self.entries[index].lower as usize..end]
    }

    fn ancestors(&self, index: usize) -> impl Iterator<Item = usize> + '_ {
        let mut parent = self.entries[index].parent;
        std::iter::from_fn(move || {
            (parent != NO_PARENT).then(|| {
                let current = parent as usize;
                parent = self.entries[current].parent;
                current
            })
        })
    }

    fn path(&self, index: usize) -> PathBuf {
        let mut parts: Vec<&str> = self
            .ancestors(index)
            .map(|ancestor| self.name(ancestor))
            .collect();
        parts.reverse();
        let mut path = self.root.clone();
        path.extend(parts);
        path.push(self.name(index));
        path
    }

    pub fn find(&self, query: &str, limit: usize, now: i64) -> Vec<Hit> {
        let folded = query.trim().to_lowercase();
        let Some(last) = folded.split_whitespace().last() else {
            return Vec::new();
        };
        let others: Vec<&str> = folded.split_whitespace().rev().skip(1).collect();
        let finder = Finder::new(last.as_bytes());
        let mut best = BinaryHeap::with_capacity(limit + 1);
        let mut previous = usize::MAX;
        for position in finder.find_iter(&self.lower) {
            let index = self
                .entries
                .partition_point(|entry| entry.lower as usize <= position)
                - 1;
            if index == previous {
                continue;
            }
            previous = index;
            let entry = &self.entries[index];
            let candidate = Candidate {
                name: self.lower(index),
                query: folded.as_bytes(),
                last: last.as_bytes(),
                others: &others,
                depth: entry.depth,
                age: now - entry.modified / 1_000_000_000,
            };
            let Some(points) = score(&candidate, |token| {
                self.ancestors(index)
                    .any(|ancestor| memchr::memmem::find(self.lower(ancestor), token).is_some())
            }) else {
                continue;
            };
            best.push(Scored { points, index });
            if best.len() > limit {
                best.pop();
            }
        }
        best.into_sorted_vec()
            .into_iter()
            .filter_map(|Scored { index, points }| {
                Some(Hit {
                    path: self.path(index).into_os_string().into_string().ok()?,
                    folder: self.entries[index].folder,
                    score: points,
                })
            })
            .collect()
    }
}
