use std::fs;
use std::os::unix::fs::MetadataExt;

use crate::system::procfile::ProcFile;

const KERNEL_THREAD: u64 = 0x0020_0000;
const COMM_LENGTH: usize = 15;

pub struct Stat {
    pub name: String,
    pub state: u8,
    pub ppid: u32,
    pub flags: u64,
    pub user: u64,
    pub system: u64,
    pub nice: i32,
    pub threads: u32,
    pub start: u64,
}

impl Stat {
    pub fn parse(bytes: &[u8]) -> Option<Self> {
        let open = bytes.iter().position(|byte| *byte == b'(')?;
        let close = bytes.iter().rposition(|byte| *byte == b')')?;
        let name = String::from_utf8_lossy(bytes.get(open + 1..close)?).into_owned();
        let rest = std::str::from_utf8(bytes.get(close + 2..)?).ok()?;
        let fields: Vec<&str> = rest.split_ascii_whitespace().collect();
        let number = |index: usize| {
            fields
                .get(index)
                .and_then(|value| value.parse::<u64>().ok())
        };
        Some(Self {
            name,
            state: *fields.first()?.as_bytes().first()?,
            ppid: number(1)? as u32,
            flags: number(6)?,
            user: number(11)?,
            system: number(12)?,
            nice: fields.get(16)?.parse().ok()?,
            threads: number(17)? as u32,
            start: number(19)?,
        })
    }

    pub fn kernel_thread(&self, pid: u32) -> bool {
        self.flags & KERNEL_THREAD != 0 || pid == 2 || self.ppid == 2
    }
}

#[derive(Default, Clone, Copy)]
pub struct Rates {
    pub cpu: f32,
    pub memory: u64,
    pub read: f32,
    pub write: f32,
}

pub struct Process {
    pub pid: u32,
    pub ppid: u32,
    pub uid: u32,
    pub start: u64,
    pub name: String,
    pub command: String,
    pub cgroup: String,
    pub app: Option<String>,
    pub state: u8,
    pub nice: i32,
    pub threads: u32,
    pub user: u64,
    pub system: u64,
    pub read_total: u64,
    pub write_total: u64,
    pub rates: Rates,
    io_sampled: bool,
    stat: ProcFile,
    statm: ProcFile,
    io: Option<ProcFile>,
}

pub enum Opened {
    Process(Box<Process>),
    KernelThread,
}

impl Process {
    pub fn open(pid: u32) -> Option<Opened> {
        let base = format!("/proc/{pid}");
        let mut stat_file = ProcFile::open(format!("{base}/stat")).ok()?;
        let stat = Stat::parse(stat_file.read().ok()?)?;
        if stat.kernel_thread(pid) {
            return Some(Opened::KernelThread);
        }
        let uid = fs::metadata(&base).ok()?.uid();
        let command = fs::read(format!("{base}/cmdline")).unwrap_or_default();
        let mut process = Self {
            pid,
            ppid: stat.ppid,
            uid,
            start: stat.start,
            name: display_name(&stat.name, &command),
            command: joined(&command),
            cgroup: read_cgroup(pid),
            app: None,
            state: stat.state,
            nice: stat.nice,
            threads: stat.threads,
            user: stat.user,
            system: stat.system,
            read_total: 0,
            write_total: 0,
            rates: Rates::default(),
            io_sampled: false,
            stat: stat_file,
            statm: ProcFile::open(format!("{base}/statm")).ok()?,
            io: ProcFile::open(format!("{base}/io")).ok(),
        };
        if let Some((read, write)) = process.read_io() {
            process.read_total = read;
            process.write_total = write;
            process.io_sampled = true;
        }
        Some(Opened::Process(Box::new(process)))
    }

    pub fn update(&mut self, elapsed: f64, ticks: f64, page: u64, io: bool) -> bool {
        let Some(stat) = self.stat.read().ok().and_then(Stat::parse) else {
            return false;
        };
        if stat.start != self.start {
            return false;
        }
        let spent = (stat.user + stat.system).saturating_sub(self.user + self.system);
        self.rates.cpu = (spent as f64 / ticks / elapsed * 100.0) as f32;
        self.ppid = stat.ppid;
        self.state = stat.state;
        self.nice = stat.nice;
        self.threads = stat.threads;
        self.user = stat.user;
        self.system = stat.system;
        if let Ok(text) = self.statm.text() {
            let mut fields = text
                .split_ascii_whitespace()
                .skip(1)
                .map(|value| value.parse::<u64>().unwrap_or(0));
            let resident = fields.next().unwrap_or(0);
            let shared = fields.next().unwrap_or(0);
            self.rates.memory = resident.saturating_sub(shared) * page;
        }
        let current = if io { self.read_io() } else { None };
        match current {
            Some((read, write)) if self.io_sampled => {
                self.rates.read = (read.saturating_sub(self.read_total) as f64 / elapsed) as f32;
                self.rates.write = (write.saturating_sub(self.write_total) as f64 / elapsed) as f32;
            }
            _ => {
                self.rates.read = 0.0;
                self.rates.write = 0.0;
            }
        }
        if let Some((read, write)) = current {
            self.read_total = read;
            self.write_total = write;
        }
        self.io_sampled = current.is_some();
        true
    }

    pub fn refresh_cgroup(&mut self) -> bool {
        let cgroup = read_cgroup(self.pid);
        let changed = cgroup != self.cgroup;
        self.cgroup = cgroup;
        changed
    }

    fn read_io(&mut self) -> Option<(u64, u64)> {
        let text = self.io.as_mut()?.text().ok()?;
        let mut read = None;
        let mut write = None;
        for line in text.lines() {
            if let Some(value) = line.strip_prefix("read_bytes: ") {
                read = value.parse().ok();
            } else if let Some(value) = line.strip_prefix("write_bytes: ") {
                write = value.parse().ok();
            }
        }
        Some((read?, write?))
    }
}

pub fn read_cgroup(pid: u32) -> String {
    let text = fs::read_to_string(format!("/proc/{pid}/cgroup")).unwrap_or_default();
    text.lines()
        .find_map(|line| line.strip_prefix("0::"))
        .unwrap_or_default()
        .to_owned()
}

fn joined(command: &[u8]) -> String {
    let text = String::from_utf8_lossy(command);
    text.trim_end_matches('\0').replace('\0', " ")
}

fn display_name(comm: &str, command: &[u8]) -> String {
    if comm.len() < COMM_LENGTH {
        return comm.to_owned();
    }
    command
        .split(|byte| *byte == 0)
        .take(2)
        .map(String::from_utf8_lossy)
        .filter_map(|argument| {
            let base = argument
                .rsplit('/')
                .next()?
                .split_whitespace()
                .next()?
                .to_owned();
            base.starts_with(comm).then_some(base)
        })
        .next()
        .unwrap_or_else(|| comm.to_owned())
}
