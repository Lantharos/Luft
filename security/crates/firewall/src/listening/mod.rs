use std::fs::File;

use anyhow::Context;
use aya::Ebpf;
use aya::maps::{HashMap, MapData, RingBuf};
use aya::programs::{CgroupAttachMode, CgroupSock, CgroupSockAddr};
use tokio::io::Interest;
use tokio::io::unix::AsyncFd;

use crate::ports::{Port, Protocol};

const ROOT: &str = "/sys/fs/cgroup";
const BINDS: [&str; 2] = ["bind4", "bind6"];
const SOCKETS: [&str; 3] = ["post_bind4", "post_bind6", "sock_release"];
const BOUND: u8 = 2;
const CHANGE_BOUND: u8 = 1;
const CHANGE_RELEASED: u8 = 2;

static OBJECT: &[u8] = aya::include_bytes_aligned!(concat!(env!("OUT_DIR"), "/listening.bpf.o"));

#[derive(Debug)]
pub enum Change {
    Bound { cookie: u64, pid: u32, port: Port },
    Released { cookie: u64 },
}

fn parse(event: &[u8]) -> Option<Change> {
    let cookie = u64::from_ne_bytes(event.get(..8)?.try_into().ok()?);
    let pid = u32::from_ne_bytes(event.get(8..12)?.try_into().ok()?);
    let number = u16::from_ne_bytes(event.get(12..14)?.try_into().ok()?);
    match *event.get(15)? {
        CHANGE_BOUND => Some(Change::Bound {
            cookie,
            pid,
            port: Port {
                number,
                protocol: Protocol::of(*event.get(14)?)?,
            },
        }),
        CHANGE_RELEASED => Some(Change::Released { cookie }),
        _ => None,
    }
}

pub struct Watcher {
    ebpf: Ebpf,
    events: AsyncFd<RingBuf<MapData>>,
}

impl Watcher {
    pub fn start() -> anyhow::Result<Self> {
        let mut ebpf = Ebpf::load(OBJECT).context("Couldn't load the bind watcher")?;
        let root = File::open(ROOT).context("Couldn't open the cgroup tree")?;
        for name in BINDS {
            let program: &mut CgroupSockAddr = ebpf.program_mut(name).context(name)?.try_into()?;
            program
                .load()
                .with_context(|| format!("Couldn't load {name}"))?;
            program.attach(&root, CgroupAttachMode::Single)?;
        }
        for name in SOCKETS {
            let program: &mut CgroupSock = ebpf.program_mut(name).context(name)?.try_into()?;
            program
                .load()
                .with_context(|| format!("Couldn't load {name}"))?;
            program.attach(&root, CgroupAttachMode::Single)?;
        }
        let events = RingBuf::try_from(ebpf.take_map("events").context("events")?)?;
        let events = unsafe { AsyncFd::register_with_interest(events, Interest::READABLE)? };
        Ok(Self { ebpf, events })
    }

    pub fn adopt(&mut self, cookies: impl Iterator<Item = u64>) -> anyhow::Result<()> {
        let mut sockets: HashMap<_, u64, u8> =
            HashMap::try_from(self.ebpf.map_mut("sockets").context("sockets")?)?;
        for cookie in cookies {
            sockets.insert(&cookie, &BOUND, 0)?;
        }
        Ok(())
    }

    pub async fn next(&mut self) -> std::io::Result<Vec<Change>> {
        loop {
            let mut ready = self.events.readable_mut().await?;
            let events = ready.get_inner_mut();
            let mut changes = Vec::new();
            while let Some(event) = events.next() {
                changes.extend(parse(&event));
            }
            if !changes.is_empty() {
                return Ok(changes);
            }
            ready.clear_ready();
        }
    }
}
