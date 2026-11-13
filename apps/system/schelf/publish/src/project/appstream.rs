use std::collections::HashMap;

use quick_xml::Reader;
use quick_xml::events::{BytesStart, Event};

struct Node {
    name: String,
    attributes: HashMap<String, String>,
    children: Vec<Node>,
    text: String,
}

impl Node {
    fn elements<'a>(&'a self, name: &'a str) -> impl Iterator<Item = &'a Node> {
        self.children.iter().filter(move |child| child.name == name)
    }

    fn element<'a>(&'a self, name: &'a str) -> Option<&'a Node> {
        self.elements(name).next()
    }

    fn language(&self) -> Option<&String> {
        self.attributes.get("xml:lang")
    }

    fn content(&self) -> String {
        self.text.split_whitespace().collect::<Vec<_>>().join(" ")
    }
}

fn text_of(node: Option<&Node>) -> String {
    node.map(Node::content).unwrap_or_default()
}

fn start(element: &BytesStart) -> Node {
    Node {
        name: element.name().as_ref().to_owned(),
        attributes: element
            .attributes()
            .flatten()
            .map(|attribute| {
                (
                    attribute.key.as_ref().to_owned(),
                    attribute
                        .normalized_value(quick_xml::XmlVersion::Implicit1_0)
                        .map(|value| value.into_owned())
                        .unwrap_or_default(),
                )
            })
            .collect(),
        children: Vec::new(),
        text: String::new(),
    }
}

fn finish(stack: &mut [Node], node: Node) {
    let parent = stack.last_mut().expect("the document holds every element");
    parent.text.push_str(&node.text);
    parent.children.push(node);
}

fn parse(text: &str) -> Result<Node, String> {
    let mut reader = Reader::from_str(text);
    let mut stack = vec![Node {
        name: "#document".into(),
        attributes: HashMap::new(),
        children: Vec::new(),
        text: String::new(),
    }];
    loop {
        match reader.read_event().map_err(|error| error.to_string())? {
            Event::Start(element) => stack.push(start(&element)),
            Event::Empty(element) => finish(&mut stack, start(&element)),
            Event::End(_) if stack.len() > 1 => {
                let node = stack.pop().expect("an element was open");
                finish(&mut stack, node);
            }
            Event::Text(content) => {
                let text = content.xml10_content();
                stack
                    .last_mut()
                    .expect("the document is open")
                    .text
                    .push_str(&text);
            }
            Event::CData(content) => stack
                .last_mut()
                .expect("the document is open")
                .text
                .push_str(&content),
            Event::GeneralRef(reference) => {
                let character = match &*reference {
                    "amp" => "&".to_owned(),
                    "lt" => "<".to_owned(),
                    "gt" => ">".to_owned(),
                    "quot" => "\"".to_owned(),
                    "apos" => "'".to_owned(),
                    _ => reference
                        .resolve_char_ref()
                        .ok()
                        .flatten()
                        .map(String::from)
                        .unwrap_or_default(),
                };
                stack
                    .last_mut()
                    .expect("the document is open")
                    .text
                    .push_str(&character);
            }
            Event::Eof => break,
            _ => {}
        }
    }
    Ok(stack.swap_remove(0))
}

pub struct Screenshot {
    pub url: String,
}

pub struct Icon {
    pub kind: String,
    pub value: String,
}

/// What an AppStream file says about an app.
pub struct Component {
    pub id: String,
    pub name: Option<String>,
    pub summary: Option<String>,
    pub description: String,
    pub project_license: Option<String>,
    pub urls: HashMap<String, String>,
    pub categories: Vec<String>,
    pub keywords: Vec<String>,
    pub screenshots: Vec<Screenshot>,
    pub icons: Vec<Icon>,
    pub content_rating: Option<String>,
}

fn english(node: &Node, name: &str) -> Option<String> {
    let mut found = None;
    for each in node.elements(name) {
        let text = each.content();
        if !text.is_empty() && each.language().is_none_or(|language| language == "en") {
            found = Some(text);
        }
    }
    found
}

