use luft_cups::drivers::DeviceId;
use luft_cups::ipp::Attributes;
use zbus::{SerializeDict, Type};

pub const ATTRIBUTES: [&str; 22] = [
    "printer-name",
    "printer-info",
    "printer-location",
    "printer-make-and-model",
    "printer-state",
    "printer-state-reasons",
    "printer-state-message",
    "printer-is-accepting-jobs",
    "printer-is-temporary",
    "device-uri",
    "marker-names",
    "marker-levels",
    "marker-colors",
    "marker-types",
    "media-supported",
    "media-default",
    "sides-supported",
    "sides-default",
    "print-color-mode-supported",
    "print-color-mode-default",
    "copies-supported",
    "page-ranges-supported",
];

#[derive(SerializeDict, Type)]
#[zbus(signature = "a{sv}", rename_all = "kebab-case")]
pub struct Printer {
    pub name: String,
    description: String,
    location: String,
    model: String,
    device: String,
    state: i32,
    reasons: Vec<String>,
    message: String,
    accepting: bool,
    temporary: bool,
    pub default: bool,
    markers: Vec<(String, i32, String)>,
    media: Vec<String>,
    media_default: String,
    sides: Vec<String>,
    sides_default: String,
    color_modes: Vec<String>,
    color_mode_default: String,
    copies: i32,
    page_ranges: bool,
}

fn markers(attributes: &Attributes) -> Vec<(String, i32, String)> {
    let names = attributes.texts("marker-names");
    let levels = attributes.integers("marker-levels");
    let colors = attributes.texts("marker-colors");
    let types = attributes.texts("marker-types");
    names
        .into_iter()
        .zip(levels)
        .zip(colors)
        .enumerate()
        .filter(|(index, _)| {
            types
                .get(*index)
                .is_none_or(|kind| !kind.to_ascii_lowercase().contains("waste"))
        })
        .filter(|(_, ((_, level), _))| *level >= 0)
        .map(|(_, ((name, level), color))| (name, level, color))
        .collect()
}

impl Printer {
    pub fn from(attributes: &Attributes) -> Option<Self> {
        let name = attributes.text("printer-name")?.to_owned();
        let text = |key| attributes.text(key).unwrap_or_default().to_owned();
        let description = Some(text("printer-info"))
            .filter(|info| !info.is_empty())
            .unwrap_or_else(|| name.clone());
        Some(Self {
            default: false,
            description,
            location: text("printer-location"),
            model: text("printer-make-and-model"),
            device: text("device-uri"),
            state: attributes.integer("printer-state").unwrap_or_default(),
            reasons: attributes
                .texts("printer-state-reasons")
                .into_iter()
                .filter(|reason| reason != "none")
                .collect(),
            message: text("printer-state-message"),
            accepting: attributes.boolean("printer-is-accepting-jobs"),
            temporary: attributes.boolean("printer-is-temporary"),
            markers: markers(attributes),
            media: attributes
                .texts("media-supported")
                .into_iter()
                .filter(|media| {
                    !media.starts_with("custom_min_") && !media.starts_with("custom_max_")
                })
                .collect(),
            media_default: text("media-default"),
            sides: attributes.texts("sides-supported"),
            sides_default: text("sides-default"),
            color_modes: attributes.texts("print-color-mode-supported"),
            color_mode_default: text("print-color-mode-default"),
            copies: attributes
                .range("copies-supported")
                .map_or(1, |(_, most)| most),
            page_ranges: attributes.boolean("page-ranges-supported"),
            name,
        })
    }

    pub fn reached_another_way(&self, discovered: &[DeviceId]) -> bool {
        !self.temporary
            && DeviceId::from_usb_uri(&self.device)
                .is_some_and(|usb| discovered.iter().any(|found| found.same_printer(&usb)))
    }
}
