pub mod catalogue;
pub mod gsettings;
pub mod kind;
pub mod values;

use serde::Serialize;
use serde_json::Value as Json;

use crate::bus;
use crate::cli::SettingsAction;
use crate::failure::{Exit, Failure, Outcome};
use crate::output::{Output, table};
use catalogue::Setting;
use kind::Kind;

/// A setting by its id, or by the name Settings shows for it.
pub fn resolve(name: &str, developer: bool) -> Outcome<&'static Setting> {
    let offered = || {
        catalogue::all()
            .iter()
            .filter(move |setting| setting.developer == developer)
    };
    if let Some(setting) = offered().find(|setting| setting.id == name) {
        return Ok(setting);
    }
    if let Some(only) = catalogue::settings_only(name) {
        return Err(Failure::new(
            Exit::InSettings,
            format!(
                "{} Open Settings → {} to change it: kestrel-settings:{}",
                only.why,
                catalogue::english(&only.title),
                only.page
            ),
        ));
    }
    let named: Vec<&Setting> = offered()
        .filter(|setting| setting.name().eq_ignore_ascii_case(name))
        .collect();
    match named.as_slice() {
        [only] => Ok(only),
        [] => Err(Failure::invalid(format!(
            "There's no setting called “{name}”. {} lists them.",
            if developer {
                "luft developer list"
            } else {
                "luft settings list"
            }
        ))),
        many => {
            let ids: Vec<&str> = many.iter().map(|setting| setting.id.as_str()).collect();
            Err(Failure::invalid(format!(
                "“{name}” could be {}; name one by its id.",
                ids.join(" or ")
            )))
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Described {
    pub id: &'static str,
    pub name: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<&'static str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page_name: Option<&'static str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub opens: Option<String>,
    #[serde(flatten)]
    pub kind: Kind,
    pub value: Json,
    pub shown: String,
    pub needs_review: bool,
    pub needs_administrator: bool,
}

pub async fn describe(settings: &[&'static Setting]) -> Outcome<Vec<Described>> {
    let values = values::current(settings).await?;
    settings
        .iter()
        .zip(values)
        .map(|(setting, value)| {
            let kind = values::kind(setting)?;
            Ok(Described {
                id: &setting.id,
                name: setting.name(),
                page: setting.page.as_deref(),
                page_name: setting.page_name(),
                opens: setting.link(),
                shown: kind.words(&value),
                kind,
                value,
                needs_review: setting.reviewed(),
                needs_administrator: setting.reviewed(),
            })
        })
        .collect()
}

fn listed(developer: bool, page: Option<&str>) -> Outcome<Vec<&'static Setting>> {
    let settings: Vec<&Setting> = catalogue::all()
        .iter()
        .filter(|setting| setting.developer == developer)
        .filter(|setting| page.is_none_or(|page| setting.page.as_deref() == Some(page)))
        .collect();
    if settings.is_empty() {
        return Err(Failure::invalid(format!(
            "Settings has no page called “{}”.",
            page.unwrap_or_default()
        )));
    }
    Ok(settings)
}

pub fn list_words(described: &[Described]) -> String {
    let mut words = String::new();
    let mut page = None;
    for entry in described {
        if entry.page_name != page {
            page = entry.page_name;
            words.push_str(&format!("\n{}\n", page.unwrap_or("Developer")));
        }
        let review = if entry.needs_review {
            "  (needs review)"
        } else {
            ""
        };
        words.push_str(&format!(
            "  {:<34} {} — {}{review}\n",
            entry.id, entry.name, entry.shown
        ));
    }
    words.trim_start().to_owned()
}

fn describe_words(described: &[Described]) -> String {
    described
        .iter()
        .map(|entry| {
            let takes = match &entry.kind {
                Kind::Switch { .. } => "on or off".to_owned(),
                Kind::Choice { choices } => choices
                    .iter()
                    .map(|choice| {
                        format!(
                            "{} ({})",
                            choice
                                .value
                                .as_str()
                                .map_or_else(|| choice.value.to_string(), str::to_owned),
                            choice.name
                        )
                    })
                    .collect::<Vec<_>>()
                    .join(", "),
                Kind::Number { min, max, .. } => format!("a number from {min} to {max}"),
                Kind::Text => "text".to_owned(),
            };
            let mut rows = vec![
                ("Setting", format!("{} ({})", entry.name, entry.id)),
                ("Now", entry.shown.clone()),
                ("Takes", takes),
            ];
            if let (Some(page), Some(name)) = (entry.page, entry.page_name) {
                rows.push(("Page", format!("{name} (kestrel-settings:{page})")));
            }
            rows.push((
                "Changing it",
                if entry.needs_review {
                    "waits for approval on the screen and an administrator's password"
                } else {
                    "applies right away"
                }
                .to_owned(),
            ));
            table(rows)
        })
        .collect::<Vec<_>>()
        .join("\n")
}

pub fn list(developer: bool, page: Option<&str>, output: Output) -> Outcome {
    let settings = listed(developer, page)?;
    let described = bus::block_on(describe(&settings))??;
    output.show(&described, || list_words(&described))
}

pub fn run(action: SettingsAction, output: Output) -> Outcome {
    match action {
        SettingsAction::List { page } => list(false, page.as_deref(), output),
        SettingsAction::Get { settings } => {
            let settings = settings
                .iter()
                .map(|name| resolve(name, false))
                .collect::<Outcome<Vec<_>>>()?;
            let described = bus::block_on(describe(&settings))??;
            let values: serde_json::Map<String, Json> = described
                .iter()
                .map(|entry| (entry.id.to_owned(), entry.value.clone()))
                .collect();
            output.show(&values, || {
                table(
                    described
                        .iter()
                        .map(|entry| (entry.id, entry.shown.clone())),
                )
            })
        }
        SettingsAction::Set(set) => crate::changes::set(&set.changes, false, output),
        SettingsAction::Describe { settings } => {
            let settings = if settings.is_empty() {
                listed(false, None)?
            } else {
                settings
                    .iter()
                    .map(|name| resolve(name, false))
                    .collect::<Outcome<Vec<_>>>()?
            };
            let described = bus::block_on(describe(&settings))??;
            output.show(&described, || describe_words(&described))
        }
    }
}
