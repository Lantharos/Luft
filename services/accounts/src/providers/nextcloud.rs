use anyhow::{Context, Result, anyhow, bail};
use serde::Deserialize;
use url::Url;

use super::encode_path;

pub struct LoginFlow {
    pub url: String,
    endpoint: String,
    token: String,
}

#[derive(Deserialize)]
struct Started {
    poll: Poll,
    login: String,
}

#[derive(Deserialize)]
struct Poll {
    token: String,
    endpoint: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Granted {
    pub server: String,
    pub login_name: String,
    pub app_password: String,
}

#[derive(Deserialize)]
struct Ocs {
    ocs: OcsBody,
}

#[derive(Deserialize)]
struct OcsBody {
    data: Share,
}

#[derive(Deserialize)]
struct Share {
    url: String,
}

pub fn server_address(typed: &str) -> Result<String> {
    let typed = typed.trim();
    let with_scheme = if typed.contains("://") {
        typed.to_owned()
    } else {
        format!("https://{typed}")
    };
    let url =
        Url::parse(&with_scheme).map_err(|_| anyhow!("That doesn't look like a server address"))?;
    if !matches!(url.scheme(), "http" | "https") || url.host_str().is_none() {
        bail!("That doesn't look like a server address");
    }
    Ok(url.as_str().trim_end_matches('/').to_owned())
}

pub fn files_address(server: &str, user: &str) -> String {
    format!("{server}/remote.php/dav/files/{}/", encode_path(user))
}

pub fn start_login(server: &str) -> Result<LoginFlow> {
    let started: Started = ureq::post(&format!("{server}/index.php/login/v2"))
        .header("User-Agent", "Luft")
        .send_empty()
        .map_err(|error| anyhow!("The server didn't answer like Nextcloud: {error}"))?
        .body_mut()
        .read_json()
        .context("The server didn't answer like Nextcloud")?;
    Ok(LoginFlow {
        url: started.login,
        endpoint: started.poll.endpoint,
        token: started.poll.token,
    })
}

impl LoginFlow {
    pub fn poll(&self) -> Result<Option<Granted>> {
        let response = ureq::post(&self.endpoint)
            .config()
            .http_status_as_error(false)
            .build()
            .send_form([("token", self.token.as_str())])
            .map_err(|error| anyhow!("The server didn't answer: {error}"))?;
        match response.status().as_u16() {
            200 => Ok(Some(
                response
                    .into_body()
                    .read_json()
                    .context("The server's answer couldn't be read")?,
            )),
            404 => Ok(None),
            status => bail!("The server refused the sign-in ({status})"),
        }
    }
}

pub fn share_link(server: &str, user: &str, password: &str, path: &str) -> Result<String> {
    let shared: Ocs = ureq::post(&format!(
        "{server}/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json"
    ))
    .header("OCS-APIRequest", "true")
    .header("Authorization", &basic(user, password))
    .send_form([("path", format!("/{path}").as_str()), ("shareType", "3")])
    .map_err(|error| anyhow!("The server didn't make a link: {error}"))?
    .body_mut()
    .read_json()
    .context("The server's answer couldn't be read")?;
    Ok(shared.ocs.data.url)
}

pub fn web_address(server: &str, path: &str, folder: bool) -> String {
    let (folder_path, file) = match path.rsplit_once('/') {
        _ if folder => (path, None),
        Some((parent, name)) => (parent, Some(name)),
        None => ("", Some(path)),
    };
    let mut url = Url::parse(&format!("{server}/index.php/apps/files/"))
        .expect("the server address was checked");
    url.query_pairs_mut()
        .append_pair("dir", &format!("/{folder_path}"));
    if let Some(file) = file {
        url.query_pairs_mut().append_pair("scrollto", file);
    }
    url.into()
}

fn basic(user: &str, password: &str) -> String {
    use base64::Engine;
    format!(
        "Basic {}",
        base64::engine::general_purpose::STANDARD.encode(format!("{user}:{password}"))
    )
}

#[cfg(test)]
mod tests {
    use super::{files_address, server_address, web_address};

    #[test]
    fn addresses_are_completed() {
        assert_eq!(
            server_address("cloud.example.com/").unwrap(),
            "https://cloud.example.com"
        );
        assert_eq!(
            server_address("http://127.0.0.1:8089").unwrap(),
            "http://127.0.0.1:8089"
        );
        assert!(server_address("ftp://example.com").is_err());
        assert_eq!(
            files_address("https://cloud.example.com", "ada lovelace"),
            "https://cloud.example.com/remote.php/dav/files/ada%20lovelace/"
        );
        assert_eq!(
            web_address("https://c.example", "Docs/a b.txt", false),
            "https://c.example/index.php/apps/files/?dir=%2FDocs&scrollto=a+b.txt"
        );
    }
}
