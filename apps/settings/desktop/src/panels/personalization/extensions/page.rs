use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, specta::Type)]
pub struct PageOption {
    value: String,
    label: String,
    image: Option<String>,
}

#[derive(Deserialize, Serialize, specta::Type)]
pub struct PageAction {
    label: String,
    danger: bool,
    action: String,
}

#[derive(Deserialize, Serialize, specta::Type)]
pub struct PageListItem {
    title: String,
    description: Option<String>,
    image: Option<String>,
    actions: Vec<PageAction>,
}

#[derive(Deserialize, Serialize, specta::Type)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum PageItem {
    Setting {
        key: String,
    },
    Text {
        text: String,
    },
    Row {
        title: String,
        description: Option<String>,
        value: Option<String>,
        action: Option<String>,
    },
    Switch {
        title: String,
        description: Option<String>,
        checked: bool,
        action: String,
    },
    Choice {
        title: String,
        description: Option<String>,
        value: String,
        options: Vec<PageOption>,
        action: String,
    },
    Slider {
        title: String,
        description: Option<String>,
        value: f64,
        min: f64,
        max: f64,
        step: Option<f64>,
        unit: Option<String>,
        action: String,
    },
    Button {
        title: String,
        description: Option<String>,
        label: String,
        danger: bool,
        action: String,
    },
    Entry {
        title: String,
        description: Option<String>,
        value: String,
        placeholder: Option<String>,
        action: String,
    },
    Preview {
        image: String,
        description: String,
    },
    List {
        empty: Option<String>,
        items: Vec<PageListItem>,
    },
}

/// A section of an extension's own Settings page, as the extension describes it while it runs.
#[derive(Deserialize, Serialize, specta::Type)]
pub struct PageSection {
    title: Option<String>,
    description: Option<String>,
    items: Vec<PageItem>,
}

pub fn parse(json: &str) -> Result<Vec<PageSection>, String> {
    if json.is_empty() {
        return Ok(Vec::new());
    }
    serde_json::from_str(json).map_err(|error| error.to_string())
}
