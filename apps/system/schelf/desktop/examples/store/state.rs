use std::collections::HashMap;
use std::time::Instant;

use serde_json::{Value, json};

use crate::fixtures::{self, PERSONAL, STUDIO};
use crate::releases;

/// A request for approval, which the stand-in approves a few seconds after
/// it's asked about, as if someone did in the browser.
pub struct Pending {
    pub approval: Value,
    pub actions: Vec<Value>,
    pub since: Instant,
}

pub struct State {
    pub projects: Vec<Value>,
    pub releases: HashMap<String, Vec<Value>>,
    pub access: HashMap<(String, String), Value>,
    pub members: HashMap<String, Value>,
    pub domains: HashMap<String, Value>,
    pub approvals: Vec<Pending>,
}

impl State {
    pub fn new() -> Self {
        let projects = fixtures::projects();
        let ids: Vec<String> = projects
            .iter()
            .map(|project| project["app"]["id"].as_str().unwrap_or_default().to_owned())
            .collect();
        Self {
            releases: ids
                .iter()
                .map(|id| (id.clone(), releases::of(id)))
                .collect(),
            access: fixtures::channel_access("com.drita.Kalendar", "testers")
                .map(|access| {
                    (
                        ("com.drita.Kalendar".to_owned(), "testers".to_owned()),
                        access,
                    )
                })
                .into_iter()
                .collect(),
            members: [STUDIO, PERSONAL]
                .map(|id| (id.to_owned(), fixtures::members(id)))
                .into(),
            domains: [STUDIO, PERSONAL]
                .map(|id| (id.to_owned(), fixtures::domain(id)))
                .into(),
            projects,
            approvals: Vec::new(),
        }
    }

    pub fn project(&self, id: &str) -> Option<Value> {
        let mut project = self
            .projects
            .iter()
            .find(|project| project["app"]["id"] == id)?
            .clone();
        let summary = self.summary(&project["app"]);
        project["app"]["version"] = summary["version"].clone();
        project["app"]["release_status"] = summary["release_status"].clone();
        project["app"]["installs_7d"] = summary["installs_7d"].clone();
        Some(project)
    }

    fn summary(&self, app: &Value) -> Value {
        let id = app["id"].as_str().unwrap_or_default();
        let latest = self.releases.get(id).and_then(|releases| releases.first());
        let mut summary = app.clone();
        summary["version"] = latest.map_or(Value::Null, |release| release["version"].clone());
        summary["release_status"] = latest.map_or(Value::Null, |release| release["status"].clone());
        summary["installs_7d"] = fixtures::stats(id, 7)["total"]["installs"].clone();
        summary
    }

    pub fn projects_of(&self, publisher: &str) -> Value {
        Value::Array(
            self.projects
                .iter()
                .filter(|project| project["app"]["publisher"] == publisher)
                .map(|project| self.summary(&project["app"]))
                .collect(),
        )
    }

    pub fn tools_of(&self, publisher: &str) -> Value {
        Value::Array(
            self.projects
                .iter()
                .filter(|project| project["app"]["publisher"] == publisher)
                .flat_map(|project| {
                    project["tools"]
                        .as_array()
                        .cloned()
                        .unwrap_or_default()
                        .into_iter()
                        .map(|mut tool| {
                            tool["project"] = json!(format!(
                                "{}/{}",
                                project["app"]["publisher_slug"]
                                    .as_str()
                                    .unwrap_or_default(),
                                project["app"]["slug"].as_str().unwrap_or_default()
                            ));
                            tool["project_name"] = project["app"]["name"].clone();
                            tool
                        })
                })
                .collect(),
        )
    }

    pub fn release_mut(&mut self, app: &str, id: &str) -> Option<&mut Value> {
        self.releases
            .get_mut(app)?
            .iter_mut()
            .find(|release| release["id"] == id)
    }
}
