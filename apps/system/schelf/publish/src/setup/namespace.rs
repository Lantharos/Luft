use serde_json::{Value, json};

use super::register::{NEW_PUBLISHER, Owner};
use crate::api::dashboard::{Dashboard, items, text};
use crate::commands::context::action;
use crate::error::{Error, Result};
use crate::schema::platforms::namespace_covers;
use crate::ui::WAITING;
use crate::ui::output::{blank, done, field, line, note, step};
use crate::ui::prompt::{Choice, ask, choose};
use crate::ui::style::{accent, bold, interactive};

pub fn suggested_namespace(id: &str) -> String {
    let parts: Vec<String> = id.to_lowercase().split('.').map(str::to_owned).collect();
    let take = if parts.first().map(String::as_str) == Some("io")
        && parts.get(1).map(String::as_str) == Some("github")
    {
        3
    } else {
        2
    };
    parts.into_iter().take(take).collect::<Vec<_>>().join(".")
}

fn github_namespace(prefix: &str) -> bool {
    prefix.starts_with("io.github.")
}

pub struct NamespacePlan {
    pub prefix: String,
    pub proven: bool,
}

/// Plans claiming and proving the namespace `id` lives under, unless it's
/// the publisher's already.
pub fn plan_namespace(
    dashboard: &Dashboard,
    owner: &Owner,
    id: &str,
    wanted: Option<&str>,
    plan: &mut Vec<Value>,
) -> Result<NamespacePlan> {
    let namespaces = if owner.id == NEW_PUBLISHER {
        Vec::new()
    } else {
        items(&dashboard.namespaces(&owner.id)?.value).to_vec()
    };
    if let Some(proven) = namespaces.iter().find(|namespace| {
        namespace["verified"].as_bool() == Some(true)
            && namespace_covers(text(namespace, "prefix"), id)
    }) {
        done(&format!("{} is yours", bold(text(proven, "prefix"))));
        return Ok(NamespacePlan {
            prefix: text(proven, "prefix").to_owned(),
            proven: true,
        });
    }
    let mut prefix = wanted
        .map_or_else(|| suggested_namespace(id), str::to_owned)
        .to_lowercase();
    if wanted.is_none() && !github_namespace(&prefix) && interactive() {
        prefix = ask("Which namespace do you own?", Some(&prefix)).to_lowercase();
    }
    if !namespace_covers(&prefix, id) {
        return Err(Error::usage(format!("{id} isn't under {prefix}")));
    }
    let known = namespaces
        .iter()
        .any(|namespace| text(namespace, "prefix") == prefix);
    if !known {
        plan.push(action(
            "namespace.claim",
            &[("publisher", json!(owner.id)), ("prefix", json!(prefix))],
        ));
    }
    if !github_namespace(&prefix) {
        return Ok(NamespacePlan {
            prefix,
            proven: false,
        });
    }
    if owner.id == NEW_PUBLISHER || !known {
        plan.push(action(
            "namespace.verify",
            &[
                ("publisher", json!(owner.id)),
                ("prefix", json!(prefix)),
                ("method", json!("github")),
            ],
        ));
    } else {
        step(
            &format!("Proving {prefix} through GitHub"),
            || dashboard.verify_namespace(&owner.id, &prefix, "github"),
            |_| format!("Proving {prefix} through GitHub"),
        )?;
    }
    Ok(NamespacePlan {
        prefix,
        proven: true,
    })
}

fn prove_domain(dashboard: &Dashboard, publisher: &str, namespace: &Value) -> Result<()> {
    let prefix = text(namespace, "prefix");
    let domain = prefix.split('.').rev().collect::<Vec<_>>().join(".");
    let token = text(namespace, "token");
    blank();
    line(&format!(
        "Prove you own {} with either of these:",
        bold(&domain)
    ));
    blank();
    field(
        "DNS",
        &format!(
            "a TXT record on {domain}: {}",
            accent(&format!("schelf-verify={token}"))
        ),
    );
    field(
        "Web",
        &format!(
            "https://{domain}/.well-known/schelf-store.txt containing {}",
            accent(token)
        ),
    );
    blank();
    if !interactive() {
        return Err(Error::hinted(
            format!("{prefix} isn't proven yet"),
            "Add the record, then run schelf init again.",
            WAITING,
        ));
    }
    let method = choose(
        "How will you prove it?",
        vec![
            Choice {
                label: "DNS record".into(),
                value: "dns",
                detail: None,
            },
            Choice {
                label: "File on the website".into(),
                value: "well-known",
                detail: None,
            },
        ],
    );
    loop {
        ask("Press Enter once it's in place", None);
        let label = format!("Checking {domain}");
        let checked = step(
            &label,
            || dashboard.verify_namespace(publisher, prefix, method),
            |_| label.clone(),
        )
        .ok();
        if checked.is_some_and(|checked| checked.value["verified"].as_bool() == Some(true)) {
            return Ok(());
        }
        note("Not visible yet. DNS changes can take a few minutes to spread.");
    }
}

pub fn retry_domain_proof(dashboard: &Dashboard, publisher: &str, prefix: &str) -> Result<()> {
    let namespaces = dashboard.namespaces(publisher)?.value;
    let namespace = items(&namespaces)
        .iter()
        .find(|entry| text(entry, "prefix") == prefix)
        .cloned()
        .expect("the plan claimed the namespace");
    for method in ["dns", "well-known"] {
        if dashboard
            .verify_namespace(publisher, prefix, method)
            .is_ok_and(|checked| checked.value["verified"].as_bool() == Some(true))
        {
            done(&format!("{} is yours", bold(prefix)));
            return Ok(());
        }
    }
    prove_domain(dashboard, publisher, &namespace)?;
    done(&format!("{} is yours", bold(prefix)));
    Ok(())
}
