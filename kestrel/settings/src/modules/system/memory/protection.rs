use zbus::{Connection, Variant};

use super::cgroup::{Unit, UserManager};
use crate::shared::system::SystemdProxy;

pub struct Protection {
    systemd: SystemdProxy<'static>,
    budget: u64,
    held: Vec<String>,
}

impl Protection {
    pub async fn new(session: &Connection, manager: &UserManager) -> zbus::Result<Self> {
        let mut protection = Self {
            systemd: SystemdProxy::new(session).await?,
            budget: manager.focus_budget(),
            held: Vec::new(),
        };
        protection.held = manager.protected_leftovers();
        protection.hold(Vec::new()).await;
        Ok(protection)
    }

    pub fn budget(&self) -> u64 {
        self.budget
    }

    pub async fn give(&mut self, unit: Option<&Unit>) {
        let chain = unit.map_or_else(Vec::new, |unit| {
            unit.slices
                .iter()
                .cloned()
                .chain([unit.name.clone()])
                .collect()
        });
        if chain != self.held {
            self.hold(chain).await;
        }
    }

    async fn hold(&mut self, chain: Vec<String>) {
        let released: Vec<String> = self
            .held
            .iter()
            .filter(|name| !chain.contains(name))
            .cloned()
            .collect();
        for name in &released {
            self.set(name, 0).await;
        }
        for name in chain.iter().filter(|name| !self.held.contains(name)) {
            self.set(name, self.budget).await;
        }
        self.held = chain;
    }

    async fn set(&self, unit: &str, bytes: u64) {
        if let Err(error) = self
            .systemd
            .set_unit_properties(unit, true, &[("MemoryLow", Variant::U64(bytes))])
            .await
        {
            eprintln!("Couldn't change how much of {unit}'s memory is kept: {error}");
        }
    }
}
