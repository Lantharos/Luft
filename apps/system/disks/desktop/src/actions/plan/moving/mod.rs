mod disk;
mod journal;
mod layout;

use std::path::Path;

use luft_app::Events;
use luft_app::dbus::objects::Objects;
use serde::Serialize;
use specta::Type;

use crate::udisks::{self, BLOCK, no_options};
use disk::Disk;
use journal::{Edges, Journal, Move};

#[derive(Serialize, Type)]
pub struct MoveProgress {
    copied: u64,
    total: u64,
}

#[derive(Serialize, Type)]
pub struct InterruptedMove {
    pub id: String,
    pub drive: String,
    pub label: String,
}

async fn blocking<T: Send + 'static>(
    work: impl FnOnce() -> Result<T, String> + Send + 'static,
) -> Result<T, String> {
    tokio::task::spawn_blocking(work)
        .await
        .map_err(|error| error.to_string())?
}

fn begin(disk: &Disk, plan: Move) -> Result<Journal, String> {
    begin_in(&journal::folder(), disk, plan)
}

fn begin_in(folder: &Path, disk: &Disk, plan: Move) -> Result<Journal, String> {
    let from = plan.entry.offset;
    let edges = Edges {
        head: disk.read(from, plan.head())?,
        tail: disk.read(
            from + plan.tail_start(),
            plan.entry.size - plan.tail_start(),
        )?,
    };
    let journal = Journal::create(folder, plan, edges).map_err(|error| error.to_string())?;
    disk.write(from, &vec![0; journal.edges.head.len()])?;
    disk.sync()?;
    Ok(journal)
}

fn copy(events: &Events, disk: &Disk, mut journal: Journal) -> Result<Journal, String> {
    let Err(error) = disk.copy_body(events, &mut journal) else {
        return Ok(journal);
    };
    if !journal.plan.overlaps() {
        disk.write(journal.plan.entry.offset, &journal.edges.head)?;
        disk.sync()?;
        journal.finish().map_err(|error| error.to_string())?;
    }
    Err(error)
}

async fn carry_out(events: &Events, disk: Disk, journal: Journal) -> Result<String, String> {
    let events = events.clone();
    let journal = blocking(move || copy(&events, &disk, journal)).await?;
    let moved = layout::settle(&journal.plan).await?;
    let partition = Disk::open(&moved).await?;
    blocking(move || {
        partition.restore(&journal.edges, journal.plan.tail_start())?;
        journal.finish().map_err(|error| error.to_string())
    })
    .await?;
    udisks::run(&moved, BLOCK, "Rescan", &(no_options(),)).await?;
    Ok(moved)
}

pub async fn shift(
    events: &Events,
    block: &str,
    offset: u64,
    label: &str,
) -> Result<String, String> {
    let (table, plan) = layout::plan(block, offset, label).await?;
    let disk = Disk::open(&table).await?;
    let (disk, journal) = blocking(move || {
        let journal = begin(&disk, plan)?;
        Ok((disk, journal))
    })
    .await?;
    carry_out(events, disk, journal).await
}

pub fn interrupted(objects: &Objects) -> Vec<InterruptedMove> {
    journal::kept()
        .into_iter()
        .filter_map(|kept| {
            let found = layout::find(objects, &kept.plan)?;
            if !found.fits(&kept.plan, kept.copied) {
                journal::discard(&kept.id);
                return None;
            }
            Some(InterruptedMove {
                id: kept.id,
                drive: found.table,
                label: kept.plan.label,
            })
        })
        .collect()
}

pub async fn finish(events: &Events, id: &str) -> Result<(), String> {
    let journal = Journal::open(&journal::folder(), id).map_err(|error| error.to_string())?;
    let found = layout::find(&udisks::objects().await?, &journal.plan)
        .filter(|found| found.fits(&journal.plan, journal.copied))
        .ok_or("This drive is gone")?;
    let disk = Disk::open(&found.table).await?;
    carry_out(events, disk, journal).await.map(drop)
}

#[cfg(test)]
mod tests {
    use std::fs::File;
    use std::os::unix::fs::FileExt;

    use super::*;
    use layout::Entry;

    const MIB: u64 = 1024 * 1024;

    fn plan(to: u64) -> Move {
        Move {
            drive: String::new(),
            drive_size: 16 * MIB,
            label: "Data".to_owned(),
            entry: Entry {
                offset: 4 * MIB,
                size: 6 * MIB,
                kind: String::new(),
                name: String::new(),
                uuid: String::new(),
                flags: 0,
                gpt: true,
            },
            to,
        }
    }

    fn drive(folder: &std::path::Path) -> (Disk, Vec<u8>) {
        let contents: Vec<u8> = (0..16 * MIB).map(|byte| (byte / 7 % 251) as u8).collect();
        let file = File::options()
            .read(true)
            .write(true)
            .create_new(true)
            .open(folder.join("drive"))
            .unwrap();
        file.write_all_at(&contents, 0).unwrap();
        (Disk::over(file), contents)
    }

    #[test]
    fn a_move_cut_off_while_overwriting_itself_finishes_from_the_journal() {
        let scratch = tempfile::tempdir().unwrap();
        let (disk, before) = drive(scratch.path());
        let journal = begin_in(scratch.path(), &disk, plan(3 * MIB)).unwrap();
        let body = journal.plan.body() as usize;
        let mut journal = journal;
        journal
            .stash(&before[5 * MIB as usize..5 * MIB as usize + body])
            .unwrap();
        disk.write(4 * MIB, &vec![0xee; 3 * MIB as usize]).unwrap();
        drop(journal);

        let id = journal::kept_in(scratch.path()).remove(0).id;
        let mut journal = Journal::open(scratch.path(), &id).unwrap();
        disk.copy_body(&Events::default(), &mut journal).unwrap();
        disk.write(3 * MIB, &journal.edges.head).unwrap();
        disk.write(3 * MIB + journal.plan.tail_start(), &journal.edges.tail)
            .unwrap();

        assert_eq!(
            disk.read(3 * MIB, 6 * MIB).unwrap(),
            before[4 * MIB as usize..10 * MIB as usize]
        );
    }

    #[test]
    fn a_move_to_free_space_elsewhere_carries_every_byte() {
        let scratch = tempfile::tempdir().unwrap();
        let (disk, before) = drive(scratch.path());
        let mut journal = begin_in(scratch.path(), &disk, plan(10 * MIB)).unwrap();
        disk.copy_body(&Events::default(), &mut journal).unwrap();
        disk.write(10 * MIB, &journal.edges.head).unwrap();
        disk.write(10 * MIB + journal.plan.tail_start(), &journal.edges.tail)
            .unwrap();

        assert_eq!(
            disk.read(10 * MIB, 6 * MIB).unwrap(),
            before[4 * MIB as usize..10 * MIB as usize]
        );
    }
}
