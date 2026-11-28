use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use anyhow::{Context, Result, ensure};

use super::volumes::{self, Mounted, ROOT};
use super::{MIB, Request, SLACK, STAGED, files};
use crate::disk::ROOT_PARTITION;
use crate::disk::encrypting::request;
use crate::disk::requests::{self, ERASE};
use crate::disk::unclaimed::temporary;
use crate::drives::work;
use crate::system::host::blocks;
use crate::system::host::command::Tool;

const ROOM: &str = "luft-erase-room";
const OLD: &str = "luft-erase-old";
const MOVED: &str = "luft-erasing";
const HEADER: u64 = 16 * MIB;
const RESERVED: u64 = 64 * MIB;
const TICK: Duration = Duration::from_secs(1);

struct Halves {
    middle: u64,
    unencrypted: bool,
}

enum Stage {
    Waiting,
    Away(Halves),
    Back(Halves),
    Grow,
}

impl Stage {
    fn read(mark: &str) -> Option<Self> {
        let mut words = mark.split(' ');
        let halves = |mut words: std::str::Split<'_, char>| {
            Some(Halves {
                middle: words.next()?.parse().ok()?,
                unencrypted: words.next()? == "unencrypted",
            })
        };
        match words.next()? {
            "" => Some(Self::Waiting),
            "away" => halves(words).map(Self::Away),
            "back" => halves(words).map(Self::Back),
            "grow" => Some(Self::Grow),
            _ => None,
        }
    }
}

fn mark(stage: &str, halves: &Halves) -> Result<()> {
    let kind = if halves.unencrypted {
        "unencrypted"
    } else {
        "encrypted"
    };
    requests::advance(ERASE, &format!("{stage} {} {kind}", halves.middle))
}

fn sushi(arguments: &[&str]) {
    let _ = Tool::new("sushictl").args(arguments).status();
}

fn show(percent: u64) {
    sushi(&["progress", &percent.to_string()]);
}

fn move_off(top: &Mounted, device: &Path, shown: (u64, u64)) -> Result<()> {
    let all = top.allocated(device).max(1);
    let moving = AtomicBool::new(true);
    std::thread::scope(|scope| {
        scope.spawn(|| {
            while moving.load(Ordering::Relaxed) {
                std::thread::sleep(TICK);
                let left = top.allocated(device).min(all);
                show(shown.0 + (shown.1 - shown.0) * (all - left) / all);
            }
        });
        let moved = top.remove(device);
        moving.store(false, Ordering::Relaxed);
        moved
    })
}

fn plan(partition: &Path, source: &Path) -> Result<Option<Halves>> {
    let top = Mounted::from(&[source])?;
    let name = blocks::kernel_name(partition).context("Luft's partition has no name")?;
    let asked = requests::waiting_in::<Request>(top.path(), ERASE).is_some_and(|waiting| {
        blocks::partuuid(&name).as_deref() == Some(waiting.request.partition.as_str())
    });
    if !asked {
        return Ok(None);
    }
    files::replace(top.path())?;
    let size = (top.smallest()? + SLACK).next_multiple_of(MIB);
    let middle = RESERVED + size;
    ensure!(
        work::size_of(partition) >= middle + RESERVED + size,
        "Luft's drive is too full to be erased"
    );
    top.resize(source, &size.to_string())?;
    Ok(Some(Halves {
        middle,
        unencrypted: source == partition,
    }))
}

fn move_away(partition: &Path, source: &Path, halves: &Halves) -> Result<()> {
    let room = volumes::span(
        ROOM,
        partition,
        halves.middle,
        work::size_of(partition) - halves.middle,
    )?;
    let key = match volumes::temporary_key(&room)? {
        Some(key) => key,
        None => temporary::format(&room)?,
    };
    let moved = volumes::open(&room, MOVED, &key)?;
    let top = Mounted::from(&[&moved, source])?;
    if !volumes::holds_luft(&moved) {
        top.add(&moved)?;
    }
    if volumes::holds_luft(source) {
        move_off(&top, source, (5, 50))?;
    }
    Ok(())
}

fn fresh_root(partition: &Path, halves: &Halves) -> Result<()> {
    let root = volumes::mapped(ROOT);
    if root.exists() && volumes::holds_luft(&root) {
        return Ok(());
    }
    volumes::close(ROOT)?;
    let old = volumes::span(OLD, partition, 0, halves.middle)?;
    let key = match volumes::temporary_key(&old)? {
        Some(key) => key,
        None => {
            if halves.unencrypted {
                volumes::zero(&old, halves.middle)?;
            }
            temporary::format(&old)?
        }
    };
    volumes::open(&old, ROOT, &key).map(drop)
}

fn move_back(partition: &Path, halves: &Halves) -> Result<()> {
    fresh_root(partition, halves)?;
    let root = volumes::mapped(ROOT);
    let room = volumes::span(
        ROOM,
        partition,
        halves.middle,
        work::size_of(partition) - halves.middle,
    )?;
    let key = volumes::temporary_key(&room)?.context("Luft's files aren't on this drive anymore")?;
    let moved = volumes::open(&room, MOVED, &key)?;
    {
        let top = Mounted::from(&[&moved, &root])?;
        if !volumes::holds_luft(&root) {
            top.add(&root)?;
        }
        move_off(&top, &moved, (50, 95))?;
    }
    volumes::close(MOVED)?;
    let emptied = if halves.unencrypted {
        work::size_of(&room)
    } else {
        HEADER
    };
    volumes::zero(&room, emptied)?;
    volumes::remove_span(ROOM)
}

fn grow() -> Result<()> {
    let root = volumes::mapped(ROOT);
    let top = Mounted::from(&[&root])?;
    top.resize(&root, "max")?;
    let _ = std::fs::remove_dir_all(top.path().join(STAGED));
    request::forget_sealed_key()?;
    requests::forget(top.path(), ERASE)
}

fn restart() -> Result<()> {
    Tool::new("systemctl").arg("reboot").status()
}

pub fn erase_at_start() -> Result<()> {
    let Some(stage) = requests::mark(ERASE).as_deref().and_then(Stage::read) else {
        return Ok(());
    };
    let partition = std::fs::canonicalize(ROOT_PARTITION)?;
    let root = volumes::mapped(ROOT);
    let source = if root.exists() { &root } else { &partition };
    sushi(&["show", "erasing"]);
    let halves = match stage {
        Stage::Grow => {
            grow()?;
            show(100);
            sushi(&["show", "boot-up"]);
            eprintln!("This computer is erased and waits for its owner");
            return Ok(());
        }
        Stage::Waiting => {
            let Some(halves) = plan(&partition, source)? else {
                sushi(&["show", "boot-up"]);
                return Ok(());
            };
            mark("away", &halves)?;
            halves
        }
        Stage::Away(halves) => halves,
        Stage::Back(halves) => {
            move_back(&partition, &halves)?;
            requests::advance(ERASE, "grow")?;
            return restart();
        }
    };
    move_away(&partition, source, &halves)?;
    mark("back", &halves)?;
    move_back(&partition, &halves)?;
    requests::advance(ERASE, "grow")?;
    restart()
}
