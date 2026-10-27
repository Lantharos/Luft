use specta::Type;
use std::collections::HashMap;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use gio::prelude::*;
use luft_app::portal::{FileChooser, Filter};
use luft_app::{Commands, block_on};
use luft_software::apps::{appimage, debian, toolbox};
use luft_software::system::System;
use luft_software::system::repositories;
use luft_software::system::system_packages;
use quick_xml::events::Event;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};

use crate::catalog::cache;
use crate::fedora;
use crate::library::sources::Bundled;

#[derive(Serialize, Type)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Opened {
    FlatpakRef {
        path: String,
        id: String,
        title: String,
        branch: Option<String>,
        url: String,
        runtime: bool,
        summary: Option<String>,
        homepage: Option<String>,
        icon: Option<String>,
    },
    FlatpakBundle {
        path: String,
        id: String,
        title: String,
        branch: String,
        summary: Option<String>,
        icon: Option<String>,
        size: u64,
        runtime: Option<String>,
        origin: Option<String>,
    },
    FlatpakRepo {
        path: String,
        name: String,
        title: String,
        url: String,
        summary: Option<String>,
        homepage: Option<String>,
    },
    Package {
        path: String,
        package: String,
        version: String,
        summary: String,
        description: String,
        license: String,
        homepage: Option<String>,
        size: u64,
        installed: bool,
        system: bool,
        desktop: Option<String>,
        repository: Option<Bundled>,
        repository_error: Option<String>,
        verified: bool,
    },
    Deb {
        path: String,
        package: String,
        name: String,
        version: String,
        summary: String,
        description: String,
        homepage: Option<String>,
        size: u64,
        icon: Option<String>,
        installed: bool,
        runs_here: bool,
        flathub: Option<OnFlathub>,
    },
    AppImage {
        path: String,
        name: String,
        summary: Option<String>,
        version: Option<String>,
        icon: Option<String>,
        size: u64,
    },
}

/// The same app on Flathub, which installs better than a `.deb` file can.
#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct OnFlathub {
    pub id: String,
    pub name: String,
    pub summary: Option<String>,
    pub icon: Option<String>,
    pub verified: bool,
}

#[derive(Deserialize, Type)]
struct File {
    path: String,
}

fn keyfile(path: &Path, group: &str) -> Result<HashMap<String, String>, String> {
    let text = std::fs::read_to_string(path).map_err(|error| error.to_string())?;
    let header = format!("[{group}]");
    Ok(text
        .lines()
        .map(str::trim)
        .skip_while(|line| *line != header)
        .skip(1)
        .take_while(|line| !line.starts_with('['))
        .filter_map(|line| line.split_once('='))
        .map(|(key, value)| (key.trim().to_owned(), value.trim().to_owned()))
        .collect())
}

fn flatpak_ref(path: &str) -> Result<Opened, String> {
    let values = keyfile(Path::new(path), "Flatpak Ref")?;
    let id = values
        .get("Name")
        .cloned()
        .ok_or("This file doesn't name an app.")?;
    Ok(Opened::FlatpakRef {
        path: path.to_owned(),
        title: values.get("Title").cloned().unwrap_or_else(|| id.clone()),
        branch: values.get("Branch").cloned(),
        url: values.get("Url").cloned().unwrap_or_default(),
        runtime: values.get("IsRuntime").is_some_and(|value| value == "true"),
        summary: values.get("Comment").cloned(),
        homepage: values.get("Homepage").cloned(),
        icon: values.get("Icon").cloned(),
        id,
    })
}

// A bundle is an OSTree static delta, whose superblock starts with what's in it
const BUNDLE_FORMAT: &str = "(a{sv}tayay(ua(ayay))aya(uayttay)a(yaytt))";
const BUNDLE_ICONS: [&str; 2] = ["icon-128", "icon-64"];

fn bundle_value(metadata: &gio::glib::VariantDict, key: &str) -> Option<gio::glib::Variant> {
    metadata.lookup_value(key, None)
}

fn bundle_bytes(metadata: &gio::glib::VariantDict, key: &str) -> Option<Vec<u8>> {
    bundle_value(metadata, key)?
        .fixed_array::<u8>()
        .ok()
        .map(<[u8]>::to_vec)
}

/// The name and summary of the app in a bundle's AppStream data.
fn bundle_appstream(compressed: &[u8]) -> (Option<String>, Option<String>) {
    let mut xml = String::new();
    if flate2::read::GzDecoder::new(compressed)
        .read_to_string(&mut xml)
        .is_err()
    {
        return (None, None);
    }
    let mut reader = quick_xml::Reader::from_str(&xml);
    let (mut name, mut summary) = (None, None);
    let (mut current, mut field, mut text) = (String::new(), None, String::new());
    loop {
        match reader.read_event() {
            Ok(Event::Start(element)) => {
                let tag = element.local_name().as_ref().to_owned();
                let localized = element
                    .try_get_attribute("xml:lang")
                    .ok()
                    .flatten()
                    .is_some();
                // The app's untranslated name and summary, not those of the screenshots or releases inside it
                if (tag == "name" || tag == "summary") && !localized && current == "component" {
                    field = Some(tag.clone());
                    text.clear();
                }
                current = tag;
            }
            Ok(Event::Text(content)) if field.is_some() => text.push_str(&content.xml10_content()),
            Ok(Event::End(element)) => {
                let tag = element.local_name().as_ref().to_owned();
                if field.as_deref() == Some(tag.as_str()) {
                    let slot = if tag == "name" {
                        &mut name
                    } else {
                        &mut summary
                    };
                    slot.get_or_insert_with(|| text.trim().to_owned());
                    field = None;
                }
                // A bundle's data describes just its app
                if tag == "component" {
                    break;
                }
                current = "component".into();
            }
            Ok(Event::Eof) | Err(_) => break,
            Ok(_) => {}
        }
    }
    (
        name.filter(|name| !name.is_empty()),
        summary.filter(|summary| !summary.is_empty()),
    )
}

