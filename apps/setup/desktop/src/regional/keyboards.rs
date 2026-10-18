use serde::Serialize;

const RULES: &str = "/usr/share/X11/xkb/rules/evdev.xml";
const UNDETERMINED: &str = "und";

#[derive(Serialize)]
pub struct Keyboard {
    layout: String,
    variant: String,
    name: String,
}

fn placeholder(layout: roxmltree::Node) -> bool {
    let mut languages = layout
        .descendants()
        .find(|child| child.has_tag_name("configItem"))
        .into_iter()
        .flat_map(|item| item.descendants())
        .filter(|node| node.has_tag_name("iso639Id"))
        .peekable();
    languages.peek().is_some() && languages.all(|language| language.text() == Some(UNDETERMINED))
}

fn text<'a>(node: roxmltree::Node<'a, '_>, name: &str) -> Option<&'a str> {
    node.descendants()
        .find(|child| child.has_tag_name("configItem"))?
        .children()
        .find(|child| child.has_tag_name(name))?
        .text()
}

pub fn all() -> Vec<Keyboard> {
    let Ok(rules) = std::fs::read_to_string(RULES) else {
        return Vec::new();
    };
    let options = roxmltree::ParsingOptions {
        allow_dtd: true,
        ..roxmltree::ParsingOptions::default()
    };
    let Ok(document) = roxmltree::Document::parse_with_options(&rules, options) else {
        return Vec::new();
    };
    let mut keyboards: Vec<Keyboard> = document
        .descendants()
        .filter(|node| node.has_tag_name("layout") && !placeholder(*node))
        .flat_map(|layout| {
            let id = text(layout, "name").unwrap_or_default().to_owned();
            let base = Keyboard {
                layout: id.clone(),
                variant: String::new(),
                name: text(layout, "description").unwrap_or(&id).to_owned(),
            };
            let variants = layout
                .descendants()
                .filter(|node| node.has_tag_name("variant"))
                .filter_map(|variant| {
                    Some(Keyboard {
                        layout: id.clone(),
                        variant: text(variant, "name")?.to_owned(),
                        name: text(variant, "description")?.to_owned(),
                    })
                })
                .collect::<Vec<_>>();
            std::iter::once(base).chain(variants)
        })
        .filter(|keyboard| !keyboard.layout.is_empty())
        .collect();
    keyboards.sort_by_key(|keyboard| keyboard.name.to_lowercase());
    keyboards
}
