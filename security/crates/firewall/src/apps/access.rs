use std::collections::BTreeMap;
use std::io;

use super::identity::Identity;
use crate::store;

const STORE: &str = "/var/lib/luft-firewall/apps";

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Access {
    Home,
    Anywhere,
    Blocked,
}

impl Access {
    pub fn parse(name: &str) -> Option<Self> {
        match name {
            "home" => Some(Self::Home),
            "anywhere" => Some(Self::Anywhere),
            "blocked" => Some(Self::Blocked),
            _ => None,
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Home => "home",
            Self::Anywhere => "anywhere",
            Self::Blocked => "blocked",
        }
    }

    pub fn on_home(self) -> bool {
        self != Self::Blocked
    }
}

pub type Decisions = BTreeMap<(u32, Identity), Access>;

fn parse(line: &str) -> Option<((u32, Identity), Access)> {
    let mut fields = line.splitn(4, ' ');
    let access = Access::parse(fields.next()?)?;
    let uid = fields.next()?.parse().ok()?;
    let identity = Identity::parse(fields.next()?, fields.next()?)?;
    Some(((uid, identity), access))
}

pub fn load() -> io::Result<Decisions> {
    Ok(store::read(STORE)?.lines().filter_map(parse).collect())
}

pub fn save(decisions: &Decisions) -> io::Result<()> {
    let text: String = decisions
        .iter()
        .map(|((uid, identity), access)| format!("{} {uid} {identity}\n", access.name()))
        .collect();
    store::replace(STORE, &text)
}
