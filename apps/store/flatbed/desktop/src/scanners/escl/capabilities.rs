use roxmltree::{Document, Node};

/// What one way of feeding paper into an eSCL scanner can do. Sizes are in
/// 300ths of an inch.
#[derive(Clone, Debug, Default)]
pub struct Input {
    pub width: u32,
    pub height: u32,
    pub colour_modes: Vec<String>,
    pub formats: Vec<String>,
    pub resolutions: Vec<u32>,
}

#[derive(Clone, Debug, Default)]
pub struct Capabilities {
    pub version: String,
    pub model: String,
    pub platen: Option<Input>,
    pub feeder: Option<Input>,
    pub both_sides: bool,
}

fn child<'a>(node: Node<'a, 'a>, name: &str) -> Option<Node<'a, 'a>> {
    node.descendants()
        .find(|node| node.tag_name().name() == name)
}

fn texts(node: Node, name: &str) -> Vec<String> {
    node.descendants()
        .filter(|node| node.tag_name().name() == name)
        .filter_map(|node| node.text())
        .map(|text| text.trim().to_owned())
        .collect()
}

fn number(node: Node, name: &str) -> u32 {
    child(node, name)
        .and_then(|node| node.text())
        .and_then(|text| text.trim().parse().ok())
        .unwrap_or(0)
}

fn input(caps: Node) -> Input {
    let mut formats = texts(caps, "DocumentFormatExt");
    formats.extend(texts(caps, "DocumentFormat"));
    let mut resolutions: Vec<u32> = texts(caps, "XResolution")
        .iter()
        .filter_map(|text| text.parse().ok())
        .collect();
    resolutions.sort_unstable();
    resolutions.dedup();
    Input {
        width: number(caps, "MaxWidth"),
        height: number(caps, "MaxHeight"),
        colour_modes: texts(caps, "ColorMode"),
        formats,
        resolutions,
    }
}

pub fn parse(xml: &str) -> Result<Capabilities, String> {
    let document = Document::parse(xml).map_err(|error| error.to_string())?;
    let root = document.root_element();
    let text = |name: &str| {
        child(root, name)
            .and_then(|node| node.text())
            .map(|text| text.trim().to_owned())
            .unwrap_or_default()
    };
    let feeder = child(root, "Adf");
    Ok(Capabilities {
        version: text("Version"),
        model: text("MakeAndModel"),
        platen: child(root, "PlatenInputCaps").map(input),
        feeder: feeder
            .and_then(|adf| child(adf, "AdfSimplexInputCaps"))
            .map(input),
        both_sides: feeder.is_some_and(|adf| child(adf, "AdfDuplexInputCaps").is_some()),
    })
}

impl Input {
    /// The resolution closest to `wanted` the scanner offers.
    pub fn resolution(&self, wanted: u32) -> u32 {
        self.resolutions
            .iter()
            .copied()
            .min_by_key(|resolution| resolution.abs_diff(wanted))
            .unwrap_or(wanted)
    }

    pub fn colour_mode(&self, colour: bool) -> &str {
        let wanted: &[&str] = if colour {
            &["RGB24", "Grayscale8"]
        } else {
            &["Grayscale8", "RGB24"]
        };
        wanted
            .iter()
            .find(|mode| self.colour_modes.iter().any(|offered| offered == *mode))
            .copied()
            .unwrap_or("RGB24")
    }

    pub fn format(&self) -> Option<&'static str> {
        ["image/jpeg", "image/png"]
            .into_iter()
            .find(|format| self.formats.iter().any(|offered| offered == format))
    }
}
