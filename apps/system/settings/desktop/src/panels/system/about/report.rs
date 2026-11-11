use luft_app::launch::{self, Token};
use luft_software::system::image::{Deployments, Running};
use percent_encoding::{NON_ALPHANUMERIC, utf8_percent_encode};

const NEW_ISSUE: &str = "https://github.com/Lantharos/Luft/issues/new?template=bug.yml";
const SHORT_DIGEST: usize = 12;

fn build(digest: &str) -> String {
    let hex = digest.strip_prefix("sha256:").unwrap_or(digest);
    format!("build {}", &hex[..hex.len().min(SHORT_DIGEST)])
}

fn described(running: Running) -> String {
    [
        running.version,
        running.channel.map(str::to_owned),
        running.digest.as_deref().map(build),
    ]
    .into_iter()
    .flatten()
    .collect::<Vec<_>>()
    .join(", ")
}

fn address(version: &str) -> String {
    if version.is_empty() {
        return NEW_ISSUE.to_owned();
    }
    format!(
        "{NEW_ISSUE}&version={}",
        utf8_percent_encode(version, NON_ALPHANUMERIC)
    )
}

pub async fn report(Token { token }: Token) -> Result<(), String> {
    let version = Deployments::load()
        .await
        .map(|deployments| described(deployments.running()))
        .unwrap_or_default();
    launch::open(&address(&version), token.as_deref()).map_err(|error| error.to_string())
}
