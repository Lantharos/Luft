use std::fs;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;

use roxmltree::{Document, Node, ParsingOptions};
use serde::Serialize;

const RULES: &str = "/usr/share/X11/xkb/rules/evdev.xml";

static LAYOUTS: OnceLock<Vec<Layout>> = OnceLock::new();

#[derive(Serialize, Clone)]
pub struct Layout {
    id: String,
    name: String,
    custom: bool,
}

fn config<'a>(node: Node<'a, 'a>) -> Option<(&'a str, &'a str)> {
    let item = node
        .children()
        .find(|child| child.has_tag_name("configItem"))?;
    let text = |tag: &str| {
        item.children()
            .find(|child| child.has_tag_name(tag))?
            .text()
            .map(str::trim)
    };
    Some((text("name")?, text("description")?))
}

fn parse(rules: &Path, custom: bool) -> Vec<Layout> {
    let Ok(xml) = fs::read_to_string(rules) else {
        return Vec::new();
    };
    let options = ParsingOptions {
        allow_dtd: true,
        ..Default::default()
    };
    let Ok(document) = Document::parse_with_options(&xml, options) else {
        return Vec::new();
    };
    let mut layouts = Vec::new();
    for layout in document
        .descendants()
        .filter(|node| node.has_tag_name("layout"))
    {
        let Some((id, name)) = config(layout) else {
            continue;
        };
        layouts.push(Layout {
            id: id.to_owned(),
            name: name.to_owned(),
            custom,
        });
        layouts.extend(
            layout
                .descendants()
                .filter(|node| node.has_tag_name("variant"))
                .filter_map(config)
                .map(|(variant, name)| Layout {
                    id: format!("{id}+{variant}"),
                    name: name.to_owned(),
                    custom,
                }),
        );
    }
    layouts
}

fn user_rules() -> Option<PathBuf> {
    Some(dirs::config_dir()?.join("xkb/rules/evdev.xml"))
}

pub fn all() -> Vec<Layout> {
    let system = LAYOUTS.get_or_init(|| parse(Path::new(RULES), false));
    let mut layouts = user_rules()
        .map(|rules| parse(&rules, true))
        .unwrap_or_default();
    layouts.extend(system.iter().cloned());
    layouts.sort_by(|left, right| left.name.cmp(&right.name));
    layouts
}
