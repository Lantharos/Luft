use std::time::Duration;

use hickory_resolver::TokioResolver;
use hickory_resolver::proto::rr::RData;
use serde::Serialize;

use super::oauth::Provider;
use crate::protocols::net::{Security, Server};

const TIMEOUT: Duration = Duration::from_secs(6);
const GOOGLE_DOMAINS: [&str; 2] = ["gmail.com", "googlemail.com"];
const MICROSOFT_DOMAINS: [&str; 5] = [
    "outlook.com",
    "hotmail.com",
    "live.com",
    "msn.com",
    "office365.com",
];

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Discovery {
    pub imap: Option<Server>,
    pub smtp: Option<Server>,
    pub jmap: Option<String>,
    pub oauth: Option<Provider>,
    pub username: String,
}

fn provider_for(host: &str) -> Option<Provider> {
    let host = host.to_ascii_lowercase();
    if host.ends_with("gmail.com")
        || host.ends_with("google.com")
        || host.ends_with("googlemail.com")
    {
        Some(Provider::Google)
    } else if host.ends_with("office365.com")
        || host.ends_with("outlook.com")
        || host.ends_with("hotmail.com")
    {
        Some(Provider::Microsoft)
    } else {
        None
    }
}

fn agent() -> ureq::Agent {
    ureq::Agent::config_builder()
        .timeout_global(Some(TIMEOUT))
        .build()
        .into()
}

fn fetch(agent: &ureq::Agent, url: &str) -> Option<String> {
    agent.get(url).call().ok()?.body_mut().read_to_string().ok()
}

fn security(socket: &str) -> Security {
    match socket.to_ascii_uppercase().as_str() {
        "SSL" | "TLS" => Security::Tls,
        "STARTTLS" => Security::StartTls,
        _ => Security::None,
    }
}

fn from_ispdb(xml: &str, email: &str) -> Option<Discovery> {
    let document = roxmltree::Document::parse(xml).ok()?;
    let local = email.split('@').next().unwrap_or(email);
    let server = |tag: &str, kind: &str| {
        document
            .descendants()
            .filter(|node| node.has_tag_name(tag) && node.attribute("type") == Some(kind))
            .filter_map(|node| {
                let text = |name: &str| {
                    node.children()
                        .find(|child| child.has_tag_name(name))
                        .and_then(|child| child.text())
                        .map(str::trim)
                };
                let socket = security(text("socketType").unwrap_or("plain"));
                let server = Server {
                    host: text("hostname")?.to_owned(),
                    port: text("port")?.parse().ok()?,
                    security: socket,
                };
                let username = text("username")
                    .unwrap_or("%EMAILADDRESS%")
                    .replace("%EMAILADDRESS%", email)
                    .replace("%EMAILLOCALPART%", local);
                let oauth = node.children().any(|child| {
                    child.has_tag_name("authentication") && child.text() == Some("OAuth2")
                });
                Some((server, username, oauth))
            })
            .min_by_key(|(server, _, _)| match server.security {
                Security::Tls => 0,
                Security::StartTls => 1,
                Security::None => 2,
            })
    };
    let (imap, username, oauth) = server("incomingServer", "imap")?;
    let (smtp, _, _) = server("outgoingServer", "smtp")?;
    Some(Discovery {
        oauth: oauth.then(|| provider_for(&imap.host)).flatten(),
        imap: Some(imap),
        smtp: Some(smtp),
        jmap: None,
        username,
    })
}

fn autoconfig(agent: &ureq::Agent, domain: &str, email: &str) -> Option<Discovery> {
    let urls = [
        format!("https://autoconfig.{domain}/mail/config-v1.1.xml?emailaddress={email}"),
        format!(
            "https://{domain}/.well-known/autoconfig/mail/config-v1.1.xml?emailaddress={email}"
        ),
        format!("https://autoconfig.thunderbird.net/v1.1/{domain}"),
    ];
    std::thread::scope(|scope| {
        let lookups: Vec<_> = urls
            .iter()
            .map(|url| {
                scope.spawn(move || fetch(agent, url).and_then(|xml| from_ispdb(&xml, email)))
            })
            .collect();
        lookups
            .into_iter()
            .find_map(|lookup| lookup.join().ok().flatten())
    })
}

struct Dns {
    runtime: tokio::runtime::Runtime,
    resolver: TokioResolver,
}

