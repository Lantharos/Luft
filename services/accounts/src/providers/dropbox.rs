use anyhow::{Context, Result, anyhow};
use serde::Deserialize;

use super::encode_path;

#[derive(Deserialize)]
struct Account {
    email: String,
}

pub fn email(access: &str) -> Result<String> {
    let account: Account = ureq::post("https://api.dropboxapi.com/2/users/get_current_account")
        .header("Authorization", &format!("Bearer {access}"))
        .content_type("application/json")
        .send("null")
        .map_err(|error| anyhow!("Dropbox didn't answer: {error}"))?
        .body_mut()
        .read_json()
        .context("Dropbox's answer couldn't be read")?;
    Ok(account.email)
}

pub fn web_address(path: &str, folder: bool) -> String {
    match path.rsplit_once('/') {
        _ if folder || path.is_empty() => format!("https://www.dropbox.com/home/{}", encode_path(path)),
        Some((parent, name)) => format!(
            "https://www.dropbox.com/home/{}?preview={}",
            encode_path(parent),
            encode_path(name)
        ),
        None => format!("https://www.dropbox.com/home?preview={}", encode_path(path)),
    }
}
