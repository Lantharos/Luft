use std::collections::BTreeSet;
use std::fmt;
use std::io;

const STORE: &str = "/var/lib/luft-firewall/ports";
const TCP: u8 = 6;
const UDP: u8 = 17;

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
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

    pub fn of(number: u8) -> Option<Self> {
        match number {
            TCP => Some(Self::Tcp),
            UDP => Some(Self::Udp),
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

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub struct Port {
    pub number: u16,
    pub protocol: Protocol,
}

impl Port {
    pub fn new(number: u16, protocol: &str) -> Option<Self> {
        Some(Self {
            number: Some(number).filter(|number| *number != 0)?,
            protocol: Protocol::parse(protocol)?,
        })
    }
}

impl fmt::Display for Port {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "{}/{}", self.number, self.protocol.name())
    }
}

pub fn parse(text: &str) -> Option<Port> {
    let (number, protocol) = text.split_once('/')?;
    Port::new(number.parse().ok()?, protocol)
}

pub fn load() -> io::Result<BTreeSet<Port>> {
    Ok(crate::store::read(STORE)?
        .lines()
        .filter_map(parse)
        .collect())
}

pub fn save(ports: &BTreeSet<Port>) -> io::Result<()> {
    let text: String = ports.iter().map(|port| format!("{port}\n")).collect();
    crate::store::replace(STORE, &text)
}
