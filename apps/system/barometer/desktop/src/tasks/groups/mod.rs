mod tree;
mod usage;

use std::collections::hash_map::Entry as Slot;
use std::collections::{HashMap, HashSet};
use std::time::Instant;

use serde::Serialize;
use specta::Type;

use crate::gpu::ProcessGpu;
use crate::tasks::apps::{Scopes, Window, Windowed};
pub use tree::{Group, key_of_cgroup, unit_path};
use tree::{Leaf, leaf_of, leaves};
use usage::Cgroup;

#[derive(Serialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct Entry {
    key: String,
    name: String,
    icon: Option<String>,
    group: Group,
    cpu: f32,
    memory: u64,
    read: f64,
    write: f64,
    read_total: u64,
    write_total: u64,
    gpu: f32,
    vram: u64,
    encoder: f32,
    decoder: f32,
    processes: u32,
    threads: u32,
    paused: bool,
    responding: bool,
    main: Option<u32>,
    windows: Vec<Window>,
}

pub struct Sampled {
    pub entries: Vec<Entry>,
    pub members: HashMap<String, Vec<u32>>,
}

pub struct EntrySampler {
    cgroups: HashMap<String, Cgroup>,
    last: Instant,
}

impl EntrySampler {
    pub fn new() -> Self {
        Self {
            cgroups: HashMap::new(),
            last: Instant::now(),
        }
    }

    pub fn sample(
        &mut self,
        scopes: &mut Scopes,
        windowed: Option<&Windowed>,
        disks: &HashSet<String>,
        everywhere: bool,
    ) -> Sampled {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last).as_secs_f64().max(0.001);
        self.last = now;
        let mut found = leaves(scopes, everywhere);
        if let Some(windowed) = windowed {
            add_windowed(scopes, windowed, &mut found);
        }
        scopes.keep(found.iter().map(|leaf| leaf.path.as_str()));
        let alive: HashSet<&str> = found.iter().map(|leaf| leaf.path.as_str()).collect();
        self.cgroups.retain(|path, _| alive.contains(path.as_str()));
        let windowless = if windowed.is_some() {
            Group::Background
        } else {
            Group::Apps
        };
        let mut entries: HashMap<String, Entry> = HashMap::new();
        let mut members: HashMap<String, Vec<u32>> = HashMap::new();
        for leaf in &found {
            let cgroup = match self.cgroups.entry(leaf.path.clone()) {
                Slot::Occupied(slot) => slot.into_mut(),
                Slot::Vacant(slot) => match Cgroup::open(&leaf.absolute()) {
                    Some(cgroup) => slot.insert(cgroup),
                    None => continue,
                },
            };
            let pids = cgroup.members();
            let total = entries
                .entry(leaf.key.clone())
                .or_insert_with(|| fresh(scopes, leaf, windowless));
            cgroup.add_to(total, elapsed, disks);
            total.processes += pids.len() as u32;
            members.entry(leaf.key.clone()).or_default().extend(pids);
        }
        entries.retain(|_, entry| entry.processes > 0);
        if let Some(windowed) = windowed {
            attach_windows(&mut entries, &members, windowed);
        }
        Sampled {
            entries: entries
                .into_values()
                .map(|entry| settle(entry, &members))
                .collect(),
            members,
        }
    }
}

fn fresh(scopes: &Scopes, leaf: &Leaf, windowless: Group) -> Entry {
    let info = scopes.info(&leaf.key);
    Entry {
        key: leaf.key.clone(),
        name: info.map_or_else(|| leaf.key.clone(), |info| info.name.clone()),
        icon: info.and_then(|info| info.icon.clone()),
        group: leaf.group.unwrap_or(windowless),
        cpu: 0.0,
        memory: 0,
        read: 0.0,
        write: 0.0,
        read_total: 0,
        write_total: 0,
        gpu: 0.0,
        vram: 0,
        encoder: 0.0,
        decoder: 0.0,
        processes: 0,
        threads: 0,
        paused: true,
        responding: true,
        main: None,
        windows: Vec::new(),
    }
}

fn add_windowed(scopes: &mut Scopes, windowed: &Windowed, found: &mut Vec<Leaf>) {
    let known: HashSet<String> = found.iter().map(|leaf| leaf.key.clone()).collect();
    for (app, windows) in windowed.apps() {
        if known.contains(app) {
            continue;
        }
        for window in windows {
            if let Some(leaf) = leaf_of(scopes, window.pid)
                && !found.iter().any(|other| other.path == leaf.path)
            {
                found.push(leaf);
            }
        }
    }
}

fn attach_windows(
    entries: &mut HashMap<String, Entry>,
    members: &HashMap<String, Vec<u32>>,
    windowed: &Windowed,
) {
    let owners: HashMap<u32, &str> = members
        .iter()
        .flat_map(|(key, pids)| pids.iter().map(move |pid| (*pid, key.as_str())))
        .collect();
    for (app, windows) in windowed.apps() {
        for window in windows {
            let owner = if entries.contains_key(app) {
                Some(app)
            } else {
                owners.get(&window.pid).copied()
            };
            if let Some(entry) = owner.and_then(|key| entries.get_mut(key)) {
                entry.windows.push(window.clone());
            }
        }
    }
    for entry in entries.values_mut() {
        if !entry.windows.is_empty() {
            entry.group = Group::Apps;
        }
    }
}

fn settle(mut entry: Entry, members: &HashMap<String, Vec<u32>>) -> Entry {
    entry.responding = entry.windows.iter().all(|window| window.responding);
    entry.main = entry
        .windows
        .first()
        .map(|window| window.pid)
        .or_else(|| members.get(&entry.key)?.iter().min().copied());
    entry
}

pub fn attach_gpu(
    entries: &mut [Entry],
    members: &HashMap<String, Vec<u32>>,
    gpu: &HashMap<u32, ProcessGpu>,
) {
    for entry in entries {
        for process in members
            .get(&entry.key)
            .into_iter()
            .flatten()
            .filter_map(|pid| gpu.get(pid))
        {
            entry.gpu = (entry.gpu + process.usage).min(100.0);
            entry.vram += process.memory;
            entry.encoder = (entry.encoder + process.encoder).min(100.0);
            entry.decoder = (entry.decoder + process.decoder).min(100.0);
        }
    }
}
