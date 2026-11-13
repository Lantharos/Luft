pub mod issues;
pub mod listing;
pub mod media;
pub mod preview;

use std::path::Path;
use std::sync::LazyLock;

use regex::Regex;
use toml::Value;

use crate::error::Result;
use crate::project::config::{ConfigPlace, relative};
use crate::project::files::read_optional;
use crate::project::permissions::describe_permissions;
use crate::project::{Project, bare_id};
use crate::schema::listing::ListingToml;
use crate::schema::platforms::same_app_id;
use crate::schema::schelf::SchelfToml;
use crate::schema::{
    ConfigIssue, LISTING_TOML, SCHELF_TOML, extensions, join_config_path, permissions,
};
use crate::setup::workflow::{PUBLISH_ACTION, SCHELF_WORKFLOW};
use issues::{Issue, Level, errors_from};

static PINNED_SABINE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"release-app\.yml@v?([\d.]+)").unwrap());
static LUFT_VERSION: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^(\d+)\.(\d+)(?:-nightly\.(\d+))?$").unwrap());

/// What `schelf check` found in the files.
pub struct Validation {
    pub manifest: Option<SchelfToml>,
    pub listing: Option<ListingToml>,
    pub access: Vec<String>,
    pub full_access: bool,
    pub issues: Vec<Issue>,
}

fn declaration<T>(
    read: std::result::Result<T, Vec<ConfigIssue>>,
    issues: &mut Vec<Issue>,
) -> Option<T> {
    read.map_err(|found| issues.extend(errors_from(found))).ok()
}

fn read_listing_files(
    root: &Path,
    manifest: &SchelfToml,
    issues: &mut Vec<Issue>,
) -> Result<Option<ListingToml>> {
    let Some(listing) = &manifest.listing else {
        return Ok(None);
    };
    let folder = join_config_path(&[listing]);
    let file = join_config_path(&[&folder, LISTING_TOML]);
    let Some(text) = read_optional(&root.join(&file))? else {
        issues.push(
            Issue::new(
                Level::Error,
                SCHELF_TOML,
                Some("listing"),
                format!("{file} doesn't exist"),
            )
            .hinted("schelf init writes one."),
        );
        return Ok(None);
    };
    let value = match crate::schema::listing::parse(&file, &text) {
        Ok(value) => value,
        Err(found) => {
            issues.extend(errors_from(found));
            return Ok(None);
        }
    };
    issues.extend(media::media_issues(root, &folder, &file, &value));
    issues.extend(listing::listing_issues(&file, &value));
    Ok(Some(value))
}

fn luft_issues(minimum: Option<&Value>) -> Vec<Issue> {
    let Some(minimum) = minimum else {
        return vec![
            Issue::new(
                Level::Error,
                "extension.toml",
                Some("luft.minimum"),
                "doesn't say the oldest Luft it runs on",
            )
            .hinted("Add [luft] with minimum = \"1.0\", or a nightly such as minimum = \"1.0-nightly.27\"."),
        ];
    };
    let message = match minimum.as_str() {
        Some(version) if LUFT_VERSION.is_match(version) => return Vec::new(),
        Some(_) => "A Luft version looks like 1.2 or 1.2-nightly.21",
        None => {
            "extension.toml needs the oldest Luft it runs on: add [luft] with minimum = \"1.0\", or a nightly such as minimum = \"1.0-nightly.27\""
        }
    };
    vec![Issue::new(
        Level::Error,
        "extension.toml",
        Some("luft.minimum"),
        message,
    )]
}

fn identity_issues(project: &Project, manifest: &SchelfToml) -> Vec<Issue> {
    let mut issues = Vec::new();
    let declared = [
        (
            Some("Sabine.toml".to_owned()),
            project.sabine.as_ref().map(|sabine| sabine.id.clone()),
        ),
        (
            Some("extension.toml".to_owned()),
            project
                .extension
                .as_ref()
                .map(|extension| extension.id.clone()),
        ),
        (
            project.appstream.as_ref().map(|entry| entry.path.clone()),
            project
                .appstream
                .as_ref()
                .map(|entry| bare_id(&entry.component.id).to_owned()),
        ),
    ];
    for (file, id) in declared {
        if let (Some(file), Some(id), Some(own)) =
            (file, id.filter(|id| !id.is_empty()), &manifest.id)
            && !same_app_id(&id, own)
        {
            let level = if file.ends_with(".xml") {
                Level::Warning
            } else {
                Level::Error
            };
            issues.push(Issue::new(
                level,
                SCHELF_TOML,
                Some("id"),
                format!("{own}, but {file} says {id}"),
            ));
        }
    }
    if project.sabine.is_some() && manifest.format != "sabine" {
        issues.push(Issue::new(
            Level::Warning,
            SCHELF_TOML,
            Some("format"),
            format!("{}, but there's a Sabine.toml", manifest.format),
        ));
    }
    if let Some(extension) = &project.extension {
        if manifest.extension_api != Some(extension.api) {
            let declared = manifest
                .extension_api
                .map_or_else(|| "undefined".to_owned(), |api| api.to_string());
            issues.push(Issue::new(
                Level::Error,
                SCHELF_TOML,
                Some("requires.extension_api"),
                format!("{declared}, but extension.toml targets {}", extension.api),
            ));
        }
        issues.extend(luft_issues(extension.luft.as_ref()));
    }
    let schelf_updates = project
        .sabine
        .as_ref()
        .is_some_and(|sabine| sabine.updates_provider.as_deref() == Some("schelf"));
    if manifest.format == "sabine" && !schelf_updates {
        issues.push(
            Issue::new(
                Level::Warning,
                "Sabine.toml",
                Some("updates.provider"),
                "isn't schelf, so copies on Windows and macOS won't get updates",
            )
            .hinted("Set provider = \"schelf\" under [updates]."),
        );
    }
    issues
}

