use std::collections::{BTreeMap, BTreeSet};
use std::io;

use super::identity;
use crate::ports::{self, Port};
use crate::store;

const STORE: &str = "/var/lib/luft-firewall/extension-ports";

#[derive(Default)]
pub struct Extensions {
    agreed: BTreeSet<(u32, Port)>,
    listening: BTreeMap<String, BTreeSet<Port>>,
}

fn parse(line: &str) -> Option<(u32, Port)> {
    let (uid, port) = line.split_once(' ')?;
    Some((uid.parse().ok()?, ports::parse(port)?))
}

impl Extensions {
    pub fn load() -> io::Result<Self> {
        Ok(Self {
            agreed: store::read(STORE)?.lines().filter_map(parse).collect(),
            listening: BTreeMap::new(),
        })
    }

    pub fn new_to(&self, uid: u32, ports: &BTreeSet<Port>) -> Vec<Port> {
        ports
            .iter()
            .filter(|port| !self.agreed.contains(&(uid, **port)))
            .copied()
            .collect()
    }

    pub fn agree(&mut self, uid: u32, ports: &[Port]) -> io::Result<()> {
        let mut agreed = self.agreed.clone();
        agreed.extend(ports.iter().map(|port| (uid, *port)));
        let text: String = agreed
            .iter()
            .map(|(uid, port)| format!("{uid} {port}\n"))
            .collect();
        store::replace(STORE, &text)?;
        self.agreed = agreed;
        Ok(())
    }

    pub fn listen(&mut self, unit: String, ports: BTreeSet<Port>) {
        if ports.is_empty() {
            self.listening.remove(&unit);
        } else {
            self.listening.insert(unit, ports);
        }
    }

    pub fn retain_alive(&mut self) {
        self.listening.retain(|unit, _| identity::alive(unit));
    }

    pub fn listening(&self) -> impl Iterator<Item = (&String, &Port)> {
        self.listening
            .iter()
            .flat_map(|(unit, ports)| ports.iter().map(move |port| (unit, port)))
    }
}
