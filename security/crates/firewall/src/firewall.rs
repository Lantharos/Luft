use std::collections::BTreeSet;
use std::time::Instant;

use zbus::OwnedObjectPath;

use crate::apps::{Access, Apps, Decisions, Identity, identity};
use crate::listening::Change;
use crate::network::Layout;
use crate::ports::{self, Opened, Port};
use crate::rules;

pub struct Firewall {
    layout: Layout,
    ports: Opened,
    apps: Apps,
    /// The units of the people whose Post may be found, whose port is open on home networks.
    post: BTreeSet<String>,
    loaded: String,
}

#[derive(Default)]
pub struct Followed {
    pub reclassified: bool,
    pub waiting: bool,
}

impl Firewall {
    pub async fn start(layout: Layout) -> anyhow::Result<Self> {
        let mut firewall = Self {
            layout,
            ports: ports::load()?,
            apps: Apps::load()?,
            post: BTreeSet::new(),
            loaded: String::new(),
        };
        firewall.load(false).await.map_err(anyhow::Error::msg)?;
        Ok(firewall)
    }

    async fn load(&mut self, refresh: bool) -> Result<(), String> {
        self.apps.prune();
        self.post.retain(|unit| identity::alive(unit));
        let script = rules::ruleset(&self.layout, &self.ports, &self.apps.reachable(), !self.post.is_empty());
        if refresh || script != self.loaded {
            rules::load(&script).await?;
            self.loaded = script;
        }
        Ok(())
    }

    async fn reload(&mut self, refresh: bool) {
        if let Err(error) = self.load(refresh).await {
            eprintln!("{error}");
        }
    }

    pub fn unclassified(&self) -> &[(OwnedObjectPath, String)] {
        &self.layout.unclassified
    }

    pub fn ports(&self) -> &Opened {
        &self.ports
    }

    pub fn cookies(&self) -> impl Iterator<Item = u64> + '_ {
        self.apps.cookies()
    }

    pub fn decisions(&self) -> &Decisions {
        self.apps.decisions()
    }

    pub fn waiting(&self) -> BTreeSet<(Identity, u32)> {
        if self.layout.home.is_empty() {
            return BTreeSet::new();
        }
        self.apps.waiting()
    }

    pub async fn follow(&mut self, layout: Layout) -> Followed {
        let waiting = self.waiting();
        let reclassified = layout.unclassified != self.layout.unclassified;
        self.layout = layout;
        self.reload(false).await;
        Followed {
            reclassified,
            waiting: waiting != self.waiting(),
        }
    }

    pub fn deadline(&self) -> Option<Instant> {
        self.apps.deadline()
    }

    pub async fn observe(&mut self, changes: Vec<Change>) -> bool {
        let waiting = self.waiting();
        let reachable = self.apps.reachable();
        for change in changes {
            self.apps.observe(change);
        }
        self.apps.prune_questions();
        let posting = self.post.len();
        self.post.retain(|unit| identity::alive(unit));
        if reachable != self.apps.reachable() || posting != self.post.len() {
            self.reload(true).await;
        }
        waiting != self.waiting()
    }

    pub fn settle(&mut self) -> bool {
        let waiting = self.waiting();
        self.apps.settle(Instant::now());
        waiting != self.waiting()
    }

    pub async fn set_ports(&mut self, ports: Opened) -> Result<(), String> {
        ports::save(&ports).map_err(|error| format!("Couldn't keep the open ports: {error}"))?;
        self.ports = ports;
        self.load(false).await
    }

    pub async fn decide(&mut self, identity: Identity, access: Access) -> Result<(), String> {
        self.apps
            .decide(identity, access)
            .map_err(|error| format!("Couldn't keep what the app may do: {error}"))?;
        self.load(true).await
    }

    pub async fn forget(&mut self, identity: &Identity) -> Result<(), String> {
        self.apps
            .forget(identity)
            .map_err(|error| format!("Couldn't forget what the app may do: {error}"))?;
        self.load(true).await
    }

    pub async fn open_post(&mut self, unit: String, open: bool) -> Result<(), String> {
        if open {
            self.post.insert(unit);
        } else {
            self.post.remove(&unit);
        }
        self.load(false).await
    }

    pub async fn declare(&mut self, unit: String, ports: BTreeSet<Port>) -> Result<(), String> {
        self.apps.declare(unit, ports);
        self.load(true).await
    }
}
