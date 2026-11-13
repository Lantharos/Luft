use serde::Serialize;
use serde_json::value::RawValue;
use serde_json::{Value, json};

use super::files::{planned_files, write_planned};
use super::namespace::{plan_namespace, retry_domain_proof};
use super::plan::run_plan;
use super::register::{choose_publisher, trusts};
use super::workflow::{SCHELF_WORKFLOW, SetupInput};
use crate::api::auth::{greet, session};
use crate::api::dashboard::{Dashboard, items, text};
use crate::api::pick;
use crate::args::Args;
use crate::commands::context::{action, object};
use crate::error::{Error, Result};
use crate::project::Project;
use crate::project::source::source_of;
use crate::schema::platforms::{project_id, slug_from_id, updater_name, valid_app_id};
use crate::ui::OK;
use crate::ui::output::{blank, done, emit, field, field_in, next};
use crate::ui::style::bold;

#[derive(Serialize)]
struct Written<'a> {
    app: &'a str,
    files: Vec<&'a str>,
    links: Box<RawValue>,
}

/// Sets up a project of plain files, which Schelf hosts as they are.
pub fn init_project(api: &str, project: &Project, args: &Args) -> Result<i32> {
    let repository = project
        .repository
        .as_ref()
        .expect("init checked the remote");
    let full_name = repository.full_name();
    let slug = slug_from_id(&repository.name);
    let name = args
        .flag("name")
        .map(str::to_owned)
        .or_else(|| project.name.clone())
        .unwrap_or_else(|| repository.name.clone());
    let (distribution, licence) = source_of(project.licence.as_deref());
    field("Project", &bold(&name));
    field("Repository", &full_name);
    field(
        "Source",
        &licence.as_ref().map_or_else(
            || "Closed source".to_owned(),
            |licence| format!("Open source, {licence}"),
        ),
    );
    if let Some(framework) = &project.framework {
        field("Updates", updater_name(framework.updater));
    }
    blank();

    let signed = session(api)?;
    greet(&signed.account.value);
    let dashboard = Dashboard::new(api, &signed.token);
    let mut plan: Vec<Value> = Vec::new();
    let mut owner = choose_publisher(
        &signed.account.value,
        args.flag("publisher"),
        args.flag("publisher-name"),
        &mut plan,
    )?;
    let existing = match &owner.slug {
        Some(_) => items(&dashboard.apps(&owner.id)?.value)
            .iter()
            .find(|app| text(app, "slug") == slug)
            .cloned(),
        None => None,
    };
    let wanted = args.flag("id");
    if let Some(wanted) = wanted.filter(|wanted| !valid_app_id(wanted)) {
        return Err(Error::usage(format!("{wanted} isn't an app id")));
    }
    if let (None, Some(wanted)) = (&existing, wanted) {
        let namespace = plan_namespace(
            &dashboard,
            &owner,
            wanted,
            args.flag("namespace"),
            &mut plan,
        )?;
        if !namespace.proven {
            owner = run_plan(&dashboard, owner, &mut plan, args)?;
            retry_domain_proof(&dashboard, &owner.id, &namespace.prefix)?;
        }
    }
    match &existing {
        None => {
            let project_fields = object(&[
                ("id", json!(wanted)),
                ("name", json!(name)),
                ("slug", json!(slug)),
                ("distribution", json!(distribution)),
                ("licence", json!(licence)),
                ("repository", json!(full_name)),
                (
                    "updater",
                    json!(
                        project
                            .framework
                            .as_ref()
                            .map(|framework| framework.updater)
                    ),
                ),
            ]);
            plan.push(action(
                "project.create",
                &[("publisher", json!(owner.id)), ("project", project_fields)],
            ));
        }
        Some(existing) => {
            let settings = dashboard.app(text(existing, "id"))?.value;
            if !trusts(&settings, &full_name) {
                plan.push(action(
                    "trust.add",
                    &[
                        ("app", json!(text(existing, "id"))),
                        (
                            "rule",
                            json!({ "repository": full_name, "workflow": SCHELF_WORKFLOW }),
                        ),
                    ],
                ));
            }
        }
    }
    owner = run_plan(&dashboard, owner, &mut plan, args)?;
    let owner_slug = owner.slug.clone().unwrap_or_default();
    let id = existing
        .as_ref()
        .map(|existing| text(existing, "id").to_owned())
        .or(wanted.map(str::to_owned))
        .unwrap_or_else(|| project_id(&owner_slug, &slug));
    let settings = dashboard.app(&id)?;
    let made = if existing.is_some() {
        "Found"
    } else {
        "Created"
    };
    done(&format!(
        "{made} {}, unlisted",
        bold(&format!("{owner_slug}/{slug}"))
    ));

    let app_id = text(&settings.value["app"], "id").to_owned();
    let input = SetupInput {
        id: app_id.clone(),
        project: (app_id == project_id(&owner_slug, &slug)).then(|| format!("{owner_slug}/{slug}")),
        kind: "app".into(),
        format: "files".into(),
        updater: project
            .framework
            .as_ref()
            .map(|framework| framework.updater.to_owned()),
        distribution: Some(distribution.to_owned()),
        licence,
        repository: Some(full_name),
        ..SetupInput::default()
    };
    let files = planned_files(&project.root, &input)?;
    write_planned(&project.root, &files)?;
    for file in &files {
        let verb = if file.existing.is_none() {
            "Wrote"
        } else {
            "Updated"
        };
        done(&format!("{verb} {}", file.path));
    }
    emit(&Written {
        app: &app_id,
        files: files.iter().map(|file| file.path.as_str()).collect(),
        links: pick(&settings.raw, "links"),
    });
    blank();
    let links = &settings.value["links"];
    field_in("Download page", text(links, "page"), 18);
    field_in("Latest download", text(links, "latest"), 18);
    let paths: Vec<&str> = files.iter().map(|file| file.path.as_str()).collect();
    next(&[
        format!(
            "git add {} && git commit -m \"Host releases on Schelf\" && git push",
            paths.join(" ")
        ),
        "Publish a GitHub release with your build attached. The workflow sends its files to Schelf.".into(),
        format!("{} shows where it is.", bold("schelf status")),
    ]);
    Ok(OK)
}
