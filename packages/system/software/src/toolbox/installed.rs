use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use super::container;

const FOLDER: &str = "luft";
const FILE: &str = "tools.json";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Tool {
    pub package: String,
    pub version: String,
    pub summary: String,
    pub size: u64,
    pub commands: Vec<String>,
}

fn file() -> Option<PathBuf> {
    Some(dirs::data_dir()?.join(FOLDER).join(FILE))
}

pub fn recorded() -> Vec<Tool> {
    file()
        .and_then(|file| std::fs::read_to_string(file).ok())
        .and_then(|text| serde_json::from_str(&text).ok())
        .unwrap_or_default()
}

pub fn save(tools: &[Tool]) -> Result<(), String> {
    let file = file().ok_or("There's no home folder to keep the list of tools in.")?;
    if let Some(folder) = file.parent() {
        std::fs::create_dir_all(folder).map_err(|error| error.to_string())?;
    }
    let text = serde_json::to_string_pretty(tools).map_err(|error| error.to_string())?;
    std::fs::write(file, text).map_err(|error| error.to_string())
}

pub fn installed() -> Vec<Tool> {
    let tools = recorded();
    if tools.is_empty() || !container::exists() {
        return Vec::new();
    }
    tools
}

pub fn describe(package: &str, commands: Vec<String>) -> Result<Tool, String> {
    let details = container::query(&[
        "rpm",
        "--query",
        "--queryformat",
        "%{VERSION}-%{RELEASE}\t%{SIZE}\t%{SUMMARY}",
        package,
    ])?;
    let mut fields = details.splitn(3, '\t');
    let mut field = || fields.next().unwrap_or_default().trim().to_owned();
    Ok(Tool {
        package: package.to_owned(),
        version: field(),
        size: field().parse().unwrap_or(0),
        summary: field(),
        commands,
    })
}
