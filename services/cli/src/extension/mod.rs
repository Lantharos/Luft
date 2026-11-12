//! Making an extension, checking it, trying it and packing it for the store.

pub mod manifest;
mod pack;
mod template;

use std::path::{Path, PathBuf};

use luft_dbus_macros::introspect;
use serde::Serialize;
use zbus::proxy;

use crate::bus;
use crate::cli::ExtensionAction;
use crate::failure::{Failure, Outcome};
use crate::logs::{self, Units};
use crate::output::{Output, table};
use manifest::{IN_DESKTOP_ONLY, Manifest};

const OWN_FOLDER: &str = "luft/extensions";
const FALLBACK_MINIMUM: &str = "1.1";
const KESTREL: &str = "kestrel.service";
const LINES: u32 = 500;

#[introspect]
#[proxy(
    interface = "com.lantharos.Kestrel.Extensions",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/Extensions"
)]
trait Extensions {
    fn reload(&self, id: &str) -> zbus::Result<()>;
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Checked {
    pub manifest: Manifest,
    pub warnings: Vec<String>,
}

fn messages(folder: &Path) -> String {
    std::fs::read_dir(folder.join("locales/en"))
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| std::fs::read_to_string(entry.path()).ok())
        .collect()
}

/// The manifest, held to Kestrel's rules, and what else would trip the
/// extension up in Luft.
pub fn check(folder: &Path) -> Outcome<Checked> {
    let source = std::fs::read_to_string(folder.join("extension.toml")).map_err(|error| {
        Failure::invalid(format!(
            "{}: {error}",
            folder.join("extension.toml").display()
        ))
    })?;
    let manifest = manifest::parse(&source)
        .map_err(|reason| Failure::invalid(format!("extension.toml: {reason}")))?;
    let named = std::fs::canonicalize(folder)?
        .file_name()
        .map(|name| name.to_string_lossy().into_owned());
    let mut warnings = Vec::new();
    if named.as_deref() != Some(manifest.id.as_str()) {
        warnings.push(format!(
            "Luft loads an extension from a folder named after its id, {}.",
            manifest.id
        ));
    }
    if !folder.join("extension.js").is_file() && !folder.join("build.sh").is_file() {
        warnings.push(
            "There's no extension.js yet: bundle the code into it before trying the extension."
                .to_owned(),
        );
    }
    if let Some(helper) = &manifest.helper
        && !folder.join(helper).is_file()
    {
        warnings.push(format!("The helper {helper} isn't there yet."));
    }
    let english = messages(folder);
    for label in manifest
        .labels
        .iter()
        .chain(["extension-name".to_owned()].iter())
    {
        if !english
            .lines()
            .any(|line| line.split_once(" = ").is_some_and(|(id, _)| id == label))
        {
            warnings.push(format!("locales/en has no message {label}."));
        }
    }
    if manifest.minimum.is_none() {
        warnings.push("[luft] minimum is missing: the store needs it.".to_owned());
    }
    let inside: Vec<&str> = manifest
        .permissions
        .iter()
        .map(String::as_str)
        .filter(|permission| IN_DESKTOP_ONLY.contains(permission))
        .collect();
    if !inside.is_empty() || manifest.listens {
        warnings.push(format!(
            "From your own folder it runs in a sandbox, which doesn't offer {}; luft extension run-in-luft tries it inside the desktop.",
            if inside.is_empty() { "listening on ports".to_owned() } else { inside.join(", ") }
        ));
    }
    Ok(Checked { manifest, warnings })
}

fn own_folder() -> Outcome<PathBuf> {
    dirs::data_dir()
        .map(|data| data.join(OWN_FOLDER))
        .ok_or_else(|| Failure::failed("There's no data folder for extensions."))
}

pub async fn reload(id: &str) -> Outcome {
    ExtensionsProxy::new(bus::session().await?)
        .await?
        .reload(id)
        .await
        .map_err(|error| Failure::invalid(luft_dbus::explain(&error)))
}

fn scope_of(id: &str) -> String {
    let unit: String = id
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || ":_.".contains(character) {
                character
            } else {
                '_'
            }
        })
        .collect();
    format!("app-kestrel-extension-{unit}-*.scope")
}

fn extension_journal(id: &str, follow: bool) -> std::process::Command {
    let units = Units {
        system: Vec::new(),
        user: vec![scope_of(id), KESTREL.to_owned()],
    };
    logs::journalctl(&units, None, LINES, follow, true)
}

