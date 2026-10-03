use std::fmt::Write;
use std::fs;
use std::path::Path;
use std::sync::OnceLock;

use roxmltree::{Document, Node, ParsingOptions};
use serde::Serialize;

use crate::paths;

const EMPTY_PLACEHOLDER: &str = "custom";

static SYSTEM: OnceLock<Vec<Entry>> = OnceLock::new();

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Entry {
    pub id: String,
    pub name: String,
    pub short: String,
    pub language: String,
}

fn text<'a>(node: Node<'a, 'a>, tag: &str) -> &'a str {
    node.children()
        .find(|child| child.has_tag_name(tag))
        .and_then(|child| child.text())
        .map_or("", str::trim)
}

fn entry(node: Node, id: impl FnOnce(&str) -> String) -> Option<Entry> {
    let item = node
        .children()
        .find(|child| child.has_tag_name("configItem"))?;
    let name = text(item, "name");
    let description = text(item, "description");
    if name.is_empty() || description.is_empty() {
        return None;
    }
    let language = item
        .descendants()
        .find(|child| child.has_tag_name("iso639Id"))
        .and_then(|child| child.text())
        .unwrap_or_default();
    Some(Entry {
        id: id(name),
        name: description.to_owned(),
        short: text(item, "shortDescription").to_owned(),
        language: language.to_owned(),
    })
}

fn parse(path: &Path, variants: bool) -> Vec<Entry> {
    let Ok(xml) = fs::read_to_string(path) else {
        return Vec::new();
    };
    let options = ParsingOptions {
        allow_dtd: true,
        ..Default::default()
    };
    let Ok(document) = Document::parse_with_options(&xml, options) else {
        return Vec::new();
    };
    let mut entries = Vec::new();
    for layout in document
        .descendants()
        .filter(|node| node.has_tag_name("layout"))
    {
        let Some(parent) = entry(layout, str::to_owned) else {
            continue;
        };
        if variants {
            entries.extend(
                layout
                    .descendants()
                    .filter(|node| node.has_tag_name("variant"))
                    .filter_map(|variant| entry(variant, |name| format!("{}+{name}", parent.id))),
            );
        }
        entries.push(parent);
    }
    entries
}

pub fn system() -> &'static [Entry] {
    SYSTEM.get_or_init(|| {
        let mut entries = parse(&Path::new(paths::SYSTEM_XKB).join("rules/evdev.xml"), true);
        entries.retain(|entry| entry.id != EMPTY_PLACEHOLDER);
        entries.sort_by(|left, right| left.name.cmp(&right.name));
        entries
    })
}

pub fn user() -> Vec<Entry> {
    parse(&paths::user_rules(), false)
}

fn escape(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

pub fn write(entries: &[Entry]) -> Result<(), String> {
    let mut xml = String::from(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE xkbConfigRegistry SYSTEM \"xkb.dtd\">\n<xkbConfigRegistry version=\"1.1\">\n  <layoutList>\n",
    );
    for entry in entries {
        let _ = write!(
            xml,
            "    <layout>\n      <configItem>\n        <name>{}</name>\n        <shortDescription>{}</shortDescription>\n        <description>{}</description>\n",
            escape(&entry.id),
            escape(&entry.short),
            escape(&entry.name)
        );
        if !entry.language.is_empty() {
            let _ = write!(
                xml,
                "        <languageList>\n          <iso639Id>{}</iso639Id>\n        </languageList>\n",
                escape(&entry.language)
            );
        }
        xml.push_str("      </configItem>\n    </layout>\n");
    }
    xml.push_str("  </layoutList>\n</xkbConfigRegistry>\n");
    paths::write(&paths::user_rules(), &xml)
}
