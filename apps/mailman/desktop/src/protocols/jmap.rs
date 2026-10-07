use std::time::Duration;

use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use serde::Deserialize;
use serde_json::{Value, json};

use crate::accounts::Login;

const TIMEOUT: Duration = Duration::from_secs(60);
const MAX_REDIRECTS: usize = 5;
const MAX_RESPONSE: u64 = 256 * 1024 * 1024;
pub const CORE: &str = "urn:ietf:params:jmap:core";
pub const MAIL: &str = "urn:ietf:params:jmap:mail";
pub const SUBMISSION: &str = "urn:ietf:params:jmap:submission";
pub const BLOB: &str = "urn:ietf:params:jmap:blob";
const MAX_OBJECTS: usize = 1000;
const MAX_CALLS: usize = 32;
pub const PING: u64 = 30;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Session {
    api_url: String,
    download_url: String,
    upload_url: String,
    event_source_url: Option<String>,
    primary_accounts: std::collections::HashMap<String, String>,
    capabilities: std::collections::HashMap<String, Value>,
}

pub struct Client {
    agent: ureq::Agent,
    authorization: String,
    session: Session,
    pub account: String,
    pub max_objects: usize,
    pub max_calls: usize,
}

pub fn authorization(login: &Login) -> String {
    match login {
        Login::Password { username, password } => format!(
            "Basic {}",
            STANDARD.encode(format!("{username}:{password}"))
        ),
        Login::Bearer { token, .. } => format!("Bearer {token}"),
    }
}

impl Client {
    pub fn connect(session_url: &str, login: &Login) -> Result<Self, String> {
        let agent: ureq::Agent = ureq::Agent::config_builder()
            .timeout_global(Some(TIMEOUT))
            .max_redirects(0)
            .http_status_as_error(false)
            .build()
            .into();
        let authorization = authorization(login);
        let mut url = url::Url::parse(session_url).map_err(|error| error.to_string())?;
        let mut response = agent
            .get(url.as_str())
            .header("Authorization", &authorization)
            .call()
            .map_err(|error| error.to_string())?;
        for _ in 0..MAX_REDIRECTS {
            let Some(location) = response
                .status()
                .is_redirection()
                .then(|| response.headers().get("location"))
                .flatten()
            else {
                break;
            };
            url = url
                .join(location.to_str().map_err(|error| error.to_string())?)
                .map_err(|error| error.to_string())?;
            response = agent
                .get(url.as_str())
                .header("Authorization", &authorization)
                .call()
                .map_err(|error| error.to_string())?;
        }
        if !response.status().is_success() {
            return Err(format!("Signing in failed ({})", response.status()));
        }
        let session: Session = response
            .body_mut()
            .read_json()
            .map_err(|error| error.to_string())?;
        let account = session
            .primary_accounts
            .get(MAIL)
            .cloned()
            .ok_or("This server doesn't offer mail")?;
        let core = session.capabilities.get(CORE).cloned().unwrap_or_default();
        let limit = |name: &str, fallback: u64| core[name].as_u64().unwrap_or(fallback) as usize;
        Ok(Self {
            max_objects: limit("maxObjectsInGet", 500).min(MAX_OBJECTS),
            max_calls: limit("maxCallsInRequest", 16).min(MAX_CALLS),
            agent,
            authorization,
            session,
            account,
        })
    }

    pub fn supports(&self, capability: &str) -> bool {
        self.session.capabilities.contains_key(capability)
    }

    pub fn event_source(&self) -> Option<String> {
        self.session.event_source_url.as_ref().map(|url| {
            url.replace("{types}", "*")
                .replace("{closeafter}", "no")
                .replace("{ping}", &PING.to_string())
        })
    }

    pub fn calls(
        &self,
        using: &[&str],
        calls: Vec<(&str, Value)>,
    ) -> Result<Vec<Result<Value, String>>, String> {
        let method_calls: Vec<Value> = calls
            .into_iter()
            .enumerate()
            .map(|(index, (name, arguments))| json!([name, arguments, index.to_string()]))
            .collect();
        let mut response = self
            .agent
            .post(&self.session.api_url)
            .header("Authorization", &self.authorization)
            .send_json(json!({ "using": using, "methodCalls": method_calls }))
            .map_err(|error| error.to_string())?;
        if !response.status().is_success() {
            return Err(format!("The server refused ({})", response.status()));
        }
        let response: Value = response
            .body_mut()
            .with_config()
            .limit(MAX_RESPONSE)
            .read_json()
            .map_err(|error| error.to_string())?;
        let responses = response["methodResponses"]
            .as_array()
            .cloned()
            .unwrap_or_default();
        Ok(responses
            .into_iter()
            .map(|response| match response[0].as_str() {
                Some("error") => Err(response[1]["description"]
                    .as_str()
                    .or(response[1]["type"].as_str())
                    .unwrap_or("The server refused")
                    .to_owned()),
                _ => Ok(response[1].clone()),
            })
            .collect())
    }

    pub fn call(&self, using: &[&str], calls: Vec<(&str, Value)>) -> Result<Vec<Value>, String> {
        self.calls(using, calls)?.into_iter().collect()
    }

    pub fn download(&self, blob: &str) -> Result<Vec<u8>, String> {
        let url = self
            .session
            .download_url
            .replace("{accountId}", &self.account)
            .replace("{blobId}", blob)
            .replace("{type}", "message/rfc822")
            .replace("{name}", "message.eml");
        self.agent
            .get(&url)
            .header("Authorization", &self.authorization)
            .call()
            .map_err(|error| error.to_string())?
            .body_mut()
            .with_config()
            .limit(64 * 1024 * 1024)
            .read_to_vec()
            .map_err(|error| error.to_string())
    }

    pub fn upload(&self, raw: &[u8]) -> Result<String, String> {
        let url = self
            .session
            .upload_url
            .replace("{accountId}", &self.account);
        let response: Value = self
            .agent
            .post(&url)
            .header("Authorization", &self.authorization)
            .header("Content-Type", "message/rfc822")
            .send(raw)
            .map_err(|error| error.to_string())?
            .body_mut()
            .read_json()
            .map_err(|error| error.to_string())?;
        response["blobId"]
            .as_str()
            .map(str::to_owned)
            .ok_or_else(|| "The server didn't keep the message".into())
    }
}
