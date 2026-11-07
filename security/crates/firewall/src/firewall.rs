use std::collections::BTreeSet;

use zbus::OwnedObjectPath;

use crate::network::Layout;
use crate::ports::{self, Port};
use crate::rules;

pub struct Firewall {
    layout: Layout,
    ports: BTreeSet<Port>,
    loaded: String,
}

impl Firewall {
    pub async fn start(layout: Layout) -> anyhow::Result<Self> {
        let mut firewall = Self {
            layout,
            ports: ports::load()?,
            loaded: String::new(),
        };
        firewall.load().await.map_err(anyhow::Error::msg)?;
        Ok(firewall)
    }

    async fn load(&mut self) -> Result<(), String> {
        let script = rules::ruleset(&self.layout, &self.ports);
        if script != self.loaded {
            rules::load(&script).await?;
            self.loaded = script;
        }
        Ok(())
    }

    pub fn unclassified(&self) -> &[(OwnedObjectPath, String)] {
        &self.layout.unclassified
    }

    pub fn ports(&self) -> &BTreeSet<Port> {
        &self.ports
    }

    pub async fn follow(&mut self, layout: Layout) -> bool {
        let reclassified = layout.unclassified != self.layout.unclassified;
        self.layout = layout;
        if let Err(error) = self.load().await {
            eprintln!("{error}");
        }
        reclassified
    }

    pub async fn set_ports(&mut self, ports: BTreeSet<Port>) -> Result<(), String> {
        ports::save(&ports).map_err(|error| format!("Couldn't keep the open ports: {error}"))?;
        self.ports = ports;
        self.load().await
    }
}
