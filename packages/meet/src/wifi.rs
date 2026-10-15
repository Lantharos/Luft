use std::fmt::Write;

use roxmltree::{Document, Node};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Security {
    Open,
    Wpa(String),
    Sae(String),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Network {
    pub name: String,
    pub ssid: Vec<u8>,
    pub hidden: bool,
    pub automatic: bool,
    pub security: Security,
}

fn child<'a>(node: Node<'a, 'a>, name: &str) -> Option<Node<'a, 'a>> {
    node.children()
        .find(|child| child.tag_name().name() == name)
}

fn path<'a>(node: Node<'a, 'a>, names: &[&str]) -> Option<Node<'a, 'a>> {
    names.iter().try_fold(node, |node, name| child(node, name))
}

fn text<'a>(node: Node<'a, 'a>, names: &[&str]) -> Option<&'a str> {
    path(node, names)
        .and_then(|node| node.text())
        .map(str::trim)
}

fn hex(text: &str) -> Option<Vec<u8>> {
    if !text.len().is_multiple_of(2) {
        return None;
    }
    (0..text.len())
        .step_by(2)
        .map(|index| u8::from_str_radix(text.get(index..index + 2)?, 16).ok())
        .collect()
}

pub fn parse_profile(xml: &str) -> Result<Option<Network>, String> {
    let document = Document::parse(xml).map_err(|error| error.to_string())?;
    let profile = document.root_element();
    let ssid_node =
        path(profile, &["SSIDConfig", "SSID"]).ok_or("The profile has no network name")?;
    let ssid = match text(ssid_node, &["hex"]).and_then(hex) {
        Some(bytes) => bytes,
        None => text(ssid_node, &["name"])
            .ok_or("The profile has no network name")?
            .as_bytes()
            .to_vec(),
    };
    let security =
        path(profile, &["MSM", "security"]).ok_or("The profile has no security settings")?;
    let authentication = text(security, &["authEncryption", "authentication"]).unwrap_or("open");
    let one_x = text(security, &["authEncryption", "useOneX"]) == Some("true");
    let key = path(security, &["sharedKey", "keyMaterial"])
        .and_then(|node| node.text())
        .map(str::to_owned);
    let protected = text(security, &["sharedKey", "protected"]) == Some("true");
    let security = match (authentication, key) {
        _ if one_x => return Ok(None),
        ("open", None) => Security::Open,
        (_, Some(_)) if protected => return Ok(None),
        ("WPAPSK" | "WPA2PSK", Some(key)) => Security::Wpa(key),
        ("WPA3SAE", Some(key)) => Security::Sae(key),
        _ => return Ok(None),
    };
    Ok(Some(Network {
        name: text(profile, &["name"])
            .map(str::to_owned)
            .unwrap_or_else(|| String::from_utf8_lossy(&ssid).into_owned()),
        hidden: text(profile, &["SSIDConfig", "nonBroadcast"]) == Some("true"),
        automatic: text(profile, &["connectionMode"]) != Some("manual"),
        ssid,
        security,
    }))
}

fn escape(value: &str) -> String {
    let mut escaped = String::with_capacity(value.len());
    for (index, character) in value.chars().enumerate() {
        match character {
            '\\' => escaped.push_str("\\\\"),
            '\n' => escaped.push_str("\\n"),
            '\t' => escaped.push_str("\\t"),
            '\r' => escaped.push_str("\\r"),
            ' ' if index == 0 => escaped.push_str("\\s"),
            character => escaped.push(character),
        }
    }
    escaped
}

fn ssid_value(ssid: &[u8]) -> String {
    match std::str::from_utf8(ssid) {
        Ok(text) if !text.contains(';') && text.chars().all(|c| !c.is_control()) => escape(text),
        _ => ssid.iter().map(|byte| format!("{byte};")).collect(),
    }
}

impl Network {
    pub fn keyfile(&self, uuid: &str) -> String {
        let mut file = String::new();
        let _ = writeln!(
            file,
            "[connection]\nid={}\nuuid={uuid}\ntype=wifi",
            escape(&self.name)
        );
        if !self.automatic {
            file.push_str("autoconnect=false\n");
        }
        let _ = writeln!(
            file,
            "\n[wifi]\nmode=infrastructure\nssid={}",
            ssid_value(&self.ssid)
        );
        if self.hidden {
            file.push_str("hidden=true\n");
        }
        match &self.security {
            Security::Open => {}
            Security::Wpa(key) => {
                let _ = writeln!(
                    file,
                    "\n[wifi-security]\nkey-mgmt=wpa-psk\npsk={}",
                    escape(key)
                );
            }
            Security::Sae(key) => {
                let _ = writeln!(file, "\n[wifi-security]\nkey-mgmt=sae\npsk={}", escape(key));
            }
        }
        file.push_str("\n[ipv4]\nmethod=auto\n\n[ipv6]\nmethod=auto\n");
        file
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn profile(authentication: &str, key: &str, extra: &str) -> String {
        format!(
            r#"<?xml version="1.0"?>
<WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">
  <name>Home</name>
  <SSIDConfig><SSID><hex>486F6D65</hex><name>Home</name></SSID>{extra}</SSIDConfig>
  <connectionType>ESS</connectionType>
  <connectionMode>auto</connectionMode>
  <MSM><security>
    <authEncryption><authentication>{authentication}</authentication><encryption>AES</encryption><useOneX>false</useOneX></authEncryption>
    {key}
  </security></MSM>
</WLANProfile>"#
        )
    }

    const KEY: &str = "<sharedKey><keyType>passPhrase</keyType><protected>false</protected><keyMaterial> pass;word</keyMaterial></sharedKey>";

    #[test]
    fn a_home_network_becomes_a_networkmanager_connection() {
        let network = parse_profile(&profile(
            "WPA2PSK",
            KEY,
            "<nonBroadcast>true</nonBroadcast>",
        ))
        .unwrap()
        .unwrap();
        assert_eq!(network.ssid, b"Home");
        assert_eq!(network.security, Security::Wpa(" pass;word".into()));
        let keyfile = network.keyfile("5d3a6c1e-8f0b-4d2a-9c7e-1b2f3a4c5d6e");
        assert!(keyfile.contains("ssid=Home\nhidden=true\n"));
        assert!(keyfile.contains("key-mgmt=wpa-psk\npsk=\\spass;word\n"));
    }

    #[test]
    fn networks_luft_cant_join_the_same_way_are_left_out() {
        let enterprise = profile("WPA2", "", "").replace("<useOneX>false", "<useOneX>true");
        assert_eq!(parse_profile(&enterprise).unwrap(), None);
        let encrypted_key = profile(
            "WPA2PSK",
            &KEY.replace("<protected>false", "<protected>true"),
            "",
        );
        assert_eq!(parse_profile(&encrypted_key).unwrap(), None);
        let open = parse_profile(&profile("open", "", "")).unwrap().unwrap();
        assert!(!open.keyfile("u").contains("wifi-security"));
    }

    #[test]
    fn names_that_arent_text_are_written_as_bytes() {
        assert_eq!(ssid_value(&[0xff, b'a']), "255;97;");
        assert_eq!(ssid_value(b"caf\xc3\xa9"), "café");
    }
}
