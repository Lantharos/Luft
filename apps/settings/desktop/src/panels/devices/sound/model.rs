use std::collections::BTreeMap;

use libpulse_binding::channelmap::Map;
use libpulse_binding::context::ext_stream_restore;
use libpulse_binding::context::introspect::{SinkInfo, SinkInputInfo, SourceInfo};
use libpulse_binding::proplist::properties;
use libpulse_binding::volume::{ChannelVolumes, Volume};
use serde::Serialize;

use super::card::{Card, CardView, Choice, Ports};

pub const ALERT_STREAM: &str = "sink-input-by-media-role:event";

pub struct Device {
    name: String,
    description: String,
    pub volume: ChannelVolumes,
    pub map: Map,
    muted: bool,
    ports: Ports,
}

pub struct App {
    name: String,
    pub volume: ChannelVolumes,
    muted: bool,
    output: u32,
}

pub struct Alert {
    pub volume: ChannelVolumes,
    pub map: Map,
    pub device: Option<String>,
    pub muted: bool,
}

#[derive(Default)]
pub struct State {
    pub ready: bool,
    pub outputs: BTreeMap<u32, Device>,
    pub inputs: BTreeMap<u32, Device>,
    pub apps: BTreeMap<u32, App>,
    pub cards: BTreeMap<u32, Card>,
    pub default_output: String,
    pub default_input: String,
    pub alert: Option<Alert>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Snapshot<'a> {
    outputs: Vec<DeviceView<'a>>,
    inputs: Vec<DeviceView<'a>>,
    apps: Vec<AppView<'a>>,
    cards: Vec<CardView<'a>>,
    default_output: &'a str,
    default_input: &'a str,
    alert_volume: Option<f64>,
}

#[derive(Serialize)]
struct DeviceView<'a> {
    index: u32,
    name: &'a str,
    description: &'a str,
    volume: f64,
    muted: bool,
    balance: Option<f32>,
    port: Option<&'a str>,
    ports: &'a [Choice],
}

#[derive(Serialize)]
struct AppView<'a> {
    index: u32,
    name: &'a str,
    volume: f64,
    muted: bool,
    output: u32,
}

pub fn fraction(volume: &ChannelVolumes) -> f64 {
    f64::from(volume.max().0) / f64::from(Volume::NORMAL.0)
}

pub fn scaled(volume: &ChannelVolumes, fraction: f64) -> ChannelVolumes {
    let mut scaled = *volume;
    scaled.scale(Volume(
        (fraction.max(0.0) * f64::from(Volume::NORMAL.0)).round() as u32,
    ));
    scaled
}

impl Device {
    pub fn from_sink(info: &SinkInfo) -> Self {
        Self {
            name: info.name.as_deref().unwrap_or_default().to_owned(),
            description: info.description.as_deref().unwrap_or_default().to_owned(),
            volume: info.volume,
            map: info.channel_map,
            muted: info.mute,
            ports: Ports::of_sink(&info.ports, info.active_port.as_deref()),
        }
    }

    pub fn from_source(info: &SourceInfo) -> Option<Self> {
        if info.monitor_of_sink.is_some() {
            return None;
        }
        Some(Self {
            name: info.name.as_deref().unwrap_or_default().to_owned(),
            description: info.description.as_deref().unwrap_or_default().to_owned(),
            volume: info.volume,
            map: info.channel_map,
            muted: info.mute,
            ports: Ports::of_source(&info.ports, info.active_port.as_deref()),
        })
    }

    fn view(&self, index: u32) -> DeviceView<'_> {
        DeviceView {
            index,
            name: &self.name,
            description: &self.description,
            volume: fraction(&self.volume),
            muted: self.muted,
            balance: self
                .map
                .can_balance()
                .then(|| self.volume.get_balance(&self.map)),
            port: self.ports.active.as_deref(),
            ports: &self.ports.choices,
        }
    }
}

impl App {
    pub fn from_sink_input(info: &SinkInputInfo) -> Option<Self> {
        let role = info.proplist.get_str(properties::MEDIA_ROLE);
        if !info.has_volume || role.as_deref() == Some("event") {
            return None;
        }
        let name = info
            .proplist
            .get_str(properties::APPLICATION_NAME)
            .or_else(|| info.name.as_deref().map(str::to_owned))?;
        Some(Self {
            name,
            volume: info.volume,
            muted: info.mute,
            output: info.sink,
        })
    }

    fn view(&self, index: u32) -> AppView<'_> {
        AppView {
            index,
            name: &self.name,
            volume: fraction(&self.volume),
            muted: self.muted,
            output: self.output,
        }
    }
}

impl Alert {
    pub fn from_restore(info: &ext_stream_restore::Info) -> Self {
        Self {
            volume: info.volume,
            map: info.channel_map,
            device: info.device.as_deref().map(str::to_owned),
            muted: info.mute,
        }
    }

    pub fn fallback() -> Self {
        let mut map = Map::default();
        map.init_mono();
        let mut volume = ChannelVolumes::default();
        volume.set(1, Volume::NORMAL);
        Self {
            volume,
            map,
            device: None,
            muted: false,
        }
    }
}

impl State {
    pub fn snapshot(&self) -> Snapshot<'_> {
        Snapshot {
            outputs: self
                .outputs
                .iter()
                .map(|(index, device)| device.view(*index))
                .collect(),
            inputs: self
                .inputs
                .iter()
                .map(|(index, device)| device.view(*index))
                .collect(),
            apps: self
                .apps
                .iter()
                .map(|(index, app)| app.view(*index))
                .collect(),
            cards: self
                .cards
                .iter()
                .filter(|(_, card)| card.selectable())
                .map(|(index, card)| card.view(*index))
                .collect(),
            default_output: &self.default_output,
            default_input: &self.default_input,
            alert_volume: self.alert.as_ref().map(|alert| fraction(&alert.volume)),
        }
    }
}
