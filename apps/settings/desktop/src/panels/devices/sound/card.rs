use libpulse_binding::context::introspect::{CardInfo, SinkPortInfo, SourcePortInfo};
use libpulse_binding::def::PortAvailable;
use libpulse_binding::proplist::properties;
use serde::Serialize;

#[derive(Serialize)]
pub struct Choice {
    name: String,
    description: String,
}

pub struct Card {
    description: String,
    profile: Option<String>,
    profiles: Vec<Choice>,
}

#[derive(Serialize)]
pub struct CardView<'a> {
    index: u32,
    description: &'a str,
    profile: Option<&'a str>,
    profiles: &'a [Choice],
}

pub struct Ports {
    pub active: Option<String>,
    pub choices: Vec<Choice>,
}

fn choice(
    name: Option<&str>,
    description: Option<&str>,
    usable: bool,
    active: Option<&str>,
) -> Option<Choice> {
    let name = name.filter(|name| !name.is_empty())?;
    (usable || active == Some(name)).then(|| Choice {
        name: name.to_owned(),
        description: description
            .filter(|description| !description.is_empty())
            .unwrap_or(name)
            .to_owned(),
    })
}

impl Ports {
    fn collect<'p>(
        ports: impl Iterator<Item = (Option<&'p str>, Option<&'p str>, PortAvailable)>,
        active: Option<&str>,
    ) -> Self {
        Self {
            choices: ports
                .filter_map(|(name, description, available)| {
                    choice(name, description, available != PortAvailable::No, active)
                })
                .collect(),
            active: active.map(str::to_owned),
        }
    }

    pub fn of_sink(ports: &[SinkPortInfo], active: Option<&SinkPortInfo>) -> Self {
        Self::collect(
            ports.iter().map(|port| {
                (
                    port.name.as_deref(),
                    port.description.as_deref(),
                    port.available,
                )
            }),
            active.and_then(|port| port.name.as_deref()),
        )
    }

    pub fn of_source(ports: &[SourcePortInfo], active: Option<&SourcePortInfo>) -> Self {
        Self::collect(
            ports.iter().map(|port| {
                (
                    port.name.as_deref(),
                    port.description.as_deref(),
                    port.available,
                )
            }),
            active.and_then(|port| port.name.as_deref()),
        )
    }
}

impl Card {
    pub fn from_info(info: &CardInfo) -> Self {
        let profile = info
            .active_profile
            .as_deref()
            .and_then(|profile| profile.name.as_deref());
        Self {
            description: info
                .proplist
                .get_str(properties::DEVICE_DESCRIPTION)
                .or_else(|| info.name.as_deref().map(str::to_owned))
                .unwrap_or_default(),
            profiles: info
                .profiles
                .iter()
                .filter_map(|option| {
                    choice(
                        option.name.as_deref(),
                        option.description.as_deref(),
                        option.available,
                        profile,
                    )
                })
                .collect(),
            profile: profile.map(str::to_owned),
        }
    }

    pub fn selectable(&self) -> bool {
        self.profiles.len() > 1
    }

    pub fn view(&self, index: u32) -> CardView<'_> {
        CardView {
            index,
            description: &self.description,
            profile: self.profile.as_deref(),
            profiles: &self.profiles,
        }
    }
}
