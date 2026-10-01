use quick_xml::events::{BytesStart, Event};
use quick_xml::{Reader, XmlVersion};
use serde::{Deserialize, Serialize};

const DESKTOP_TYPES: [&str; 2] = ["desktop", "desktop-application"];
const MARKUP: [&str; 6] = ["p", "ul", "ol", "li", "em", "code"];
const PREFERRED_WIDTH: &str = "752";

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct Screenshot {
    pub url: String,
    pub caption: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct Component {
    pub id: String,
    pub package: String,
    pub name: String,
    pub summary: String,
    pub description: String,
    pub icon: Option<String>,
    pub categories: Vec<String>,
    pub keywords: Vec<String>,
    pub developer: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    pub screenshots: Vec<Screenshot>,
}

#[derive(Default)]
struct Shot {
    preferred: Option<String>,
    fallback: Option<String>,
    caption: Option<String>,
}

#[derive(Default)]
struct Parser {
    components: Vec<Component>,
    origin: String,
    current: Option<Component>,
    icon_width: u32,
    shot: Option<Shot>,
    stack: Vec<String>,
    localized: Vec<bool>,
    text: String,
    describing: bool,
    image_kind: Option<String>,
}

fn attribute(element: &BytesStart, name: &str) -> Option<String> {
    element
        .try_get_attribute(name)
        .ok()
        .flatten()
        .and_then(|value| {
            value
                .normalized_value(XmlVersion::Implicit1_0)
                .ok()
                .map(|value| value.into_owned())
        })
}

fn entity(name: &str) -> Option<char> {
    match name {
        "amp" => Some('&'),
        "lt" => Some('<'),
        "gt" => Some('>'),
        "quot" => Some('"'),
        "apos" => Some('\''),
        _ => {
            let code = name.strip_prefix('#')?;
            let value = match code.strip_prefix('x') {
                Some(hex) => u32::from_str_radix(hex, 16).ok()?,
                None => code.parse().ok()?,
            };
            char::from_u32(value)
        }
    }
}

fn escape(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

impl Parser {
    fn parent(&self) -> &str {
        self.stack
            .iter()
            .rev()
            .nth(1)
            .map(String::as_str)
            .unwrap_or_default()
    }

    fn start(&mut self, element: &BytesStart) {
        let name = element.local_name().as_ref().to_owned();
        let localized = attribute(element, "xml:lang").is_some()
            || self.localized.last().copied().unwrap_or(false);
        self.stack.push(name.clone());
        self.localized.push(localized);
        self.text.clear();
        if name == "components" {
            self.origin = attribute(element, "origin").unwrap_or_default();
            return;
        }
        if name == "component" {
            let kind = attribute(element, "type").unwrap_or_default();
            self.current = DESKTOP_TYPES
                .contains(&kind.as_str())
                .then(Component::default);
            self.icon_width = 0;
            return;
        }
        if self.current.is_none() || localized {
            return;
        }
        match name.as_str() {
            "description" if self.parent() == "component" => self.describing = true,
            tag if self.describing && MARKUP.contains(&tag) => {
                if let Some(component) = self.current.as_mut() {
                    component.description.push_str(&format!("<{tag}>"));
                }
            }
            "icon" => {
                let cached = attribute(element, "type").as_deref() == Some("cached");
                let width = attribute(element, "width")
                    .and_then(|width| width.parse().ok())
                    .unwrap_or(0);
                self.image_kind =
                    (cached && width > self.icon_width && width <= 128).then(|| width.to_string());
            }
            "screenshot" => self.shot = Some(Shot::default()),
            "image" => {
                let kind = attribute(element, "type").unwrap_or_default();
                let width = attribute(element, "width").unwrap_or_default();
                self.image_kind = match kind.as_str() {
                    "source" => Some("source".into()),
                    "thumbnail" if width == PREFERRED_WIDTH => Some("preferred".into()),
                    _ => None,
                };
            }
            "url" => self.image_kind = attribute(element, "type"),
            _ => {}
        }
    }

    fn text(&mut self, text: &str) {
        if self.describing {
            if let Some(component) = self.current.as_mut()
                && !self.localized.last().copied().unwrap_or(false)
            {
                component.description.push_str(&escape(text));
            }
            return;
        }
        self.text.push_str(text);
    }

    fn end(&mut self) {
        let name = self.stack.pop().unwrap_or_default();
        let localized = self.localized.pop().unwrap_or(false);
        let text = std::mem::take(&mut self.text).trim().to_owned();
        if name == "component" {
            if let Some(component) = self.current.take()
                && !component.id.is_empty()
                && !component.package.is_empty()
                && !component.name.is_empty()
            {
                self.components.push(component);
            }
            return;
        }
        if localized {
            return;
        }
        let parent = self.stack.last().cloned().unwrap_or_default();
        let kind = self.image_kind.take();
        let Some(component) = self.current.as_mut() else {
            return;
        };
        match name.as_str() {
            "description" if self.describing => self.describing = false,
            tag if self.describing && MARKUP.contains(&tag) => {
                component.description.push_str(&format!("</{tag}>"))
            }
            "id" if parent == "component" => component.id = text,
            "pkgname" => component.package = text,
            "name" if parent == "component" => component.name = text,
            "name" if parent == "developer" => component.developer = Some(text),
            "developer_name" => component.developer = Some(text),
            "summary" if parent == "component" => component.summary = text,
            "project_license" => component.license = Some(text),
            "category" => component.categories.push(text),
            "keyword" => component.keywords.push(text),
            "url" if kind.as_deref() == Some("homepage") => component.homepage = Some(text),
            "icon" => {
                if let Some(width) = kind.and_then(|width| width.parse().ok()) {
                    self.icon_width = width;
                    component.icon = Some(format!("{}/{width}x{width}/{text}", self.origin));
                }
            }
            "image" => {
                if let Some(shot) = self.shot.as_mut() {
                    match kind.as_deref() {
                        Some("preferred") => shot.preferred = Some(text),
                        Some("source") => shot.fallback = Some(text),
                        _ => {}
                    }
                }
            }
            "caption" => {
                if let Some(shot) = self.shot.as_mut() {
                    shot.caption = Some(text);
                }
            }
            "screenshot" => {
                if let Some(shot) = self.shot.take()
                    && let Some(url) = shot.preferred.or(shot.fallback)
                {
                    let url = match url.strip_prefix("http://") {
                        Some(rest) => format!("https://{rest}"),
                        None => url,
                    };
                    component.screenshots.push(Screenshot {
                        url,
                        caption: shot.caption,
                    });
                }
            }
            _ => {}
        }
    }
}

pub fn parse(xml: &str) -> Vec<Component> {
    let mut reader = Reader::from_str(xml);
    let mut parser = Parser::default();
    loop {
        match reader.read_event() {
            Ok(Event::Start(element)) => parser.start(&element),
            Ok(Event::Empty(element)) => {
                parser.start(&element);
                parser.end();
            }
            Ok(Event::End(_)) => parser.end(),
            Ok(Event::Text(text)) => parser.text(&text.xml10_content()),
            Ok(Event::CData(text)) => parser.text(&text.xml10_content()),
            Ok(Event::GeneralRef(reference)) => {
                if let Some(character) = entity(&reference) {
                    parser.text(&character.to_string());
                }
            }
            Ok(Event::Eof) | Err(_) => break,
            Ok(_) => {}
        }
    }
    parser.components
}
