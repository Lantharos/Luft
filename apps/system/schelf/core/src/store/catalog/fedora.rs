use std::collections::BTreeMap;
use std::fs::File;
use std::io::BufReader;
use std::path::Path;
use std::sync::OnceLock;

use chrono::{DateTime, TimeDelta, Utc};
use flate2::read::GzDecoder;
use quick_xml::XmlVersion;
use quick_xml::escape::resolve_predefined_entity;
use quick_xml::events::{BytesStart, Event};

use super::{Entry, Kind, Origin, Publisher};

const LISTINGS: &str = "/usr/share/swcatalog/xml/fedora.xml.gz";
const ICONS: &str = "/usr/share/swcatalog/icons/fedora";
const ICON_SIZES: [&str; 2] = ["128", "64"];
const APP_TYPES: [&str; 3] = ["desktop-application", "desktop", "console-application"];
const LIBRARY_SUFFIXES: [&str; 5] = ["-lib", "-libs", "-devel", "-common", "-data"];
const ABANDONED_AFTER: TimeDelta = TimeDelta::days(24 * 30);

static APPS: OnceLock<Vec<Entry>> = OnceLock::new();

#[derive(Default)]
struct Component {
    kind: String,
    id: String,
    package: String,
    name: String,
    summary: String,
    developer: String,
    cached_icons: Vec<(String, String)>,
    remote_icon: Option<String>,
    categories: Vec<String>,
    screenshots: usize,
    launchable: bool,
    released: Option<DateTime<Utc>>,
}

impl Component {
    fn icon(&self) -> Option<String> {
        ICON_SIZES
            .iter()
            .find_map(|size| {
                self.cached_icons
                    .iter()
                    .find(|(width, _)| width == size)
                    .map(|(_, file)| format!("{ICONS}/{size}x{size}/{file}"))
            })
            .or_else(|| self.remote_icon.clone())
    }

    fn library(&self) -> bool {
        self.package.starts_with("lib")
            || LIBRARY_SUFFIXES
                .iter()
                .any(|suffix| self.package.ends_with(suffix))
    }

    fn worth_offering(&self, now: DateTime<Utc>) -> bool {
        APP_TYPES.contains(&self.kind.as_str())
            && (self.kind == "desktop" || self.launchable)
            && !self.package.is_empty()
            && !self.library()
            && !self.summary.is_empty()
            && self.screenshots > 0
            && self
                .released
                .is_none_or(|released| now - released <= ABANDONED_AFTER)
    }

    fn entry(self, now: DateTime<Utc>) -> Option<Entry> {
        let icon = self.icon().filter(|_| self.worth_offering(now))?;
        Some(Entry {
            id: self.id.trim_end_matches(".desktop").to_owned(),
            kind: Kind::App,
            origin: Origin::Fedora,
            name: self.name,
            summary: self.summary,
            icon: Some(icon),
            art: None,
            categories: self.categories,
            publisher: Some(Publisher {
                name: self.developer,
                verified: false,
            }),
            platforms: BTreeMap::new(),
            package: Some(self.package),
            updated: self.released.map(|released| released.to_rfc3339()),
            installs: 0,
        })
    }
}

/// A piece of text in a component that its listing keeps.
enum Field {
    Id,
    Package,
    Name,
    Summary,
    Developer,
    Category,
    Icon { cached: bool, width: String },
}

fn attribute(element: &BytesStart, name: &str) -> Option<String> {
    element
        .try_get_attribute(name)
        .ok()
        .flatten()
        .and_then(|value| value.normalized_value(XmlVersion::Implicit1_0).ok())
        .map(|value| value.into_owned())
}

/// Reads Fedora's AppStream data a tag at a time, keeping only the untranslated
/// text of each component.
#[derive(Default)]
struct Parser {
    path: Vec<String>,
    component: Component,
    field: Option<(Field, usize)>,
    text: String,
    apps: Vec<Entry>,
}

impl Parser {
    fn open(&mut self, element: &BytesStart) {
        let tag = element.local_name().as_ref().to_owned();
        let untranslated = attribute(element, "xml:lang").is_none();
        let field = match (self.path.last().map(String::as_str), tag.as_str()) {
            (Some("components"), "component") => {
                self.component = Component {
                    kind: attribute(element, "type").unwrap_or_default(),
                    ..Component::default()
                };
                None
            }
            (Some("component"), "id") => Some(Field::Id),
            (Some("component"), "pkgname") => Some(Field::Package),
            (Some("component"), "name") if untranslated => Some(Field::Name),
            (Some("component"), "summary") if untranslated => Some(Field::Summary),
            (Some("component"), "developer_name") if untranslated => Some(Field::Developer),
            (Some("categories"), "category") => Some(Field::Category),
            (Some("component"), "icon") => Some(Field::Icon {
                cached: attribute(element, "type").as_deref() == Some("cached"),
                width: attribute(element, "width").unwrap_or_default(),
            }),
            (Some("component"), "launchable") => {
                self.component.launchable = true;
                None
            }
            (Some("screenshots"), "screenshot") => {
                self.component.screenshots += 1;
                None
            }
            (Some("releases"), "release") => {
                let released = attribute(element, "timestamp")
                    .and_then(|seconds| seconds.parse().ok())
                    .and_then(|seconds| DateTime::from_timestamp(seconds, 0));
                self.component.released = self.component.released.max(released);
                None
            }
            _ => None,
        };
        if let Some(field) = field {
            self.field = Some((field, self.path.len()));
            self.text.clear();
        }
        self.path.push(tag);
    }