fn save_icon(bytes: &[u8], extension: &str) -> Option<String> {
    let mut hasher = DefaultHasher::new();
    bytes.hash(&mut hasher);
    let folder = cache::folder().join("opened");
    let file: PathBuf = folder.join(format!("{:x}.{extension}", hasher.finish()));
    std::fs::create_dir_all(&folder).ok()?;
    std::fs::write(&file, bytes).ok()?;
    Some(file.to_string_lossy().into_owned())
}

fn flatpak_bundle(path: &str) -> Result<Opened, String> {
    let damaged = "This Flatpak file is damaged or isn't a Flatpak app.";
    let data = std::fs::read(path).map_err(|error| error.to_string())?;
    let size = data.len() as u64;
    let format = gio::glib::VariantTy::new(BUNDLE_FORMAT).map_err(|error| error.to_string())?;
    let superblock =
        gio::glib::Variant::from_bytes_with_type(&gio::glib::Bytes::from_owned(data), format);
    let metadata = gio::glib::VariantDict::new(Some(&superblock.child_value(0)));
    let reference = bundle_value(&metadata, "ref")
        .and_then(|value| value.get::<String>())
        .ok_or(damaged)?;
    let [kind, id, _arch, branch] = reference.split('/').collect::<Vec<_>>()[..] else {
        return Err(damaged.into());
    };
    if kind != "app" {
        return Err("This Flatpak file holds a runtime, not an app. Apps that need it install it themselves.".into());
    }
    let runtime = bundle_value(&metadata, "metadata")
        .and_then(|value| value.get::<String>())
        .and_then(|keyfile| {
            keyfile
                .lines()
                .find_map(|line| line.strip_prefix("runtime="))
                .map(str::to_owned)
        });
    let (name, summary) = bundle_bytes(&metadata, "appdata")
        .map(|appdata| bundle_appstream(&appdata))
        .unwrap_or_default();
    let icon = BUNDLE_ICONS
        .iter()
        .find_map(|key| bundle_bytes(&metadata, key))
        .and_then(|bytes| save_icon(&bytes, "png"));
    Ok(Opened::FlatpakBundle {
        path: path.to_owned(),
        title: name.unwrap_or_else(|| id.rsplit('.').next().unwrap_or(id).to_owned()),
        id: id.to_owned(),
        branch: branch.to_owned(),
        summary,
        icon,
        size,
        runtime,
        // Bundles built with a repository's address keep getting updates from it
        origin: bundle_value(&metadata, "origin")
            .and_then(|value| value.get::<String>())
            .filter(|origin| !origin.is_empty()),
    })
}

fn flatpak_repo(path: &str) -> Result<Opened, String> {
    let values = keyfile(Path::new(path), "Flatpak Repo")?;
    let url = values
        .get("Url")
        .cloned()
        .ok_or("This file doesn't name a source.")?;
    let name = Path::new(path)
        .file_stem()
        .map(|stem| stem.to_string_lossy().to_lowercase())
        .unwrap_or_else(|| "source".into());
    Ok(Opened::FlatpakRepo {
        path: path.to_owned(),
        title: values.get("Title").cloned().unwrap_or_else(|| name.clone()),
        name: name
            .chars()
            .filter(|character| character.is_ascii_alphanumeric() || *character == '-')
            .collect(),
        url,
        summary: values.get("Comment").cloned(),
        homepage: values.get("Homepage").cloned(),
    })
}

