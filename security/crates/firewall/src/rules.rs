use std::collections::BTreeMap;
use std::fmt::Write;
use std::process::Stdio;

use tokio::io::AsyncWriteExt;
use tokio::process::Command;

use crate::apps::{Reach, Reachable};
use crate::network::{Layout, Prefix};
use crate::ports::{Networks, Opened, Protocol};

const NFT: &str = "/usr/sbin/nft";
const BASE: &str = "/usr/share/luft-firewall/base.nft";
const APP_SETS: [&str; 2] = ["apps_home", "apps_anywhere"];
pub const DISCOVERY: [u16; 3] = [1900, 3702, 5353];
const POST: u16 = 53317;

pub type Sets = BTreeMap<&'static str, Vec<String>>;

fn home(layout: &Layout, ipv4: bool) -> Vec<String> {
    layout
        .home
        .iter()
        .filter(|(_, prefix)| matches!(prefix, Prefix::V4(..)) == ipv4)
        .map(|(interface, prefix)| format!("\"{interface}\" . {prefix}"))
        .collect()
}

fn opened(ports: &Opened, networks: Networks, protocol: Protocol) -> Vec<String> {
    ports
        .iter()
        .filter(|(port, opened)| port.protocol == protocol && **opened == networks)
        .map(|(port, _)| port.number.to_string())
        .collect()
}

fn reach(elements: &Reach) -> Vec<String> {
    elements
        .iter()
        .map(|(unit, port)| format!("\"{unit}\" . {} . {}", port.protocol.name(), port.number))
        .collect()
}

pub fn sets(layout: &Layout, ports: &Opened, reachable: &Reachable, post: bool) -> Sets {
    Sets::from([
        ("home4", home(layout, true)),
        ("home6", home(layout, false)),
        (
            "hosted",
            layout
                .hosted
                .iter()
                .map(|name| format!("\"{name}\""))
                .collect(),
        ),
        ("opened_tcp", opened(ports, Networks::Home, Protocol::Tcp)),
        ("opened_udp", opened(ports, Networks::Home, Protocol::Udp)),
        (
            "anywhere_tcp",
            opened(ports, Networks::Anywhere, Protocol::Tcp),
        ),
        (
            "anywhere_udp",
            opened(ports, Networks::Anywhere, Protocol::Udp),
        ),
        ("post", post.then(|| POST.to_string()).into_iter().collect()),
        (APP_SETS[0], reach(&reachable.home)),
        (APP_SETS[1], reach(&reachable.anywhere)),
    ])
}

fn fill(script: &mut String, name: &str, elements: &[String]) {
    if !elements.is_empty() {
        let _ = writeln!(
            script,
            "add element inet luft {name} {{ {} }}",
            elements.join(", ")
        );
    }
}

pub fn everything(sets: &Sets) -> String {
    let mut script = format!("include \"{BASE}\"\n");
    for (name, elements) in sets {
        fill(&mut script, name, elements);
    }
    script
}

pub fn changes(loaded: &Sets, wanted: &Sets, renew: bool) -> String {
    let mut script = String::new();
    for (name, elements) in wanted {
        let renewed = renew && APP_SETS.contains(name) && !elements.is_empty();
        if renewed || loaded.get(name) != Some(elements) {
            let _ = writeln!(script, "flush set inet luft {name}");
            fill(&mut script, name, elements);
        }
    }
    script
}

pub async fn load(script: &str) -> Result<(), String> {
    let mut nft = Command::new(NFT)
        .args(["-f", "-"])
        .stdin(Stdio::piped())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| format!("Couldn't start nft: {error}"))?;
    let mut stdin = nft.stdin.take().expect("stdin is piped");
    stdin
        .write_all(script.as_bytes())
        .await
        .map_err(|error| format!("Couldn't hand nft the rules: {error}"))?;
    drop(stdin);
    let output = nft
        .wait_with_output()
        .await
        .map_err(|error| format!("nft didn't finish: {error}"))?;
    if output.status.success() {
        return Ok(());
    }
    Err(format!(
        "nft refused the rules: {}",
        String::from_utf8_lossy(&output.stderr).trim()
    ))
}