    fn close(&mut self, now: DateTime<Utc>) {
        let closed = self.path.pop();
        if let Some((field, _)) = self.field.take_if(|(_, depth)| *depth == self.path.len()) {
            self.keep(field);
        }
        if closed.as_deref() == Some("component") && self.path.len() == 1 {
            self.apps
                .extend(std::mem::take(&mut self.component).entry(now));
        }
    }

    fn keep(&mut self, field: Field) {
        let value = self.text.trim().to_owned();
        let component = &mut self.component;
        match field {
            Field::Id => component.id = value,
            Field::Package => component.package = value,
            Field::Name => component.name = value,
            Field::Summary => component.summary = value,
            Field::Developer => component.developer = value,
            Field::Category => component.categories.push(value),
            Field::Icon {
                cached: true,
                width,
            } => component.cached_icons.push((width, value)),
            Field::Icon { cached: false, .. } if value.starts_with("https://") => {
                component.remote_icon = Some(value)
            }
            Field::Icon { .. } => {}
        }
    }
}

fn read(listings: &Path, now: DateTime<Utc>) -> Vec<Entry> {
    let Ok(file) = File::open(listings) else {
        return Vec::new();
    };
    let mut reader = quick_xml::Reader::from_reader(BufReader::new(GzDecoder::new(file)));
    let mut parser = Parser::default();
    let mut buffer = Vec::new();
    loop {
        match reader.read_event_into(&mut buffer) {
            Ok(Event::Start(element)) => parser.open(&element),
            Ok(Event::Empty(element)) => {
                parser.open(&element);
                parser.close(now);
            }
            Ok(Event::End(_)) => parser.close(now),
            Ok(Event::Text(content)) if parser.field.is_some() => {
                parser.text.push_str(&content.xml10_content());
            }
            Ok(Event::GeneralRef(reference)) if parser.field.is_some() => {
                match reference.resolve_char_ref() {
                    Ok(Some(letter)) => parser.text.push(letter),
                    _ => parser.text.push_str(
                        resolve_predefined_entity(reference.as_ref()).unwrap_or_default(),
                    ),
                }
            }
            Ok(Event::Eof) | Err(_) => break,
            Ok(_) => {}
        }
        buffer.clear();
    }
    parser.apps
}

/// Fedora's desktop apps that are worth offering, read once from the AppStream
/// data in Luft's image. A computer without it lists none.
pub fn apps() -> &'static [Entry] {
    APPS.get_or_init(|| read(Path::new(LISTINGS), Utc::now()))
}

#[cfg(test)]
mod tests {
    use std::io::Write;

    use flate2::Compression;
    use flate2::write::GzEncoder;

    use super::*;

    const LISTINGS: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<components origin="fedora" version="0.8">
  <component type="desktop">
    <id>gparted.desktop</id>
    <pkgname>gparted</pkgname>
    <name>GParted</name>
    <name xml:lang="de">GParted-Partitionierung</name>
    <summary>Disks &amp; partitions</summary>
    <developer_name>GParted &#169; team</developer_name>
    <icon type="cached" height="64" width="64">gparted.png</icon>
    <icon type="cached" height="128" width="128">gparted.png</icon>
    <categories><category>System</category></categories>
    <screenshots><screenshot><caption>Main window</caption></screenshot></screenshots>
    <releases><release timestamp="1700000000" version="1.5"/><release timestamp="1760000000" version="1.6"/></releases>
  </component>
  <component type="desktop-application">
    <id>org.example.Tool</id>
    <pkgname>example-libs</pkgname>
    <name>Tool</name>
    <summary>Not an app</summary>
    <launchable type="desktop-id">org.example.Tool.desktop</launchable>
    <icon type="cached" width="64">tool.png</icon>
    <screenshots><screenshot/></screenshots>
  </component>
</components>"#;

    #[test]
    fn keeps_desktop_apps_with_their_untranslated_text() {
        let folder = tempfile::tempdir().unwrap();
        let path = folder.path().join("fedora.xml.gz");
        let mut gzip = GzEncoder::new(File::create(&path).unwrap(), Compression::fast());
        gzip.write_all(LISTINGS.as_bytes()).unwrap();
        gzip.finish().unwrap();
        let now = DateTime::from_timestamp(1_770_000_000, 0).unwrap();

        let apps = read(&path, now);

        assert_eq!(apps.len(), 1);
        let app = &apps[0];
        assert_eq!(app.id, "gparted");
        assert_eq!(app.name, "GParted");
        assert_eq!(app.summary, "Disks & partitions");
        assert_eq!(app.publisher.as_ref().unwrap().name, "GParted © team");
        assert_eq!(
            app.icon.as_deref(),
            Some("/usr/share/swcatalog/icons/fedora/128x128/gparted.png")
        );
        assert_eq!(app.categories, ["System"]);
        assert_eq!(app.package.as_deref(), Some("gparted"));
        assert_eq!(app.updated.as_deref(), Some("2025-10-09T08:53:20+00:00"));
    }
}
