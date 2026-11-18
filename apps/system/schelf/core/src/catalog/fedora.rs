use luft_i18n::t;
use luft_software::system::catalog::{self, Repositories, without_epoch};

use crate::l10n::L10N;

const DETAILS: &str = "%{name}\t%{evr}\t%{summary}\t%{license}\t%{url}\t%{installsize}\t%{downloadsize}\t%{description}";

pub struct Details {
    pub package: String,
    pub version: String,
    pub summary: String,
    pub license: String,
    pub homepage: Option<String>,
    pub size: u64,
    pub download: u64,
    pub description: String,
}

pub fn repoquery(repositories: Repositories, arguments: &[&str]) -> Result<String, String> {
    catalog::repoquery(repositories, arguments).map_err(|_| t!(L10N, "core-fedora-unreachable"))
}

/// The details of `package` from Fedora, or from the repositories that were added for system
/// packages.
pub fn details(repositories: Repositories, package: &str) -> Result<Option<Details>, String> {
    let text = repoquery(repositories, &["--queryformat", DETAILS, package])?;
    let mut fields = text.splitn(8, '\t').map(str::trim);
    let mut field = || fields.next().unwrap_or_default().to_owned();
    let name = field();
    if name.is_empty() {
        return Ok(None);
    }
    let version = field();
    Ok(Some(Details {
        package: name,
        version: without_epoch(&version).to_owned(),
        summary: field(),
        license: field(),
        homepage: Some(field()).filter(|url| !url.is_empty() && url != "(none)"),
        size: field().parse().unwrap_or(0),
        download: field().parse().unwrap_or(0),
        description: field(),
    }))
}
