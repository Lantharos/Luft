use serde::Serialize;
use serde_json::{Value, json};

use super::context::{action, object};
use crate::api::auth::{greet, session};
use crate::api::dashboard::{Dashboard, items, text};
use crate::args::Args;
use crate::error::{Error, Result};
use crate::project::files::read_optional;
use crate::project::git::{default_branch, repository_root};
use crate::project::source::source_of;
use crate::project::{Project, detect_project};
use crate::setup::files::{
    PlannedFile, helper_build, planned_files, replaced_workflows, sabine_inputs, sabine_version,
    write_planned,
};
use crate::setup::identity::{Given, settle_identity};
use crate::setup::listing::{LISTING_FOLDER, listing_files};
use crate::setup::namespace::{plan_namespace, retry_domain_proof};
use crate::setup::plan::run_plan;
use crate::setup::project::init_project;
use crate::setup::register::{Owner, choose_publisher, registered_app, trusts};
use crate::setup::workflow::{SCHELF_WORKFLOW, SetupInput};
use crate::ui::output::{blank, caution, done, emit, field, next, note, step, title};
use crate::ui::prompt::confirm;
use crate::ui::style::{bold, interactive, muted};
use crate::ui::{OK, USAGE};

fn describe(project: &Project) -> String {
    let what = match project.format {
        "sabine" => "a Sabine app",
        "appimage" => "an AppImage",
        "luft-extension" => "a Luft extension",
        _ => "a project",
    };
    if project.found.is_empty() {
        "Read the project".into()
    } else {
        format!(
            "Found {what} {}",
            muted(&format!("in {}", project.found.join(", ")))
        )
    }
}

fn permissions_file(project: &Project) -> Result<Option<String>> {
    Ok(match project.format {
        "sabine" => project
            .sabine
            .as_ref()
            .filter(|sabine| sabine.sandbox)
            .map(|_| "Sabine.toml".to_owned()),
        "appimage" => read_optional(&project.root.join("permissions.toml"))?
            .filter(|text| !text.is_empty())
            .map(|_| "permissions.toml".to_owned()),
        _ => None,
    })
}

fn publish_branch(project: &Project, args: &Args) -> Option<String> {
    let version_file = match project.format {
        "sabine" => "Sabine.toml",
        "luft-extension" => "extension.toml",
        _ => return None,
    };
    let branch = default_branch(&project.root);
    if args.has("publish-on-version-change") {
        return Some(branch);
    }
    if !interactive() {
        return None;
    }
    let question =
        format!("Also publish whenever the version in {version_file} changes on {branch}?");
    confirm(&question, false).then_some(branch)
}

fn setup_input(project: &Project, id: &str, args: &Args) -> Result<SetupInput> {
    let repository = project
        .repository
        .as_ref()
        .expect("init checked the remote");
    let (distribution, licence) = source_of(project.licence.as_deref());
    let sabine = project.format == "sabine";
    let helper = match project
        .extension
        .as_ref()
        .and_then(|extension| extension.helper.clone())
    {
        Some(path) => Some((path.clone(), helper_build(&project.root, &path)?)),
        None => None,
    };
    Ok(SetupInput {
        id: id.to_owned(),
        kind: project.kind.to_owned(),
        format: project.format.to_owned(),
        permissions: permissions_file(project)?,
        listing: Some(LISTING_FOLDER.to_owned()),
        distribution: Some(distribution.to_owned()),
        licence,
        repository: Some(repository.full_name()),
        sabine_version: if sabine {
            Some(sabine_version(&project.root)?)
        } else {
            None
        },
        sabine_inputs: if sabine {
            sabine_inputs(&project.root)
        } else {
            None
        },
        extension_api: project.extension.as_ref().map(|extension| extension.api),
        helper,
        branch: publish_branch(project, args),
        ..SetupInput::default()
    })
}

fn retire_release_workflows(project: &Project, args: &Args) -> Result<()> {
    for path in replaced_workflows(&project.root) {
        let remove = args.has("remove-old-workflows")
            || (interactive()
                && confirm(
                    &format!("Remove {path}? It won't publish anything from now on"),
                    true,
                ));
        if remove {
            std::fs::remove_file(project.root.join(&path))?;
            done(&format!("Removed {path}"));
        } else {
            caution(&format!(
                "{path} won't publish anything from now on; remove it when you're ready"
            ));
        }
    }
    Ok(())
}

#[derive(Serialize)]
struct Written<'a> {
    app: &'a str,
    files: Vec<&'a str>,
}

fn write_files(project: &Project, files: &[PlannedFile], args: &Args) -> Result<()> {
    let replaced: Vec<&str> = files
        .iter()
        .filter(|file| file.existing.is_some() && file.path != "Sabine.toml")
        .map(|file| file.path.as_str())
        .collect();
    if !replaced.is_empty() && !args.has("replace") {
        let names = replaced.join(" and ");
        if !interactive() {
            return Err(Error::hinted(
                format!("{names} already exist"),
                "Pass --replace to write them again.",
                USAGE,
            ));
        }
        if !confirm(&format!("Replace {names}?"), true) {
            return Err(Error::failure("Left the files as they were"));
        }
    }
    write_planned(&project.root, files)?;
    for file in files {
        let verb = if file.existing.is_none() {
            "Wrote"
        } else {
            "Updated"
        };
        done(&format!("{verb} {}", file.path));
    }
    Ok(())
}

