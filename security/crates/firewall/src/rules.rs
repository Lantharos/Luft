use std::collections::BTreeSet;
use std::fmt::Write;
use std::process::Stdio;

use tokio::io::AsyncWriteExt;
use tokio::process::Command;

use crate::apps::identity::UNIT_LEVEL;
use crate::apps::{Reach, Reachable};
use crate::network::{Layout, Prefix};
use crate::ports::{Port, Protocol};

const NFT: &str = "/usr/sbin/nft";
pub const DISCOVERY: [u16; 2] = [1900, 5353];
const APP_KEY: &str = "socket cgroupv2 level UNIT_LEVEL . meta l4proto . th dport";

const CHAINS: &str = r#"
	chain input {
		type filter hook input priority filter; policy drop;
		ct state { established, related } accept
		iif lo accept
		icmpv6 type { destination-unreachable, packet-too-big, time-exceeded, parameter-problem, mld-listener-query, nd-router-advert, nd-neighbor-solicit, nd-neighbor-advert } accept
		ct state invalid drop
		icmp type { destination-unreachable, time-exceeded, parameter-problem } accept
		udp sport 67 udp dport 68 accept
		ip6 saddr fe80::/10 udp sport 547 udp dport 546 accept
		iifname "tailscale0" accept
		iifname "virbr*" accept
		iifname "podman*" accept
		iifname "cni-podman*" accept
		iifname "waydroid*" accept
		iifname "docker0" accept
		iifname @hosted accept
		iifname . ip saddr @home4 jump home
		iifname . ip6 saddr @home6 jump home
		APP_KEY @apps_anywhere accept
	}

	chain home {
		icmp type echo-request accept
		icmpv6 type echo-request accept
		udp dport { DISCOVERY } accept
		udp sport { DISCOVERY } accept
		tcp dport @opened_tcp accept
		udp dport @opened_udp accept
		APP_KEY @apps_home accept
	}
}
"#;

fn set(script: &mut String, name: &str, kind: &str, elements: &[String]) {
    let _ = writeln!(script, "\tset {name} {{\n\t\t{kind}");
    if !elements.is_empty() {
        let _ = writeln!(script, "\t\telements = {{ {} }}", elements.join(", "));
    }
    script.push_str("\t}\n");
}

fn home(layout: &Layout, ipv4: bool) -> Vec<String> {
    layout
        .home
        .iter()
        .filter(|(_, prefix)| matches!(prefix, Prefix::V4(..)) == ipv4)
        .map(|(interface, prefix)| format!("\"{interface}\" . {prefix}"))
        .collect()
}

fn opened(ports: &BTreeSet<Port>, protocol: Protocol) -> Vec<String> {
    ports
        .iter()
        .filter(|port| port.protocol == protocol)
        .map(|port| port.number.to_string())
        .collect()
}

fn reach(elements: &Reach) -> Vec<String> {
    elements
        .iter()
        .map(|(unit, port)| format!("\"{unit}\" . {} . {}", port.protocol.name(), port.number))
        .collect()
}

pub fn ruleset(layout: &Layout, ports: &BTreeSet<Port>, reachable: &Reachable) -> String {
    let hosted: Vec<String> = layout
        .hosted
        .iter()
        .map(|name| format!("\"{name}\""))
        .collect();
    let key = APP_KEY.replace("UNIT_LEVEL", &UNIT_LEVEL.to_string());
    let typed = format!("typeof {key}");
    let mut script = String::from("table inet luft\ndelete table inet luft\ntable inet luft {\n");
    set(
        &mut script,
        "home4",
        "type ifname . ipv4_addr\n\t\tflags interval",
        &home(layout, true),
    );
    set(
        &mut script,
        "home6",
        "type ifname . ipv6_addr\n\t\tflags interval",
        &home(layout, false),
    );
    set(&mut script, "hosted", "type ifname", &hosted);
    set(
        &mut script,
        "opened_tcp",
        "type inet_service",
        &opened(ports, Protocol::Tcp),
    );
    set(
        &mut script,
        "opened_udp",
        "type inet_service",
        &opened(ports, Protocol::Udp),
    );
    set(&mut script, "apps_home", &typed, &reach(&reachable.home));
    set(
        &mut script,
        "apps_anywhere",
        &typed,
        &reach(&reachable.anywhere),
    );
    let discovery: Vec<String> = DISCOVERY.iter().map(u16::to_string).collect();
    script.push_str(
        &CHAINS
            .replace("APP_KEY", &key)
            .replace("DISCOVERY", &discovery.join(", ")),
    );
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
