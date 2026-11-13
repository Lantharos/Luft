use serde::Serialize;
use serde_json::value::RawValue;

use super::files::print_applied;
use super::status::print_checks;
use crate::api::identity::{Credential, Kind, credential};
use crate::api::{Reply, dashboard::Dashboard, pick};
use crate::args::Args;
use crate::artifacts::Shape;
use crate::artifacts::bundle::{ConfigBundle, apply_config, config_bundle};
use crate::artifacts::collect::{HashedArtifact, collect_artifacts, hash_artifacts};
use crate::artifacts::context::release_context;
use crate::artifacts::release::{
    CompleteResponse, PublishFile, Published, ReleaseInput, publish_release, upload_release,
};
use crate::artifacts::version::{VersionSource, release_version};
use crate::error::{Error, Result};
use crate::project::config::config_place;
use crate::project::git::git;
use crate::ui::output::{blank, done, emit, field_in, line, step, title};
use crate::ui::style::{bold, link};
use crate::ui::{FAILED, OK, USAGE};

#[derive(Serialize)]
struct Upload<'a> {
    version: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    channel: Option<&'a str>,
    notes: &'a str,
    bridge: bool,
    files: Vec<PublishFile<'a>>,
}

fn upload_as_person(
    api: &str,
    signed: &Credential,
    id: &str,
    input: &ReleaseInput,
) -> Result<Published> {
    let applied = apply_config(api, &signed.token, input.config, false, None)?;
    let files = input
        .artifacts
        .iter()
        .map(|hashed| PublishFile {
            executable: None,
            blockmap: None,
            blockmap_size: None,
            ..PublishFile::of(hashed)
        })
        .collect();
    let release = Dashboard::new(api, &signed.token).upload(
        id,
        &Upload {
            version: input.version,
            channel: input.channel,
            notes: input.notes,
            bridge: input.bridge,
            files,
        },
    )?;
    let completed = upload_release(api, &release.value, input.artifacts)?;
    Ok(Published {
        applied,
        release,
        completed,
    })
}

#[derive(Serialize)]
struct Outcome<'a> {
    applied: &'a RawValue,
    release: Box<RawValue>,
    status: Box<RawValue>,
    checks: Box<RawValue>,
    url: Box<RawValue>,
}

fn report(published: &Published) -> i32 {
    let completed: &Reply<CompleteResponse> = &published.completed;
    emit(&Outcome {
        applied: &published.applied.raw,
        release: pick(&published.release.raw, "release"),
        status: pick(&completed.raw, "status"),
        checks: pick(&completed.raw, "checks"),
        url: pick(&completed.raw, "dashboard"),
    });
    print_applied(&published.applied.value);
    let release = &published.release.value;
    done(&format!(
        "{} is {}",
        bold(&format!("{} {}", release.app, release.version)),
        completed.value.status.replacen('-', " ", 1)
    ));
    let checks: Vec<(String, String, String)> = completed
        .value
        .checks
        .iter()
        .map(|check| {
            (
                check.name.clone(),
                check.status.clone(),
                check.summary.clone(),
            )
        })
        .collect();
    print_checks(&checks);
    if !completed.value.tools.is_empty() {
        blank();
    }
    completed
        .value
        .tools
        .iter()
        .for_each(super::project::tool::print_tool);
    blank();
    line(&link(&completed.value.dashboard));
    blank();
    if checks.iter().any(|(_, status, _)| status == "failed") {
        FAILED
    } else {
        OK
    }
}

pub fn publish(args: &mut Args) -> Result<i32> {
    let api = args.api();
    let place = config_place(args.flag("config"));
    let context = release_context(&place.config)?;
    let commit = context
        .commit
        .clone()
        .or_else(|| git(&place.root, &["rev-parse", "HEAD"]));
    let channel = args.flag("channel");
    let version = release_version(
        &VersionSource {
            version: args.flag("version"),
            folder: &context.folder,
            format: &context.manifest.format,
            tag: context.tag.as_deref(),
            commit: commit.as_deref(),
            channel,
        },
        chrono::Utc::now(),
    )
    .map_err(|error| Error::hinted("This release has no version", format!("{error}."), USAGE))?;
    if args.positionals.is_empty() {
        return Err(Error::hinted(
            "Name the files to publish",
            "For example: schelf publish dist/*.AppImage, or dist/app.tar.gz#macos-aarch64 to say which system a file is for",
            USAGE,
        ));
    }
    let id = context.manifest.name().to_owned();
    title(&format!("Publishing {id} {version}"));
    let shape = Shape {
        format: &context.manifest.format,
        parts: &context.manifest.parts,
    };
    let artifacts: Vec<HashedArtifact> =
        hash_artifacts(collect_artifacts(&args.positionals, &shape).map_err(Error::Other)?)?;
    for hashed in &artifacts {
        let artifact = &hashed.artifact;
        let label = [artifact.part.as_deref(), Some(artifact.platform.as_str())]
            .into_iter()
            .flatten()
            .collect::<Vec<_>>()
            .join(" ");
        field_in(&label, &artifact.name, 24);
    }
    blank();
    let signed = credential(args)?;
    let config: ConfigBundle = config_bundle(&place.root, &place.config)?;
    let notes = args.flag("notes").unwrap_or(&context.notes).to_owned();
    let input = ReleaseInput {
        version: &version,
        channel,
        bridge: args.has("bridge"),
        notes: &notes,
        config: &config,
        artifacts: &artifacts,
    };
    let count = artifacts.len();
    let label = format!(
        "Uploading {count} file{}",
        if count == 1 { "" } else { "s" }
    );
    let published = step(
        &label,
        || match signed.kind {
            Kind::Session => upload_as_person(&api, &signed, &id, &input),
            _ => publish_release(
                &api,
                &signed.token,
                &input,
                commit.as_deref(),
                &context.schelf_toml,
                context.permissions_toml.as_deref(),
            ),
        },
        |_| label.clone(),
    )?;
    Ok(report(&published))
}
