use serde::{Deserialize, Serialize};

use super::settings::{Group, put, put_text, read};

const SCHEME: &str = "file://";
const SYSTEM_STORED: u32 = 0;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Method {
    Peap,
    Ttls,
    Tls,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Enterprise {
    method: Method,
    inner: String,
    identity: String,
    anonymous_identity: String,
    ca_certificate: Option<String>,
    system_certificates: bool,
    domain: String,
    client_certificate: Option<String>,
    private_key: Option<String>,
}

fn method(name: &str) -> Method {
    match name {
        "ttls" => Method::Ttls,
        "tls" => Method::Tls,
        _ => Method::Peap,
    }
}

fn method_name(method: Method) -> &'static str {
    match method {
        Method::Peap => "peap",
        Method::Ttls => "ttls",
        Method::Tls => "tls",
    }
}

fn file(group: Option<&Group>, key: &str) -> Option<String> {
    let bytes: Vec<u8> = read(group, key)?;
    let text = String::from_utf8(bytes).ok()?;
    Some(text.strip_prefix(SCHEME)?.trim_end_matches('\0').to_owned())
}

fn put_file(group: &mut Group, key: &str, path: Option<&str>) {
    match path {
        Some(path) => put(group, key, format!("{SCHEME}{path}\0").into_bytes()),
        None => {
            group.remove(key);
        }
    }
}

pub fn secret_key(group: Option<&Group>) -> &'static str {
    match load(group).method {
        Method::Tls => "private-key-password",
        Method::Peap | Method::Ttls => "password",
    }
}

pub fn load(group: Option<&Group>) -> Enterprise {
    let methods: Vec<String> = read(group, "eap").unwrap_or_default();
    Enterprise {
        method: methods.first().map_or(Method::Peap, |name| method(name)),
        inner: read(group, "phase2-auth").unwrap_or_else(|| "mschapv2".to_owned()),
        identity: read(group, "identity").unwrap_or_default(),
        anonymous_identity: read(group, "anonymous-identity").unwrap_or_default(),
        ca_certificate: file(group, "ca-cert"),
        system_certificates: read(group, "system-ca-certs").unwrap_or(false),
        domain: read(group, "domain-suffix-match").unwrap_or_default(),
        client_certificate: file(group, "client-cert"),
        private_key: file(group, "private-key"),
    }
}

pub fn store(group: &mut Group, enterprise: &Enterprise, secret: Option<&str>) {
    put(
        group,
        "eap",
        vec![method_name(enterprise.method).to_owned()],
    );
    put_text(group, "identity", &enterprise.identity);
    put_text(group, "anonymous-identity", &enterprise.anonymous_identity);
    put_text(group, "domain-suffix-match", &enterprise.domain);
    put_file(group, "ca-cert", enterprise.ca_certificate.as_deref());
    put(group, "system-ca-certs", enterprise.system_certificates);
    group.remove("phase2-autheap");
    let tls = enterprise.method == Method::Tls;
    let (client_certificate, private_key) = if tls {
        (
            enterprise.client_certificate.as_deref(),
            enterprise.private_key.as_deref(),
        )
    } else {
        (None, None)
    };
    put_file(group, "client-cert", client_certificate);
    put_file(group, "private-key", private_key);
    if tls {
        group.remove("phase2-auth");
    } else {
        put(group, "phase2-auth", enterprise.inner.clone());
    }
    if let Some(secret) = secret {
        let key = if tls {
            "private-key-password"
        } else {
            "password"
        };
        put(group, key, secret.to_owned());
        put(group, &format!("{key}-flags"), SYSTEM_STORED);
    }
}
