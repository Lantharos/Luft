mod card;
mod modes;
mod output;

use std::io;
use std::path::{Path, PathBuf};

use drm::Device;
use drm::control::{Device as ControlDevice, Mode, ResourceHandles, connector, crtc};
use sushi_scene::Rect;
use sushi_scene::tiny_skia::Pixmap;

pub use card::Card;
pub use modes::ModeHints;
pub use output::Output;

pub struct Display {
    card: Card,
    outputs: Vec<Output>,
}

struct Planned {
    connector: connector::Handle,
    crtc: crtc::Handle,
    mode: Mode,
    inherited: Option<Mode>,
    internal: bool,
}

const SEAMLESS_DRIVERS: [&str; 2] = ["i915", "xe"];
const SEAMLESS_ON_INTERNAL_PANELS: [&str; 1] = ["amdgpu"];

fn is_internal(interface: connector::Interface) -> bool {
    matches!(
        interface,
        connector::Interface::EmbeddedDisplayPort
            | connector::Interface::LVDS
            | connector::Interface::DSI
    )
}

fn same_timing(a: &Mode, b: &Mode) -> bool {
    a.clock() == b.clock()
        && a.size() == b.size()
        && a.hsync() == b.hsync()
        && a.vsync() == b.vsync()
        && a.hskew() == b.hskew()
        && a.vscan() == b.vscan()
        && a.flags() == b.flags()
}

fn shown_mode(card: &Card, crtc: crtc::Handle) -> Option<Mode> {
    card.get_crtc(crtc)
        .ok()
        .filter(|info| info.framebuffer().is_some())
        .and_then(|info| info.mode())
}

fn plan(card: &Card, hints: &ModeHints) -> io::Result<Vec<Planned>> {
    let resources = card.resource_handles()?;
    let connected: Vec<connector::Info> = resources
        .connectors()
        .iter()
        .filter_map(|handle| card.get_connector(*handle, true).ok())
        .filter(|info| info.state() == connector::State::Connected && !info.modes().is_empty())
        .collect();
    let names: Vec<String> = connected.iter().map(ToString::to_string).collect();
    let mut plan: Vec<Planned> = Vec::new();
    for info in &connected {
        let taken: Vec<crtc::Handle> = plan.iter().map(|planned| planned.crtc).collect();
        let crtc = pick_crtc(card, &resources, info, &taken);
        let mode = hints.choose(&info.to_string(), &names, info.modes());
        if let (Some(crtc), Some(mode)) = (crtc, mode) {
            plan.push(Planned {
                connector: info.handle(),
                crtc,
                mode,
                inherited: shown_mode(card, crtc),
                internal: is_internal(info.interface()),
            });
        }
    }
    if plan.is_empty() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            "no connected display",
        ));
    }
    Ok(plan)
}

pub fn cards() -> Vec<PathBuf> {
    let mut cards: Vec<PathBuf> = std::fs::read_dir("/dev/dri")
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| {
            path.file_name()
                .and_then(|name| name.to_str())
                .is_some_and(|name| name.starts_with("card"))
        })
        .collect();
    cards.sort();
    cards
}

fn pick_crtc(
    card: &Card,
    resources: &ResourceHandles,
    info: &connector::Info,
    taken: &[crtc::Handle],
) -> Option<crtc::Handle> {
    let current = info
        .current_encoder()
        .and_then(|encoder| card.get_encoder(encoder).ok())
        .and_then(|encoder| encoder.crtc())
        .filter(|crtc| !taken.contains(crtc));
    current.or_else(|| {
        info.encoders()
            .iter()
            .filter_map(|encoder| card.get_encoder(*encoder).ok())
            .flat_map(|encoder| resources.filter_crtcs(encoder.possible_crtcs()))
            .find(|crtc| !taken.contains(crtc))
    })
}

impl Display {
    pub fn find(hints: &ModeHints) -> Result<Self, Option<Card>> {
        let mut candidates: Vec<Card> = cards()
            .iter()
            .filter_map(|path| Card::open(path).ok())
            .collect();
        candidates.sort_by_key(|card| !card.is_boot_display());
        let mut busy = None;
        for card in candidates {
            match Self::take(card, hints) {
                Ok(display) => return Ok(display),
                Err(card) => busy = busy.or(card),
            }
        }
        Err(busy)
    }

    pub fn take(card: Card, hints: &ModeHints) -> Result<Self, Option<Card>> {
        match card.acquire_master_lock() {
            Ok(()) => {}
            Err(error) if error.raw_os_error() == Some(libc::EBUSY) => return Err(Some(card)),
            Err(_) => return Err(None),
        }
        let plan = plan(&card, hints).map_err(|_| None)?;
        Self::build(card, plan).map_err(|_| None)
    }

    fn build(card: Card, plan: Vec<Planned>) -> io::Result<Self> {
        let outputs = plan
            .into_iter()
            .map(|planned| {
                Output::create(&card, planned.connector, planned.crtc, planned.mode)
                    .map(|output| output.inheriting(planned.inherited, planned.internal))
            })
            .collect::<io::Result<Vec<_>>>()?;
        Ok(Self { card, outputs })
    }

    /// Whether the driver took over the picture the firmware left on screen instead of switching the display off.
    pub fn kept_firmware_picture(&self) -> bool {
        let driver = self.card.driver().unwrap_or_default();
        let inherited = self.outputs.iter().all(|output| output.inherited.is_some());
        let internal = self.outputs.iter().all(|output| output.internal);
        inherited
            && (SEAMLESS_DRIVERS.contains(&driver.as_str())
                || (internal && SEAMLESS_ON_INTERNAL_PANELS.contains(&driver.as_str())))
    }

    pub fn shows_planned_modes(&self) -> bool {
        self.outputs.iter().all(|output| {
            output
                .inherited
                .is_some_and(|inherited| same_timing(&inherited, &output.mode))
        })
    }

    pub fn keeping_inherited_modes(self) -> io::Result<Self> {
        let plan = self
            .outputs
            .iter()
            .map(|output| Planned {
                connector: output.connector,
                crtc: output.crtc,
                mode: output.inherited.unwrap_or(output.mode),
                inherited: output.inherited,
                internal: output.internal,
            })
            .collect();
        Self::build(self.into_card(), plan)
    }

    pub fn refresh(self, hints: &ModeHints) -> io::Result<(Self, bool)> {
        let plan = plan(&self.card, hints)?;
        let unchanged = plan.len() == self.outputs.len()
            && plan.iter().zip(&self.outputs).all(|(planned, output)| {
                planned.connector == output.connector && planned.mode == output.mode
            });
        if unchanged {
            return Ok((self, false));
        }
        Ok((Self::build(self.into_card(), plan)?, true))
    }

    pub fn path(&self) -> &Path {
        self.card.path()
    }

    pub fn card(&self) -> &Card {
        &self.card
    }

    pub fn sizes(&self) -> Vec<(u32, u32)> {
        self.outputs.iter().map(Output::size).collect()
    }

    pub fn show(&self) -> io::Result<()> {
        self.outputs
            .iter()
            .try_for_each(|output| output.show(&self.card))
    }

    pub fn blit(&mut self, output: usize, area: Rect, pixmap: &Pixmap) {
        self.outputs[output].blit(&self.card, area, pixmap);
    }

    pub fn release_master(&self) {
        let _ = self.card.release_master_lock();
    }

    pub fn replaced(&self) -> bool {
        self.outputs
            .iter()
            .all(|output| !output.is_on_screen(&self.card))
    }

    pub fn into_card(self) -> Card {
        for output in self.outputs {
            output.release(&self.card);
        }
        self.card
    }
}