fn workflow_for(place: &ConfigPlace) -> Result<(String, Option<String>)> {
    let file = relative(&place.root, &place.config);
    let folder = place.root.join(".github").join("workflows");
    let mut names: Vec<String> = std::fs::read_dir(&folder)
        .map(|entries| {
            entries
                .flatten()
                .map(|entry| entry.file_name().to_string_lossy().into_owned())
                .filter(|name| name.ends_with(".yml") || name.ends_with(".yaml"))
                .collect()
        })
        .unwrap_or_default();
    names.sort();
    for name in names {
        if let Some(text) = read_optional(&folder.join(&name))?
            && text.contains(&file)
        {
            return Ok((format!(".github/workflows/{name}"), Some(text)));
        }
    }
    Ok((file, None))
}

fn workflow_issues(place: &ConfigPlace, manifest: &SchelfToml) -> Result<Vec<Issue>> {
    let in_monorepo = place.folder != place.root;
    let (file, text) = if in_monorepo {
        workflow_for(place)?
    } else {
        (
            SCHELF_WORKFLOW.to_owned(),
            read_optional(&place.root.join(SCHELF_WORKFLOW))?,
        )
    };
    let Some(workflow) = text else {
        if in_monorepo {
            return Ok(vec![
                Issue::new(Level::Warning, &file, None, "isn't named by any workflow in .github/workflows")
                    .hinted(format!(
                        "Publish it from a workflow with schelf-toml: {file}, or from your own pipeline."
                    )),
            ]);
        }
        return Ok(vec![
            Issue::new(Level::Error, SCHELF_WORKFLOW, None, "doesn't exist")
                .hinted("Run schelf init to write it."),
        ]);
    };
    let mut issues = Vec::new();
    let action = PUBLISH_ACTION.split('@').next().unwrap_or(PUBLISH_ACTION);
    if !workflow.contains(action) {
        issues.push(Issue::new(
            Level::Error,
            &file,
            None,
            format!("doesn't use {PUBLISH_ACTION}"),
        ));
    }
    let pinned = PINNED_SABINE
        .captures(&workflow)
        .map(|found| found[1].to_owned());
    if let (Some(pinned), Some(required)) = (pinned, &manifest.sabine)
        && manifest.format == "sabine"
        && pinned != required.strip_prefix('v').unwrap_or(required)
    {
        issues.push(Issue::new(
            Level::Warning,
            &file,
            None,
            format!("builds with Sabine {pinned}, schelf.toml requires {required}"),
        ));
    }
    Ok(issues)
}

/// Checks schelf.toml, the permission declaration, the listing and the
/// workflow for what would hold a release back.
pub fn validate(project: &Project, place: &ConfigPlace) -> Result<Validation> {
    let mut issues = Vec::new();
    let text = read_optional(&place.config)?;
    if text.is_none() {
        issues.push(
            Issue::new(Level::Error, SCHELF_TOML, None, "doesn't exist")
                .hinted("Run schelf init to set the app up."),
        );
    }
    let manifest = text
        .as_ref()
        .and_then(|text| declaration(crate::schema::schelf::parse(SCHELF_TOML, text), &mut issues));
    let mut access = describe_permissions(None);
    let mut full_access = true;
    if let Some(file) = manifest
        .as_ref()
        .and_then(|manifest| manifest.permissions.clone())
    {
        let manifest = manifest
            .as_ref()
            .expect("permissions come from schelf.toml");
        match read_optional(&project.root.join(&file))? {
            None => issues.push(Issue::new(
                Level::Error,
                SCHELF_TOML,
                Some("permissions"),
                format!("{file} doesn't exist"),
            )),
            Some(text) if manifest.kind == "extension" => {
                let extension = declaration(extensions::read(&file, &text), &mut issues);
                access = extension
                    .as_ref()
                    .map(extensions::labels)
                    .unwrap_or_default();
                full_access = extension.is_some_and(|extension| extension.helper);
            }
            Some(text) => {
                let declared = declaration(permissions::read(&file, &text), &mut issues);
                access = describe_permissions(declared.as_ref());
                full_access =
                    manifest.format == "sabine" || permissions::full_access(declared.as_ref());
            }
        }
    } else if manifest
        .as_ref()
        .is_some_and(|manifest| manifest.format == "appimage")
    {
        issues.push(
            Issue::new(
                Level::Warning,
                SCHELF_TOML,
                Some("permissions"),
                "isn't set, so the store shows the app as needing full access",
            )
            .hinted("Declare what it needs under [sandbox] in permissions.toml and set permissions = \"permissions.toml\"."),
        );
    }
    let Some(manifest) = manifest else {
        return Ok(Validation {
            manifest: None,
            listing: None,
            access,
            full_access,
            issues,
        });
    };
    issues.extend(identity_issues(project, &manifest));
    issues.extend(workflow_issues(place, &manifest)?);
    let listing = read_listing_files(&project.root, &manifest, &mut issues)?;
    if manifest.listing.is_none() && manifest.format != "files" {
        issues.push(
            Issue::new(
                Level::Warning,
                SCHELF_TOML,
                Some("listing"),
                "isn't set, so the store page is whatever the dashboard has",
            )
            .hinted("Set listing = \"store\" and describe the page in store/listing.toml."),
        );
    }
    Ok(Validation {
        manifest: Some(manifest),
        listing,
        access,
        full_access,
        issues,
    })
}

#[cfg(test)]
mod tests;
