use anyhow::{Context, Result, anyhow};
use serde::Deserialize;

use super::encode_path;

const GRAPH: &str = "https://graph.microsoft.com/v1.0";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Drive {
    pub id: String,
    pub drive_type: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Item {
    web_url: String,
}

fn get<T: for<'de> Deserialize<'de>>(access: &str, url: &str) -> Result<T> {
    ureq::get(url)
        .header("Authorization", &format!("Bearer {access}"))
        .call()
        .map_err(|error| anyhow!("OneDrive didn't answer: {error}"))?
        .body_mut()
        .read_json()
        .context("OneDrive's answer couldn't be read")
}

pub fn drive(access: &str) -> Result<Drive> {
    get(access, &format!("{GRAPH}/me/drive"))
}

pub fn web_address(access: &str, path: &str) -> Result<String> {
    let url = if path.is_empty() {
        format!("{GRAPH}/me/drive/root")
    } else {
        format!("{GRAPH}/me/drive/root:/{}", encode_path(path))
    };
    Ok(get::<Item>(access, &url)?.web_url)
}
