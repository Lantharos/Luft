//! Posting one report to the inbox, and what Pult's answer means.

use std::sync::OnceLock;
use std::time::Duration;

use ureq::Agent;
use ureq::tls::{RootCerts, TlsConfig};

use crate::config::Inbox;

const USER_AGENT: &str = "Luft crash reports";
const CLIENT_KEY: &str = "pult-client-key";
const LARGEST_BODY: usize = 64 * 1024;
const DEFAULT_WAIT: Duration = Duration::from_secs(60);
const AFTER_FAILURE: Duration = Duration::from_secs(300);

#[derive(Debug, PartialEq, Eq)]
pub enum Outcome {
    Taken,
    /// Pult won't ever take this one: it isn't what the inbox expects.
    Refused,
    /// Too many posts: wait before the next one.
    Limited(Duration),
    /// The inbox is gone, closed or has another key: stop until the image
    /// changes.
    Closed,
    Unreachable(Duration),
}

fn agent() -> &'static Agent {
    static AGENT: OnceLock<Agent> = OnceLock::new();
    AGENT.get_or_init(|| {
        Agent::config_builder()
            .user_agent(USER_AGENT)
            .http_status_as_error(false)
            .timeout_global(Some(Duration::from_secs(30)))
            .tls_config(
                TlsConfig::builder()
                    .root_certs(RootCerts::PlatformVerifier)
                    .build(),
            )
            .build()
            .into()
    })
}

fn outcome(status: u16, retry_after: Option<&str>) -> Outcome {
    match status {
        200..=299 => Outcome::Taken,
        429 => Outcome::Limited(
            retry_after
                .and_then(|seconds| seconds.trim().parse().ok())
                .map_or(DEFAULT_WAIT, Duration::from_secs),
        ),
        401 | 403 | 404 => Outcome::Closed,
        400 | 411 | 413 | 422 => Outcome::Refused,
        _ => Outcome::Unreachable(AFTER_FAILURE),
    }
}

pub fn send(inbox: &Inbox, body: &[u8]) -> Outcome {
    if body.len() > LARGEST_BODY {
        return Outcome::Refused;
    }
    match agent()
        .post(&inbox.address)
        .header(CLIENT_KEY, &inbox.key)
        .header("content-type", "application/json")
        .send(body)
    {
        Ok(response) => outcome(
            response.status().as_u16(),
            response
                .headers()
                .get("retry-after")
                .and_then(|value| value.to_str().ok()),
        ),
        Err(error) => {
            eprintln!("Couldn't send a crash report: {error}");
            Outcome::Unreachable(AFTER_FAILURE)
        }
    }
}

#[cfg(test)]
mod tests {
    use std::time::Duration;

    use super::{Outcome, outcome};

    #[test]
    fn follows_what_pult_answers() {
        assert_eq!(outcome(204, None), Outcome::Taken);
        assert_eq!(
            outcome(429, Some("120")),
            Outcome::Limited(Duration::from_secs(120))
        );
        assert_eq!(outcome(403, None), Outcome::Closed);
        assert_eq!(outcome(422, None), Outcome::Refused);
    }
}