pub fn init(args: &mut Args) -> Result<i32> {
    let api = args.api();
    let root = repository_root(&std::env::current_dir()?);
    title("Set up for Schelf");
    let project = step("Reading the project", || detect_project(&root), describe)?;
    let Some(repository) = &project.repository else {
        return Err(Error::hinted(
            "This repository has no GitHub remote",
            "Schelf publishes from GitHub Actions. Push the project to GitHub, then run schelf init again.",
            crate::ui::FAILED,
        ));
    };
    if project.format == "files" {
        if project.framework.is_none() {
            note(
                "Nothing here builds a Sabine app or a Luft extension, so Schelf hosts its release files as they are.",
            );
        }
        return init_project(&api, &project, args);
    }
    let repository = repository.full_name();
    let identity = settle_identity(
        &project,
        Given {
            id: args.flag("id").map(str::to_owned),
            name: args.flag("name").map(str::to_owned),
            summary: args.flag("summary").map(str::to_owned),
        },
    )?;
    blank();
    field("App", &bold(&identity.name));
    field("Id", &identity.id);
    field("Summary", &identity.summary);
    field("Repository", &repository);
    blank();

    let signed = session(&api)?;
    greet(&signed.account.value);
    let dashboard = Dashboard::new(&api, &signed.token);
    let existing = registered_app(&dashboard, &identity.id)?;
    let mut plan: Vec<Value> = Vec::new();
    let publisher_of_app = existing
        .as_ref()
        .map(|existing| text(&existing["app"], "publisher").to_owned());
    let mut owner = match items(&signed.account.value["publishers"])
        .iter()
        .find(|candidate| Some(text(candidate, "id")) == publisher_of_app.as_deref())
    {
        Some(found) => Owner::of(found),
        None => choose_publisher(
            &signed.account.value,
            args.flag("publisher"),
            args.flag("publisher-name"),
            &mut plan,
        )?,
    };
    done(&format!("Publishing as {}", bold(&owner.name)));
    let namespace = plan_namespace(
        &dashboard,
        &owner,
        &identity.id,
        args.flag("namespace"),
        &mut plan,
    )?;
    if !namespace.proven {
        owner = run_plan(&dashboard, owner, &mut plan, args)?;
        retry_domain_proof(&dashboard, &owner.id, &namespace.prefix)?;
    }
    let (distribution, licence) = source_of(project.licence.as_deref());
    match &existing {
        None => plan.push(action(
            "app.create",
            &[
                ("publisher", json!(owner.id)),
                (
                    "app",
                    object(&[
                        ("id", json!(identity.id)),
                        ("name", json!(identity.name)),
                        ("summary", json!(identity.summary)),
                        ("kind", json!(project.kind)),
                        ("format", json!(project.format)),
                        ("distribution", json!(distribution)),
                        ("licence", json!(licence)),
                        ("repository", json!(repository)),
                        ("workflow", json!(SCHELF_WORKFLOW)),
                    ]),
                ),
            ],
        )),
        Some(existing) if !trusts(existing, &repository) => plan.push(action(
            "trust.add",
            &[
                ("app", json!(identity.id)),
                (
                    "rule",
                    json!({ "repository": repository, "workflow": SCHELF_WORKFLOW }),
                ),
            ],
        )),
        Some(_) => done(&format!(
            "{repository} already publishes {}",
            bold(&identity.id)
        )),
    }
    run_plan(&dashboard, owner, &mut plan, args)?;

    let mut files = planned_files(&project.root, &setup_input(&project, &identity.id, args)?)?;
    files.extend(listing_files(&project, &identity)?);
    write_files(&project, &files, args)?;
    if project.format == "sabine" {
        retire_release_workflows(&project, args)?;
    }
    if project
        .sabine
        .as_ref()
        .is_some_and(|sabine| sabine.updates_provider.as_deref() == Some("github"))
    {
        note(&format!(
            "Copies already installed need one more GitHub release: {api}/docs/moving-from-github-releases"
        ));
    }
    emit(&Written {
        app: &identity.id,
        files: files.iter().map(|file| file.path.as_str()).collect(),
    });
    let mut staged: Vec<&str> = Vec::new();
    for file in &files {
        let path = if file.path.starts_with(&format!("{LISTING_FOLDER}/")) {
            LISTING_FOLDER
        } else {
            file.path.as_str()
        };
        if !staged.contains(&path) {
            staged.push(path);
        }
    }
    let publish_step = if project.format == "appimage" {
        "Publish a GitHub release with the AppImages. They go through the checks and land in review."
    } else {
        "Run the Publish to Schelf workflow (gh workflow run schelf.yml). It builds, goes through the checks and lands in review."
    };
    next(&[
        format!(
            "{} shows the store page and anything missing, and {} sends the listing.",
            bold("schelf check"),
            bold("schelf apply")
        ),
        format!(
            "git add {} && git commit -m \"Publish on Schelf\" && git push",
            staged.join(" ")
        ),
        publish_step.into(),
        format!(
            "{} shows where it is. To be in the store, set listed = true in store/listing.toml and run schelf apply.",
            bold("schelf status")
        ),
    ]);
    Ok(OK)
}