fn describe(node: Option<&Node>) -> String {
    let Some(node) = node else {
        return String::new();
    };
    let mut blocks = Vec::new();
    for child in node
        .children
        .iter()
        .filter(|child| child.language().is_none())
    {
        match child.name.as_str() {
            "p" => blocks.push(child.content()),
            "ul" | "ol" => blocks.push(
                child
                    .elements("li")
                    .filter(|item| item.language().is_none())
                    .map(|item| format!("• {}", item.content()))
                    .collect::<Vec<_>>()
                    .join("\n"),
            ),
            _ => {}
        }
    }
    blocks
        .into_iter()
        .filter(|block| !block.is_empty())
        .collect::<Vec<_>>()
        .join("\n\n")
}

fn screenshot(node: &Node) -> Option<Screenshot> {
    let images: Vec<&Node> = node
        .elements("image")
        .filter(|image| image.language().is_none())
        .collect();
    let image = images
        .iter()
        .find(|image| image.attributes.get("type").map(String::as_str) == Some("source"))
        .or(images.first())?;
    Some(Screenshot {
        url: image.content(),
    })
}

fn listed(node: &Node, folder: &str, item: &str) -> Vec<String> {
    node.element(folder)
        .map(|folder| folder.elements(item).map(Node::content).collect())
        .unwrap_or_default()
}

/// Reads the first component of an AppStream metainfo file.
pub fn parse_metainfo(text: &str) -> Result<Component, String> {
    let document = parse(text)?;
    let node = document
        .element("component")
        .ok_or("no <component> in the AppStream file")?;
    let optional = |name: &str| Some(text_of(node.element(name))).filter(|text| !text.is_empty());
    Ok(Component {
        id: text_of(node.element("id")),
        name: english(node, "name"),
        summary: english(node, "summary"),
        description: describe(node.element("description")),
        project_license: optional("project_license"),
        urls: node
            .elements("url")
            .map(|url| {
                (
                    url.attributes
                        .get("type")
                        .cloned()
                        .unwrap_or_else(|| "homepage".into()),
                    url.content(),
                )
            })
            .collect(),
        categories: listed(node, "categories", "category"),
        keywords: node
            .element("keywords")
            .map(|keywords| {
                keywords
                    .elements("keyword")
                    .filter(|keyword| keyword.language().is_none())
                    .map(Node::content)
                    .collect()
            })
            .unwrap_or_default(),
        screenshots: node
            .element("screenshots")
            .map(|shots| {
                shots
                    .elements("screenshot")
                    .filter_map(screenshot)
                    .collect()
            })
            .unwrap_or_default(),
        icons: node
            .elements("icon")
            .map(|icon| Icon {
                kind: icon
                    .attributes
                    .get("type")
                    .cloned()
                    .unwrap_or_else(|| "stock".into()),
                value: icon.content(),
            })
            .collect(),
        content_rating: node.element("content_rating").map(|rating| {
            rating
                .attributes
                .get("type")
                .cloned()
                .unwrap_or_else(|| "oars-1.1".into())
        }),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_what_the_store_takes_from_a_metainfo_file() {
        let notes = parse_metainfo(include_str!("../../fixtures/notes.metainfo.xml")).unwrap();
        assert_eq!(notes.id, "io.github.alice.Notes");
        assert_eq!(notes.name.as_deref(), Some("Notes"));
        assert_eq!(
            notes.summary.as_deref(),
            Some("A quick place for your thoughts")
        );
        assert_eq!(
            notes.description,
            "Notes keeps what you write.\n\n• Fast search\n• Works offline"
        );
        assert_eq!(notes.project_license.as_deref(), Some("GPL-3.0-or-later"));
        assert_eq!(notes.keywords, ["memo"]);
        assert_eq!(
            notes.urls["bugtracker"],
            "https://github.com/alice/notes/issues"
        );
        let shots: Vec<&str> = notes
            .screenshots
            .iter()
            .map(|shot| shot.url.as_str())
            .collect();
        assert_eq!(
            shots,
            [
                "https://notes.example/1.png",
                "https://notes.example/2-small.png"
            ]
        );
    }
}
