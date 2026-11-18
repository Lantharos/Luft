mod gvariant;

use std::collections::HashMap;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use luft_dbus::runtime::block_on;
use luft_i18n::t;
use luft_software::apps::flatpak::Permissions;
use luft_software::apps::{appimage, debian};
use luft_software::system::repositories;
use luft_software::system::system_packages;
use quick_xml::events::Event;
use serde::Serialize;
use specta::Type;

use crate::catalog::cache;
use crate::l10n::L10N;
use crate::library::sources::CheckedSource;
use crate::store;
use crate::store::catalog::Origin;

#[derive(Serialize, Type)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum OpenedFile {
    FlatpakRef {
        path: String,
        id: String,
        title: String,
        branch: Option<String>,
        url: String,
        runtime: bool,
        summary: Option<String>,
        homepage: Option<String>,
    },
    FlatpakBundle {
        path: String,
        id: String,
        title: String,
        branch: String,
        summary: Option<String>,
        developer: Option<String>,
        icon: Option<String>,
        size: u64,
        runtime: Option<String>,
        /// The repository it keeps getting updates from, when it was built
        /// with one's address.
        origin: Option<String>,
        /// What its sandbox opens to it.
        permissions: Option<Permissions>,
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
        vendor: Option<String>,
        size: u64,
        installed: bool,
        desktop: Option<String>,
        repository: Option<CheckedSource>,
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
        maintainer: Option<String>,
        size: u64,
        /// The file name of its main app's menu entry.
        desktop: Option<String>,
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
        /// The file name of its menu entry.
        desktop: Option<String>,
        /// What it declared it needs, for a Sabine app.
        permissions: Option<Permissions>,
        /// Why it asks to run outside a sandbox, when it does.
        unsandboxed: Option<String>,
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

fn flatpak_ref(path: &str) -> Result<OpenedFile, String> {
    let values = keyfile(Path::new(path), "Flatpak Ref")?;
    let id = values
        .get("Name")
        .cloned()
        .ok_or_else(|| t!(L10N, "core-file-no-app"))?;
    Ok(OpenedFile::FlatpakRef {
        path: path.to_owned(),
        title: values.get("Title").cloned().unwrap_or_else(|| id.clone()),
        branch: values.get("Branch").cloned(),
        url: values.get("Url").cloned().unwrap_or_default(),
        runtime: values.get("IsRuntime").is_some_and(|value| value == "true"),
        summary: values.get("Comment").cloned(),
        homepage: values.get("Homepage").cloned(),
        id,
    })
}

/// An OSTree static delta's superblock, which a bundle is and which starts
/// with what's in it.
const BUNDLE_ICONS: [&str; 2] = ["icon-128", "icon-64"];

struct BundleMetadata<'a>(Vec<(&'a str, &'a [u8], &'a str)>);

impl BundleMetadata<'_> {
    fn value(&self, key: &str, kind: &str) -> Option<&[u8]> {
        self.0
            .iter()
            .find(|(name, _, found)| *name == key && *found == kind)
            .map(|(_, value, _)| *value)
    }

    fn text(&self, key: &str) -> Option<&str> {
        gvariant::text(self.value(key, "s")?)
    }

    fn bytes(&self, key: &str) -> Option<&[u8]> {
        self.value(key, "ay")
    }
}

#[derive(Default)]
struct BundleAppstream {
    name: Option<String>,
    summary: Option<String>,
    developer: Option<String>,
}

