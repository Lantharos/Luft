use std::collections::HashMap;

use super::identity::{self, Identity};
use crate::ports::{self, Port};
use crate::store;

const STORE: &str = "/run/luft-firewall/listeners";

#[derive(Clone, PartialEq, Debug)]
pub struct Listener {
    pub unit: String,
    pub identity: Identity,
    pub uid: u32,
    pub port: Port,
}

impl Listener {
    pub fn owner(&self) -> (u32, Identity) {
        (self.uid, self.identity.clone())
    }
}

#[derive(Default)]
pub struct Listeners(HashMap<u64, Listener>);

fn parse(line: &str) -> Option<(u64, Listener)> {
    let mut fields = line.splitn(6, ' ');
    let cookie = fields.next()?.parse().ok()?;
    let uid = fields.next()?.parse().ok()?;
    let port = ports::parse(fields.next()?)?;
    let unit = fields.next()?.to_owned();
    let identity = Identity::parse(fields.next()?, fields.next()?)?;
    Some((
        cookie,
        Listener {
            unit,
            identity,
            uid,
            port,
        },
    ))
}

impl Listeners {
    pub fn restore() -> Self {
        let text = store::read(STORE).unwrap_or_else(|error| {
            eprintln!("Couldn't read which apps were listening: {error}");
            String::new()
        });
        let mut listeners = Self(text.lines().filter_map(parse).collect());
        listeners.retain_alive();
        listeners
    }

    fn save(&self) {
        let text: String = self
            .0
            .iter()
            .map(|(cookie, listener)| {
                format!(
                    "{cookie} {} {} {} {}\n",
                    listener.uid, listener.port, listener.unit, listener.identity
                )
            })
            .collect();
        if let Err(error) = store::replace(STORE, &text) {
            eprintln!("Couldn't keep which apps are listening: {error}");
        }
    }

    pub fn cookies(&self) -> impl Iterator<Item = u64> + '_ {
        self.0.keys().copied()
    }

    pub fn iter(&self) -> impl Iterator<Item = &Listener> {
        self.0.values()
    }

    pub fn get(&self, cookie: u64) -> Option<&Listener> {
        self.0.get(&cookie)
    }

    pub fn insert(&mut self, cookie: u64, listener: Listener) {
        self.0.insert(cookie, listener);
        self.save();
    }

    pub fn remove(&mut self, cookie: u64) -> Option<Listener> {
        let removed = self.0.remove(&cookie);
        if removed.is_some() {
            self.save();
        }
        removed
    }

    pub fn retain_alive(&mut self) {
        let before = self.0.len();
        self.0.retain(|_, listener| identity::alive(&listener.unit));
        if self.0.len() != before {
            self.save();
        }
    }
}
