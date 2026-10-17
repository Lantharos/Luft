use std::fs::File;
use std::os::fd::OwnedFd;
use std::os::unix::fs::FileExt;
use std::time::{Duration, Instant};

use luft_app::Events;
use serde::Serialize;
use zbus::Variant;

use crate::udisks::{self, BLOCK, PARTITION, TABLE, no_options};

const PROGRESS: &str = "disks.plan";

const EDGE: u64 = 1024 * 1024;
const CHUNK: u64 = 8 * 1024 * 1024;
const REPORT_EVERY: Duration = Duration::from_millis(250);

#[derive(Serialize)]
struct Progress {
    copied: u64,
    total: u64,
}

struct Entry {
    table: String,
    offset: u64,
    size: u64,
    kind: String,
    name: String,
    uuid: String,
    flags: u64,
    gpt: bool,
}

impl Entry {
    async fn read(block: &str) -> Result<Self, String> {
        let objects = udisks::objects().await?;
        let partition = objects
            .get(block, PARTITION)
            .ok_or("This partition is gone")?;
        let table = partition
            .link("Table")
            .ok_or("This partition has no table")?;
        let gpt = objects
            .get(&table, TABLE)
            .and_then(|table| table.get::<String>("Type"))
            .is_some_and(|kind| kind == "gpt");
        Ok(Self {
            offset: partition.get("Offset").unwrap_or(0),
            size: partition.get("Size").unwrap_or(0),
            kind: partition.get("Type").unwrap_or_default(),
            name: partition.get("Name").unwrap_or_default(),
            uuid: partition.get("UUID").unwrap_or_default(),
            flags: partition.get("Flags").unwrap_or(0),
            table,
            gpt,
        })
    }
}

struct Disk(File);

impl Disk {
    async fn open(block: &str) -> Result<Self, String> {
        let descriptor: zbus::OwnedFd =
            udisks::call(block, BLOCK, "OpenDevice", &("rw", no_options())).await?;
        Ok(Self(File::from(OwnedFd::from(descriptor))))
    }

    fn read(&self, offset: u64, length: u64) -> Result<Vec<u8>, String> {
        let mut buffer = vec![0; length as usize];
        self.0
            .read_exact_at(&mut buffer, offset)
            .map_err(|error| error.to_string())?;
        Ok(buffer)
    }

    fn write(&self, offset: u64, bytes: &[u8]) -> Result<(), String> {
        self.0
            .write_all_at(bytes, offset)
            .map_err(|error| error.to_string())
    }

    fn sync(&self) -> Result<(), String> {
        self.0.sync_all().map_err(|error| error.to_string())
    }
}

struct Edges {
    head: Vec<u8>,
    tail: Vec<u8>,
    tail_start: u64,
}

impl Edges {
    fn restore(&self, partition: &Disk) -> Result<(), String> {
        partition.write(0, &self.head)?;
        partition.write(self.tail_start, &self.tail)?;
        partition.sync()?;
        let restored = partition.read(0, self.head.len() as u64)? == self.head
            && partition.read(self.tail_start, self.tail.len() as u64)? == self.tail;
        if !restored {
            return Err("The start of the moved partition didn't read back the same".to_owned());
        }
        Ok(())
    }
}

pub async fn shift(events: &Events, block: &str, offset: u64) -> Result<String, String> {
    let entry = Entry::read(block).await?;
    let disk = Disk::open(&entry.table).await?;
    let events = events.clone();
    let (from, length) = (entry.offset, entry.size);
    let edges = blocking(move || move_body(&events, &disk, from, offset, length)).await?;

    udisks::run(block, PARTITION, "Delete", &(no_options(),)).await?;
    let moved = recreate(&entry, offset).await?;
    let partition = Disk::open(&moved).await?;
    blocking(move || edges.restore(&partition)).await?;
    udisks::run(&moved, BLOCK, "Rescan", &(no_options(),)).await?;
    Ok(moved)
}

async fn blocking<T: Send + 'static>(
    work: impl FnOnce() -> Result<T, String> + Send + 'static,
) -> Result<T, String> {
    tokio::task::spawn_blocking(work)
        .await
        .map_err(|error| error.to_string())?
}

fn move_body(
    events: &Events,
    disk: &Disk,
    from: u64,
    to: u64,
    length: u64,
) -> Result<Edges, String> {
    let head = length.min(EDGE);
    let tail_start = head.max(length.saturating_sub(EDGE));
    let edges = Edges {
        head: disk.read(from, head)?,
        tail: disk.read(from + tail_start, length - tail_start)?,
        tail_start,
    };
    copy_body(events, disk, from, to, (head, tail_start))?;
    disk.sync()?;
    Ok(edges)
}

async fn recreate(entry: &Entry, offset: u64) -> Result<String, String> {
    let mut options = no_options();
    if entry.gpt && !entry.uuid.is_empty() {
        options.insert("partition-uuid", Variant::from(entry.uuid.as_str()));
    }
    let name = if entry.gpt { entry.name.as_str() } else { "" };
    let created = udisks::created(
        &entry.table,
        TABLE,
        "CreatePartition",
        &(offset, entry.size, entry.kind.as_str(), name, options),
    )
    .await?;
    if entry.flags != 0 {
        udisks::run(
            &created,
            PARTITION,
            "SetFlags",
            &(entry.flags, no_options()),
        )
        .await?;
    }
    Ok(created)
}

fn copy_body(
    events: &Events,
    disk: &Disk,
    from: u64,
    to: u64,
    (start, end): (u64, u64),
) -> Result<(), String> {
    let total = end - start;
    let mut chunks: Vec<(u64, u64)> = (start..end)
        .step_by(CHUNK as usize)
        .map(|position| (position, CHUNK.min(end - position)))
        .collect();
    if to > from {
        chunks.reverse();
    }
    let mut copied = 0;
    let mut reported = Instant::now();
    for (position, length) in chunks {
        let bytes = disk.read(from + position, length)?;
        disk.write(to + position, &bytes)?;
        copied += length;
        if reported.elapsed() >= REPORT_EVERY {
            reported = Instant::now();
            events.emit(PROGRESS, Progress { copied, total });
        }
    }
    events.emit(PROGRESS, Progress { copied, total });
    Ok(())
}
