use serde::Serialize;
use specta::Type;
use url::{Url, form_urlencoded};

use crate::connectivity;

const SCHEME: &str = "kestrel-signin:";

#[derive(Debug, PartialEq, Serialize, Type)]
pub struct Target {
    network: String,
    url: String,
}

/// The sign-in page a `kestrel-signin:` link asks for, only when it is the
/// page NetworkManager checks the connection with, as Kestrel opens it.
pub async fn verified(arguments: &[String]) -> Option<Target> {
    let (network, url) = arguments.iter().find_map(|argument| parse(argument))?;
    let check = Url::parse(&connectivity::check_uri().await?).ok()?;
    (url == check).then(|| Target {
        network,
        url: url.into(),
    })
}

fn parse(link: &str) -> Option<(String, Url)> {
    let query = link.strip_prefix(SCHEME)?.trim_start_matches('?');
    let mut network = String::new();
    let mut url = None;
    for (key, value) in form_urlencoded::parse(query.as_bytes()) {
        match &*key {
            "network" => network = value.into_owned(),
            "url" => url = Url::parse(&value).ok(),
            _ => {}
        }
    }
    url.filter(|url| matches!(url.scheme(), "http" | "https"))
        .map(|url| (network, url))
}

#[cfg(test)]
mod tests {
    use super::parse;

    #[test]
    fn reads_the_network_and_page() {
        let (network, url) = parse("kestrel-signin:?network=Harbor%20Hotel&url=http%3A%2F%2Ffedoraproject.org%2Fstatic%2Fhotspot.txt").unwrap();
        assert_eq!(network, "Harbor Hotel");
        assert_eq!(url.as_str(), "http://fedoraproject.org/static/hotspot.txt");
    }

    #[test]
    fn only_opens_web_pages() {
        for page in [
            "file%3A%2F%2F%2Fetc%2Fpasswd",
            "javascript%3Aalert(1)",
            "sabine%3A%2F%2Fapp%2F",
            "not%20a%20url",
        ] {
            assert!(
                parse(&format!("kestrel-signin:?url={page}")).is_none(),
                "{page}"
            );
        }
        assert!(parse("https://example.com").is_none());
    }
}
