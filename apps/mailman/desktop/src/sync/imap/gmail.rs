use serde::Deserialize;

use crate::store::Identity;

const SEND_AS: &str = "https://gmail.googleapis.com/gmail/v1/users/me/settings/sendAs";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SendAs {
    send_as_email: String,
    #[serde(default)]
    display_name: String,
    #[serde(default)]
    reply_to_address: String,
    #[serde(default)]
    signature: String,
    #[serde(default)]
    is_primary: bool,
    verification_status: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Listed {
    #[serde(default)]
    send_as: Vec<SendAs>,
}

fn plain(html: &str) -> String {
    let mut text = String::with_capacity(html.len());
    let mut tag = String::new();
    let mut inside = false;
    for character in html.chars() {
        match character {
            '<' => {
                inside = true;
                tag.clear();
            }
            '>' if inside => {
                inside = false;
                let name = tag
                    .trim_start_matches('/')
                    .split_whitespace()
                    .next()
                    .unwrap_or_default();
                if matches!(
                    name.to_ascii_lowercase().as_str(),
                    "br" | "br/" | "div" | "p"
                ) {
                    text.push('\n');
                }
            }
            _ if inside => tag.push(character),
            _ => text.push(character),
        }
    }
    text.replace("&nbsp;", " ")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&amp;", "&")
        .trim()
        .to_owned()
}

pub fn send_as(account: i64, token: &str) -> Result<Vec<Identity>, String> {
    let listed: Listed = ureq::get(SEND_AS)
        .header("Authorization", &format!("Bearer {token}"))
        .call()
        .map_err(|error| error.to_string())?
        .body_mut()
        .read_json()
        .map_err(|error| error.to_string())?;
    Ok(listed
        .send_as
        .into_iter()
        .filter(|send_as| {
            send_as.is_primary || send_as.verification_status.as_deref() == Some("accepted")
        })
        .map(|send_as| Identity {
            id: 0,
            account,
            name: send_as.display_name,
            remote: Some(format!("gmail:{}", send_as.send_as_email)),
            address: send_as.send_as_email.to_lowercase(),
            reply_to: send_as.reply_to_address,
            signature: plain(&send_as.signature),
            preferred: false,
        })
        .collect())
}
