use serde::Deserialize;

use super::auth::session;
use super::http::{Body, request};
use crate::args::Args;
use crate::error::{Error, Result};

const OIDC_AUDIENCE: &str = "schelf.store";

/// How a command proves who publishes.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Kind {
    Workflow,
    Token,
    Session,
}

pub struct Credential {
    pub kind: Kind,
    pub token: String,
}

fn oidc_available() -> bool {
    crate::ui::system::set("ACTIONS_ID_TOKEN_REQUEST_URL")
        && crate::ui::system::set("ACTIONS_ID_TOKEN_REQUEST_TOKEN")
}

#[derive(Deserialize)]
struct IdentityToken {
    value: String,
}

/// An identity token for this GitHub Actions run, which the store trusts.
pub fn github_oidc_token() -> Result<String> {
    let url = std::env::var("ACTIONS_ID_TOKEN_REQUEST_URL").unwrap_or_default();
    let token = std::env::var("ACTIONS_ID_TOKEN_REQUEST_TOKEN").unwrap_or_default();
    let separator = if url.contains('?') { '&' } else { '?' };
    let url = format!("{url}{separator}audience={}", super::encode(OIDC_AUDIENCE));
    request::<IdentityToken>("GET", &url, Some(&token), Body::Empty)
        .map(|identity| identity.value)
        .map_err(|error| match error {
            Error::Api(failure) => Error::Other(format!(
                "GitHub refused an identity token ({}). The job needs permissions: id-token: write.",
                failure.status
            )),
            other => other,
        })
}

/// `--token` or `SCHELF_TOKEN`, then the workflow's identity, then the sign-in.
pub fn credential(args: &Args) -> Result<Credential> {
    let given = args.flag("token").map(str::to_owned).or_else(|| {
        std::env::var("SCHELF_TOKEN")
            .ok()
            .filter(|token| !token.is_empty())
    });
    if let Some(token) = given {
        return Ok(Credential {
            kind: Kind::Token,
            token,
        });
    }
    if oidc_available() {
        return Ok(Credential {
            kind: Kind::Workflow,
            token: github_oidc_token()?,
        });
    }
    Ok(Credential {
        kind: Kind::Session,
        token: session(&args.api())?.token,
    })
}