/// The untranslated name, summary and developer of the app in a bundle's
/// AppStream data, which describes just that app: its first component.
fn bundle_appstream(compressed: &[u8]) -> BundleAppstream {
    let mut xml = String::new();
    if flate2::read::GzDecoder::new(compressed)
        .read_to_string(&mut xml)
        .is_err()
    {
        return BundleAppstream::default();
    }
    let mut reader = quick_xml::Reader::from_str(&xml);
    let mut found = BundleAppstream::default();
    let (mut current, mut field, mut text) = (String::new(), None, String::new());
    loop {
        match reader.read_event() {
            Ok(Event::Start(element)) => {
                let tag: String = element.local_name().as_ref().to_owned();
                let localized = element
                    .try_get_attribute("xml:lang")
                    .ok()
                    .flatten()
                    .is_some();
                let wanted = match (current.as_str(), tag.as_str()) {
                    ("component", "name" | "summary") => Some(tag.clone()),
                    ("component", "developer_name") | ("developer", "name") => {
                        Some("developer".to_owned())
                    }
                    _ => None,
                };
                if let Some(wanted) = wanted.filter(|_| !localized) {
                    field = Some((wanted, tag.clone()));
                    text.clear();
                }
                current = tag;
            }
            Ok(Event::Text(content)) if field.is_some() => text.push_str(&content.xml10_content()),
            Ok(Event::End(element)) => {
                let tag: String = element.local_name().as_ref().to_owned();
                if let Some((wanted, _)) = field.take_if(|(_, open)| *open == tag) {
                    let slot = match wanted.as_str() {
                        "name" => &mut found.name,
                        "summary" => &mut found.summary,
                        _ => &mut found.developer,
                    };
                    slot.get_or_insert_with(|| text.trim().to_owned());
                }
                if tag == "component" {
                    break;
                }
                current = "component".into();
            }
            Ok(Event::Eof) | Err(_) => break,
            Ok(_) => {}
        }
    }
    let present = |value: Option<String>| value.filter(|value| !value.is_empty());
    BundleAppstream {
        name: present(found.name),
        summary: present(found.summary),
        developer: present(found.developer),
    }
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

fn flatpak_bundle(path: &str) -> Result<OpenedFile, String> {
    let damaged = || t!(L10N, "core-file-damaged-flatpak");
    let file = std::fs::File::open(path).map_err(|error| error.to_string())?;
    let mapped = unsafe { memmap2::Mmap::map(&file) }.map_err(|error| error.to_string())?;
    let size = mapped.len() as u64;
    let metadata = BundleMetadata(gvariant::entries(
        gvariant::first_member(&mapped).ok_or_else(damaged)?,
    ));
    let reference = metadata.text("ref").ok_or_else(damaged)?;
    let [kind, id, _arch, branch] = reference.split('/').collect::<Vec<_>>()[..] else {
        return Err(damaged());
    };
    if kind != "app" {
        return Err(t!(L10N, "core-file-runtime"));
    }
    let declared = metadata.text("metadata");
    let runtime = declared.and_then(|keyfile| {
        keyfile
            .lines()
            .find_map(|line| line.strip_prefix("runtime="))
            .map(str::to_owned)
    });
    let BundleAppstream {
        name,
        summary,
        developer,
    } = metadata
        .bytes("appdata")
        .map(bundle_appstream)
        .unwrap_or_default();
    let icon = BUNDLE_ICONS
        .iter()
        .find_map(|key| metadata.bytes(key))
        .and_then(|bytes| save_icon(bytes, "png"));
    Ok(OpenedFile::FlatpakBundle {
        path: path.to_owned(),
        title: name.unwrap_or_else(|| id.rsplit('.').next().unwrap_or(id).to_owned()),
        id: id.to_owned(),
        branch: branch.to_owned(),
        summary,
        developer,
        icon,
        size,
        runtime,
        permissions: declared.map(Permissions::parse),
        origin: metadata
            .text("origin")
            .filter(|origin| !origin.is_empty())
            .map(str::to_owned),
    })
}

fn flatpak_repo(path: &str) -> Result<OpenedFile, String> {
    let values = keyfile(Path::new(path), "Flatpak Repo")?;
    let url = values
        .get("Url")
        .cloned()
        .ok_or_else(|| t!(L10N, "core-file-no-source"))?;
    let name = Path::new(path)
        .file_stem()
        .map(|stem| stem.to_string_lossy().to_lowercase())
        .unwrap_or_else(|| "source".into());
    Ok(OpenedFile::FlatpakRepo {
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

fn package(path: &str) -> Result<OpenedFile, String> {
    let output = Command::new("rpm")
        .args(["--query", "--package", "--queryformat"])
        .arg("%{NAME}\x1f%{VERSION}-%{RELEASE}\x1f%{SUMMARY}\x1f%{LICENSE}\x1f%{URL}\x1f%{VENDOR}\x1f%{SIZE}\x1f%{DESCRIPTION}")
        .arg(path)
        .output()
        .map_err(|error| error.to_string())?;
    let text = String::from_utf8_lossy(&output.stdout);
    let [
        name,
        version,
        summary,
        license,
        url,
        vendor,
        size,
        description,
    ] = text.split('\x1f').collect::<Vec<_>>()[..]
    else {
        return Err(t!(L10N, "core-file-damaged-package"));
    };
    let (repository, repository_error) = match repositories::bundled(path)
        .and_then(|draft| draft.map(CheckedSource::check).transpose())
    {
        Ok(repository) => (repository, None),
        Err(error) => (None, Some(error)),
    };
    let desktop = repositories::desktop_entry(path)?;
    let installed = block_on(system_packages::list())
        .is_ok_and(|packages| packages.requested.iter().any(|known| known == name));
    Ok(OpenedFile::Package {
        path: path.to_owned(),
        package: name.to_owned(),
        version: version.to_owned(),
        summary: summary.to_owned(),
        description: description.trim().to_owned(),
        license: license.to_owned(),
        homepage: (url != "(none)").then(|| url.to_owned()),
        vendor: (vendor != "(none)").then(|| vendor.to_owned()),
        size: size.parse().unwrap_or(0),
        installed,
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
    let catalog = store::catalog::current().ok()?;
    let wanted = simplified(name);
    catalog
        .entries()
        .iter()
        .find(|entry| entry.origin == Origin::Flathub && simplified(&entry.name) == wanted)
        .map(|entry| OnFlathub {
            id: entry.id.clone(),
            name: entry.name.clone(),
            summary: Some(entry.summary.clone()).filter(|summary| !summary.is_empty()),
            icon: entry.icon.clone(),
            verified: entry
                .publisher
                .as_ref()
                .is_some_and(|publisher| publisher.verified),
        })
}

fn deb(path: &str) -> Result<OpenedFile, String> {
    let deb = debian::inspect(Path::new(path))?;
    let name = deb.name.clone().unwrap_or_else(|| deb.package.clone());
    Ok(OpenedFile::Deb {
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
        maintainer: deb.maintainer,
        size: deb.size,
        desktop: deb.desktop,
        name,
    })
}

fn appimage_file(path: &str) -> Result<OpenedFile, String> {
    let bundle = appimage::inspect(Path::new(path))?;
    let icon = bundle
        .icons
        .first()
        .and_then(|icon| save_icon(&icon.bytes, icon.extension));
    Ok(OpenedFile::AppImage {
        path: path.to_owned(),
        name: bundle.entry.get("Name").unwrap_or("AppImage").to_owned(),
        summary: bundle.entry.get("Comment").map(str::to_owned),
        version: bundle.entry.get("X-AppImage-Version").map(str::to_owned),
        size: Path::new(path)
            .metadata()
            .map(|metadata| metadata.len())
            .unwrap_or(0),
        icon,
        desktop: bundle.desktop_id.as_ref().map(|id| format!("{id}.desktop")),
        permissions: bundle
            .declaration
            .as_ref()
            .filter(|declaration| declaration.unsandboxed.is_none())
            .map(|declaration| declaration.permissions()),
        unsandboxed: bundle
            .declaration
            .and_then(|declaration| declaration.unsandboxed),
    })
}

pub fn inspect(path: &str) -> Result<OpenedFile, String> {
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
        Err(t!(L10N, "core-file-unknown"))
    }
}
