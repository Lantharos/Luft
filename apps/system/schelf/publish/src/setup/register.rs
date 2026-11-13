use serde_json::{Value, json};

use crate::api::dashboard::{Dashboard, items, text};
use crate::commands::account::role_label;
use crate::commands::context::action;
use crate::error::{Error, Result};
use crate::setup::workflow::SCHELF_WORKFLOW;
use crate::ui::USAGE;
use crate::ui::prompt::{Choice, ask, choose};
use crate::ui::style::interactive;

pub const NEW_PUBLISHER: &str = "@new";

/// Who a project is published as.
#[derive(Clone)]
pub struct Owner {
    pub id: String,
    pub name: String,
    pub slug: Option<String>,
}

impl Owner {
    pub fn of(publisher: &Value) -> Self {
        Self {
            id: text(publisher, "id").to_owned(),
            name: text(publisher, "name").to_owned(),
            slug: publisher["slug"].as_str().map(str::to_owned),
        }
    }
}

/// The app's settings on the store, when it's there.
pub fn registered_app(dashboard: &Dashboard, id: &str) -> Result<Option<Value>> {
    match dashboard.app(id) {
        Ok(settings) => Ok(Some(settings.value)),
        Err(error) if error.status() == Some(404) => Ok(None),
        Err(error) => Err(error),
    }
}

pub fn choose_publisher(
    current: &Value,
    slug: Option<&str>,
    name: Option<&str>,
    plan: &mut Vec<Value>,
) -> Result<Owner> {
    let publishers = items(&current["publishers"]);
    if let Some(wanted) = slug {
        return publishers
            .iter()
            .find(|publisher| text(publisher, "slug") == wanted || text(publisher, "id") == wanted)
            .map(Owner::of)
            .ok_or_else(|| {
                Error::hinted(
                    format!("You aren't a member of {wanted}"),
                    "schelf whoami lists your publishers.",
                    USAGE,
                )
            });
    }
    if publishers.is_empty() {
        let own = text(&current["user"], "name");
        let name = match name {
            Some(name) => name.to_owned(),
            None if interactive() => ask("Your name as a publisher", Some(own)),
            None => own.to_owned(),
        };
        plan.push(action(
            "publisher.create",
            &[("kind", json!("person")), ("name", json!(name))],
        ));
        return Ok(Owner {
            id: NEW_PUBLISHER.into(),
            name,
            slug: None,
        });
    }
    if let [only] = publishers {
        return Ok(Owner::of(only));
    }
    if !interactive() {
        return Err(Error::hinted(
            "This account publishes as more than one publisher",
            "Pass --publisher <slug> to pick one.",
            USAGE,
        ));
    }
    Ok(choose(
        "Publish as",
        publishers
            .iter()
            .map(|publisher| Choice {
                label: text(publisher, "name").to_owned(),
                value: Owner::of(publisher),
                detail: Some(if text(publisher, "kind") == "person" {
                    "You".to_owned()
                } else {
                    role_label(text(publisher, "role")).to_owned()
                }),
            })
            .collect(),
    ))
}

/// Whether the store already lets `repository`'s Schelf workflow publish the app.
pub fn trusts(existing: &Value, repository: &str) -> bool {
    items(&existing["trusted_publishers"]).iter().any(|rule| {
        text(rule, "repository").to_lowercase() == repository.to_lowercase()
            && text(rule, "workflow") == SCHELF_WORKFLOW
    })
}