impl Dns {
    fn new() -> Option<Self> {
        let runtime = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .ok()?;
        let resolver =
            runtime.block_on(async { TokioResolver::builder_tokio().ok()?.build().ok() })?;
        Some(Self { runtime, resolver })
    }

    fn srv(&self, name: &str) -> Option<(String, u16)> {
        let lookup = self
            .runtime
            .block_on(async { tokio::time::timeout(TIMEOUT, self.resolver.srv_lookup(name)).await })
            .ok()?
            .ok()?;
        lookup
            .answers()
            .iter()
            .find_map(|record| match &record.data {
                RData::SRV(srv) if srv.port != 0 => Some((
                    srv.target.to_utf8().trim_end_matches('.').to_owned(),
                    srv.port,
                )),
                _ => None,
            })
    }

    fn mx(&self, domain: &str) -> Option<String> {
        let lookup = self
            .runtime
            .block_on(async {
                tokio::time::timeout(TIMEOUT, self.resolver.mx_lookup(domain)).await
            })
            .ok()?
            .ok()?;
        lookup
            .answers()
            .iter()
            .find_map(|record| match &record.data {
                RData::MX(mx) => Some(mx.exchange.to_utf8().trim_end_matches('.').to_lowercase()),
                _ => None,
            })
    }
}

fn registrable(host: &str) -> String {
    let labels: Vec<&str> = host.split('.').collect();
    labels[labels.len().saturating_sub(2)..].join(".")
}

fn from_srv(dns: &Dns, domain: &str, email: &str) -> Option<Discovery> {
    let jmap = dns
        .srv(&format!("_jmap._tcp.{domain}."))
        .map(|(host, port)| format!("https://{host}:{port}/.well-known/jmap"));
    let imap = dns
        .srv(&format!("_imaps._tcp.{domain}."))
        .map(|(host, port)| Server {
            host,
            port,
            security: Security::Tls,
        })
        .or_else(|| {
            dns.srv(&format!("_imap._tcp.{domain}."))
                .map(|(host, port)| Server {
                    host,
                    port,
                    security: Security::StartTls,
                })
        });
    let smtp = dns
        .srv(&format!("_submissions._tcp.{domain}."))
        .map(|(host, port)| Server {
            host,
            port,
            security: Security::Tls,
        })
        .or_else(|| {
            dns.srv(&format!("_submission._tcp.{domain}."))
                .map(|(host, port)| Server {
                    host,
                    port,
                    security: Security::StartTls,
                })
        });
    (jmap.is_some() || imap.is_some()).then(|| Discovery {
        imap,
        smtp,
        jmap,
        oauth: None,
        username: email.to_owned(),
    })
}

fn from_dns(agent: &ureq::Agent, domain: &str, email: &str) -> Option<Discovery> {
    let dns = Dns::new()?;
    if let Some(found) = from_srv(&dns, domain, email) {
        return Some(found);
    }
    let mx = dns.mx(domain)?;
    let mut found = autoconfig(agent, &registrable(&mx), email)?;
    found.oauth = found.oauth.or_else(|| provider_for(&mx));
    Some(found)
}

pub fn discover(email: &str) -> Discovery {
    let email = email.trim().to_lowercase();
    let domain = email.rsplit('@').next().unwrap_or_default().to_owned();
    if domain == "fastmail.com" || domain == "fastmail.fm" {
        return Discovery {
            jmap: Some("https://api.fastmail.com/jmap/session".into()),
            username: email,
            ..Discovery::default()
        };
    }
    let agent = agent();
    let known =
        GOOGLE_DOMAINS.contains(&domain.as_str()) || MICROSOFT_DOMAINS.contains(&domain.as_str());
    let found = std::thread::scope(|scope| {
        let dns = (!known).then(|| scope.spawn(|| from_dns(&agent, &domain, &email)));
        autoconfig(&agent, &domain, &email)
            .or_else(|| dns.and_then(|lookup| lookup.join().ok().flatten()))
    });
    if let Some(found) = found {
        return found;
    }
    Discovery {
        imap: Some(Server {
            host: format!("imap.{domain}"),
            port: 993,
            security: Security::Tls,
        }),
        smtp: Some(Server {
            host: format!("smtp.{domain}"),
            port: 465,
            security: Security::Tls,
        }),
        username: email,
        ..Discovery::default()
    }
}
