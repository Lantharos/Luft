use std::collections::BTreeMap;
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

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Networks {
    Home,
    Anywhere,
}

impl Networks {
    pub fn parse(name: &str) -> Option<Self> {
        match name {
            "home" => Some(Self::Home),
            "anywhere" => Some(Self::Anywhere),
            _ => None,
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Home => "home",
            Self::Anywhere => "anywhere",
        }
    }
}

pub type Opened = BTreeMap<Port, Networks>;

pub fn parse(text: &str) -> Option<Port> {
    let (number, protocol) = text.split_once('/')?;
    Port::new(number.parse().ok()?, protocol)
}

fn parse_opened(line: &str) -> Option<(Port, Networks)> {
    let mut fields = line.split(' ');
    let port = parse(fields.next()?)?;
    let networks = fields
        .next()
        .map_or(Some(Networks::Home), Networks::parse)?;
    Some((port, networks))
}

pub fn load() -> io::Result<Opened> {
    Ok(crate::store::read(STORE)?
        .lines()
        .filter_map(parse_opened)
        .collect())
}

pub fn save(ports: &Opened) -> io::Result<()> {
    let text: String = ports
        .iter()
        .map(|(port, networks)| match networks {
            Networks::Home => format!("{port}\n"),
            Networks::Anywhere => format!("{port} anywhere\n"),
        })
        .collect();
    crate::store::replace(STORE, &text)
}
