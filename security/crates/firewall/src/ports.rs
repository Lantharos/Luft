use std::collections::BTreeSet;
use std::fmt;
use std::io;

const STORE: &str = "/var/lib/luft-firewall/ports";
pub const HIGHEST_GUARDED: u16 = 1024;

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Protocol {
    Tcp,
    Udp,
}

impl Protocol {
    pub fn parse(name: &str) -> Option<Self> {
        match name {
            "tcp" => Some(Self::Tcp),
            "udp" => Some(Self::Udp),
            _ => None,
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Tcp => "tcp",
            Self::Udp => "udp",
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct Port {
    pub number: u16,
    pub protocol: Protocol,
}

impl Port {
    pub fn guarded(number: u16, protocol: &str) -> Option<Self> {
        Some(Self {
            number: Some(number).filter(|number| (1..=HIGHEST_GUARDED).contains(number))?,
            protocol: Protocol::parse(protocol)?,
        })
    }
}

impl fmt::Display for Port {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "{}/{}", self.number, self.protocol.name())
    }
}

pub fn load() -> io::Result<BTreeSet<Port>> {
    let text = match std::fs::read_to_string(STORE) {
        Err(error) if error.kind() == io::ErrorKind::NotFound => return Ok(BTreeSet::new()),
        read => read?,
    };
    Ok(text
        .lines()
        .filter_map(|line| {
            let (number, protocol) = line.split_once('/')?;
            Port::guarded(number.parse().ok()?, protocol)
        })
        .collect())
}

pub fn save(ports: &BTreeSet<Port>) -> io::Result<()> {
    let text: String = ports.iter().map(|port| format!("{port}\n")).collect();
    let staged = format!("{STORE}.new");
    std::fs::write(&staged, text)?;
    std::fs::rename(staged, STORE)
}
