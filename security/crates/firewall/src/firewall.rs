use std::collections::BTreeSet;
use std::time::Instant;

use zbus::OwnedObjectPath;

use crate::apps::{Access, Apps, Decisions, Identity, identity};
use crate::listening::Change;
use crate::network::Layout;
use crate::ports::{self, Opened, Port};
use crate::rules::{self, Sets};

pub struct Firewall {
    layout: Layout,
    ports: Opened,
    apps: Apps,
    post: BTreeSet<String>,
    loaded: Sets,
}

#[derive(Default)]
pub struct Followed {
    pub reclassified: bool,
    pub home: bool,
    pub waiting: bool,
}

impl Firewall {
    pub async fn start(layout: Layout) -> anyhow::Result<Self> {
        let mut firewall = Self {
            layout,
            ports: ports::load()?,
            apps: Apps::load()?,
            post: BTreeSet::new(),
            loaded: Sets::new(),
        };
        let sets = firewall.sets();
        rules::load(&rules::everything(&sets))
            .await
            .map_err(anyhow::Error::msg)?;
        firewall.loaded = sets;
        Ok(firewall)
    }

    fn sets(&mut self) -> Sets {
        self.apps.prune();
        self.post.retain(|unit| identity::alive(unit));
        rules::sets(
            &self.layout,
            &self.ports,
            &self.apps.reachable(),
            !self.post.is_empty(),
        )
    }

    async fn load(&mut self, renew: bool) -> Result<(), String> {
        let sets = self.sets();
        let script = rules::changes(&self.loaded, &sets, renew);
        if !script.is_empty() {
            rules::load(&script).await?;
            self.loaded = sets;
        }
        Ok(())
    }

    async fn reload(&mut self, renew: bool) {
        if let Err(error) = self.load(renew).await {
            eprintln!("{error}");
        }
    }

    pub fn unclassified(&self) -> &[(OwnedObjectPath, String)] {
        &self.layout.unclassified
    }

    pub fn home_interfaces(&self) -> Vec<String> {
        let mut interfaces: Vec<String> = self
            .layout
            .home
            .iter()
            .map(|(interface, _)| interface.clone())
            .collect();
        interfaces.dedup();
        interfaces
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

    pub fn waiting(&self) -> BTreeSet<(u32, Identity)> {
        if self.layout.home.is_empty() && self.layout.hosted.is_empty() && !self.layout.private {
            return BTreeSet::new();
        }
        self.apps.waiting()
    }

    pub async fn follow(&mut self, layout: Layout) -> Followed {
        let waiting = self.waiting();
        let reclassified = layout.unclassified != self.layout.unclassified;
        let home = self.home_interfaces();
        self.layout = layout;
        self.reload(false).await;
        Followed {
            reclassified,
            home: home != self.home_interfaces(),
            waiting: waiting != self.waiting(),
        }
    }

    pub fn deadline(&self) -> Option<Instant> {
        self.apps.deadline()
    }

    pub async fn observe(&mut self, changes: Vec<Change>) -> bool {
        let waiting = self.waiting();
        let reachable = self.apps.reachable();
        let mut rebound = false;
        for change in changes {
            rebound |= self.apps.observe(change);
        }
        self.apps.prune_questions();
        let posting = self.post.len();
        self.post.retain(|unit| identity::alive(unit));
        if rebound || reachable != self.apps.reachable() || posting != self.post.len() {
            self.reload(rebound).await;
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

    pub async fn decide(&mut self, owner: (u32, Identity), access: Access) -> Result<(), String> {
        self.apps
            .decide(owner, access)
            .map_err(|error| format!("Couldn't keep what the app may do: {error}"))?;
        self.load(false).await
    }

    pub async fn forget(&mut self, owner: &(u32, Identity)) -> Result<(), String> {
        self.apps
            .forget(owner)
            .map_err(|error| format!("Couldn't forget what the app may do: {error}"))?;
        self.load(false).await
    }

    pub async fn open_post(&mut self, unit: String, open: bool) -> Result<(), String> {
        if open {
            self.post.insert(unit);
        } else {
            self.post.remove(&unit);
        }
        self.load(false).await
    }

    pub fn new_to(&self, uid: u32, ports: &BTreeSet<Port>) -> Vec<Port> {
        self.apps.new_to(uid, ports)
    }

    pub fn widens(&self, unit: &str, ports: &BTreeSet<Port>) -> bool {
        self.apps.widens(unit, ports)
    }

    pub async fn declare(
        &mut self,
        uid: u32,
        unit: String,
        ports: BTreeSet<Port>,
    ) -> Result<(), String> {
        self.apps
            .declare(uid, unit, ports)
            .map_err(|error| format!("Couldn't keep the ports extensions listen on: {error}"))?;
        self.load(true).await
    }
}