fn package(path: &str) -> Result<Opened, String> {
    let output = Command::new("rpm")
        .args(["--query", "--package", "--queryformat"])
        .arg("%{NAME}\x1f%{VERSION}-%{RELEASE}\x1f%{SUMMARY}\x1f%{LICENSE}\x1f%{URL}\x1f%{SIZE}\x1f%{DESCRIPTION}")
        .arg(path)
        .output()
        .map_err(|error| error.to_string())?;
    let text = String::from_utf8_lossy(&output.stdout);
    let [name, version, summary, license, url, size, description] =
        text.split('\x1f').collect::<Vec<_>>()[..]
    else {
        return Err("This package file is damaged or isn't meant for this computer.".into());
    };
    let on_image = !fedora::available() && System::current() == System::Image;
    let (repository, repository_error) = if on_image {
        match repositories::bundled(path).and_then(|draft| draft.map(Bundled::check).transpose()) {
            Ok(repository) => (repository, None),
            Err(error) => (None, Some(error)),
        }
    } else {
        (None, None)
    };
    let desktop = repositories::desktop_entry(path)?;
    let system = on_image && (repository.is_some() || desktop.is_some());
    let installed = if fedora::available() {
        fedora::is_installed(name)
    } else if system {
        block_on(system_packages::list())
            .is_ok_and(|packages| packages.requested.iter().any(|known| known == name))
    } else {
        toolbox::installed().iter().any(|tool| tool.package == name)
    };
    Ok(Opened::Package {
        path: path.to_owned(),
        package: name.to_owned(),
        version: version.to_owned(),
        summary: summary.to_owned(),
        description: description.trim().to_owned(),
        license: license.to_owned(),
        homepage: (url != "(none)").then(|| url.to_owned()),
        size: size.parse().unwrap_or(0),
        installed,
        system,
        desktop,
        repository,
        repository_error,
        verified: signed(path),
    })
}

/// Whether the package is signed with a key this computer's packages are
/// checked against, such as Fedora's.
fn signed(path: &str) -> bool {
    Command::new("rpmkeys")
        .args(["--checksig", "--define", "_pkgverify_level signature"])
        .arg(path)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|status| status.success())
}

fn simplified(name: &str) -> String {
    name.chars()
        .filter(char::is_ascii_alphanumeric)
        .collect::<String>()
        .to_lowercase()
}

/// Finds the app on Flathub by its name, which only counts when it's exactly the same.
pub fn on_flathub(name: &str) -> Option<OnFlathub> {
    let found: serde_json::Value =
        serde_json::from_str(crate::catalog::flathub::search(name).ok()?.get()).ok()?;
    let wanted = simplified(name);
    let text = |hit: &serde_json::Value, key: &str| hit[key].as_str().map(str::to_owned);
    found["hits"]
        .as_array()?
        .iter()
        .find(|hit| {
            hit["name"]
                .as_str()
                .is_some_and(|name| simplified(name) == wanted)
        })
        .and_then(|hit| {
            Some(OnFlathub {
                id: text(hit, "app_id")?,
                name: text(hit, "name")?,
                summary: text(hit, "summary"),
                icon: text(hit, "icon"),
                verified: hit["verification_verified"].as_bool().unwrap_or(false),
            })
        })
}

fn deb(path: &str) -> Result<Opened, String> {
    let deb = debian::inspect(Path::new(path))?;
    let name = deb.name.clone().unwrap_or_else(|| deb.package.clone());
    Ok(Opened::Deb {
        path: path.to_owned(),
        installed: debian::installed()
            .iter()
            .any(|app| app.package == deb.package),
        runs_here: debian::runs_here(&deb.architecture),
        flathub: on_flathub(&name),
        icon: deb
            .icon
            .as_ref()
            .and_then(|icon| save_icon(&icon.bytes, &icon.extension)),
        package: deb.package,
        version: deb.version,
        summary: deb.summary,
        description: deb.description,
        homepage: deb.homepage,
        size: deb.size,
        name,
    })
}

fn appimage_file(path: &str) -> Result<Opened, String> {
    let bundle = appimage::inspect(Path::new(path))?;
    let icon = bundle
        .icons
        .first()
        .and_then(|icon| save_icon(&icon.bytes, icon.extension));
    Ok(Opened::AppImage {
        path: path.to_owned(),
        name: bundle.entry.get("Name").unwrap_or("AppImage").to_owned(),
        summary: bundle.entry.get("Comment").map(str::to_owned),
        version: bundle.entry.get("X-AppImage-Version").map(str::to_owned),
        size: Path::new(path)
            .metadata()
            .map(|metadata| metadata.len())
            .unwrap_or(0),
        icon,
    })
}

pub fn inspect(path: &str) -> Result<Opened, String> {
    let lowered = path.to_lowercase();
    if lowered.ends_with(".flatpakref") {
        flatpak_ref(path)
    } else if lowered.ends_with(".flatpak") {
        flatpak_bundle(path)
    } else if lowered.ends_with(".flatpakrepo") {
        flatpak_repo(path)
    } else if lowered.ends_with(".deb") {
        deb(path)
    } else if lowered.ends_with(".rpm") {
        package(path)
    } else if appimage::is_appimage(Path::new(path)) {
        appimage_file(path)
    } else {
        Err("Schelf can't install this kind of file.".into())
    }
}

async fn choose(_: serde_json::Value) -> Result<Option<String>, String> {
    let chosen = FileChooser {
        title: "Add an AppImage",
        filters: vec![Filter {
            name: "AppImages",
            patterns: vec!["*.AppImage".into(), "*.appimage".into()],
        }],
        ..FileChooser::default()
    }
    .open()
    .await?;
    Ok(chosen
        .first()
        .and_then(|uri| gio::File::for_uri(uri).path())
        .map(|path| path.to_string_lossy().into_owned()))
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("files_inspect", |File { path }| inspect(&path))
        .command_async("files_choose_appimage", choose)
}
