use gio::prelude::*;
use serde::Deserialize;

use crate::portal::{self, Filter};

#[derive(Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum Purpose {
    Authority,
    Client,
    Key,
}

pub fn choose(purpose: Purpose) -> Result<Option<String>, String> {
    let (title, name, extensions): (&str, &str, &[&str]) = match purpose {
        Purpose::Authority => (
            "Choose a CA Certificate",
            "Certificates",
            &["pem", "crt", "cer", "der"],
        ),
        Purpose::Client => (
            "Choose Your Certificate",
            "Certificates",
            &["pem", "crt", "cer", "der", "p12", "pfx"],
        ),
        Purpose::Key => (
            "Choose Your Private Key",
            "Private keys",
            &["pem", "key", "der", "p12", "pfx"],
        ),
    };
    let filter = Filter {
        name,
        patterns: extensions
            .iter()
            .map(|extension| format!("*.{extension}"))
            .collect(),
    };
    let Some(uri) = portal::open_file(title, filter)? else {
        return Ok(None);
    };
    let path = gio::File::for_uri(&uri)
        .path()
        .ok_or("This file can't be opened")?;
    Ok(Some(path.to_string_lossy().into_owned()))
}