fn about(id: &str) -> impl Fn(&logs::Line) -> bool + '_ {
    move |line| line.unit.as_deref() != Some(KESTREL) || line.message.contains(id)
}

pub fn logs_of(id: &str) -> Outcome<Vec<logs::Line>> {
    let mut found = Vec::new();
    logs::read(extension_journal(id, false), about(id), |line| {
        found.push(line)
    })?;
    Ok(found)
}

fn extension_logs(id: &str, follow: bool, output: Output) -> Outcome {
    if output.json && !follow {
        let found = logs_of(id)?;
        return output.show(&found, String::new);
    }
    logs::stream(extension_journal(id, follow), output.json, about(id))
}

/// Makes a new extension's folder in `parent`, for the running version of
/// Luft or a version before.
pub fn make(id: &str, parent: &Path, minimum: Option<String>) -> Outcome<PathBuf> {
    if !manifest::is_id(id) {
        return Err(Failure::invalid(format!(
            "“{id}” isn't an extension id: use reverse DNS with three parts or more, such as com.example.Weather."
        )));
    }
    template::make(
        parent,
        id,
        &minimum.unwrap_or_else(|| FALLBACK_MINIMUM.to_owned()),
    )
}

pub fn packed(folder: &Path, output: &Path) -> Outcome<PathBuf> {
    let checked = check(folder)?;
    pack::pack(folder, &checked.manifest, output)
}

fn open_settings(link: &str) -> Outcome {
    gio::AppInfo::launch_default_for_uri(link, None::<&gio::AppLaunchContext>)
        .map_err(|error| Failure::unavailable(format!("Settings didn't open: {error}")))
}

pub async fn running_version() -> Option<String> {
    luft_software::system::image::Deployments::load()
        .await
        .ok()?
        .running()
        .version
}

fn run_in_luft(folder: &Path, output: Output) -> Outcome {
    let checked = check(folder)?;
    let id = checked.manifest.id.clone();
    let own = own_folder()?.join(&id);
    if std::fs::canonicalize(folder)? != std::fs::canonicalize(&own).unwrap_or_default() {
        return Err(Failure::invalid(format!(
            "Luft runs an extension you're writing from {}. Move or link it there first.",
            own.display()
        )));
    }
    bus::block_on(async {
        bus::require_developer_tools().await?;
        reload(&id).await
    })??;
    let link = format!("kestrel-settings:extensions/{id}");
    open_settings(&link)?;
    output.show(&serde_json::json!({ "opened": link }), || {
        format!("Settings opened {id}. Choose Run from its folder there and approve it; luft extension reload {id} starts it again with your changes.")
    })
}

pub fn run(action: ExtensionAction, output: Output) -> Outcome {
    match action {
        ExtensionAction::New { id, directory } => {
            let folder = make(&id, &directory, bus::block_on(running_version())?)?;
            output.show(&serde_json::json!({ "folder": folder }), || {
                format!(
                    "Made {}. Try it with luft extension reload {id} once it's in {}.",
                    folder.display(),
                    own_folder()
                        .map(|own| own.display().to_string())
                        .unwrap_or_default()
                )
            })
        }
        ExtensionAction::Check { directory } => {
            let checked = check(&directory)?;
            output.show(&checked, || {
                let mut words = table([
                    (
                        "Extension",
                        format!("{} {}", checked.manifest.name, checked.manifest.version),
                    ),
                    ("Id", checked.manifest.id.clone()),
                    ("Permissions", checked.manifest.permissions.join(", ")),
                ]);
                for warning in &checked.warnings {
                    words.push_str(&format!("Note: {warning}\n"));
                }
                words
            })
        }
        ExtensionAction::Reload { id } => {
            bus::block_on(reload(&id))??;
            output.show(&serde_json::json!({ "reloaded": id }), || {
                format!("Kestrel loaded {id} again.")
            })
        }
        ExtensionAction::Logs { id, follow } => extension_logs(&id, follow, output),
        ExtensionAction::Pack {
            directory,
            output: into,
        } => {
            let archive = packed(&directory, &into)?;
            output.show(&serde_json::json!({ "package": archive }), || {
                format!("Packed {}.", archive.display())
            })
        }
        ExtensionAction::RunInLuft { directory } => run_in_luft(&directory, output),
    }
}
