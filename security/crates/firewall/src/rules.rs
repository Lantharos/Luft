use std::collections::BTreeSet;
use std::fmt::Write;
use std::process::Stdio;

use tokio::io::AsyncWriteExt;
use tokio::process::Command;

use crate::network::{Layout, Prefix};
use crate::ports::{HIGHEST_GUARDED, Port, Protocol};

const NFT: &str = "/usr/sbin/nft";

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
	}

	chain home {
		icmp type echo-request accept
		icmpv6 type echo-request accept
		meta l4proto { tcp, udp } th dport > HIGHEST_GUARDED accept
		tcp dport @opened_tcp accept
		udp dport @opened_udp accept
	}
}
"#;

fn set(script: &mut String, name: &str, kind: &str, elements: &[String]) {
    let _ = writeln!(script, "\tset {name} {{\n\t\ttype {kind}");
    if kind.contains(" . ") {
        script.push_str("\t\tflags interval\n");
    }
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

pub fn ruleset(layout: &Layout, ports: &BTreeSet<Port>) -> String {
    let hosted: Vec<String> = layout
        .hosted
        .iter()
        .map(|name| format!("\"{name}\""))
        .collect();
    let mut script = String::from("table inet luft\ndelete table inet luft\ntable inet luft {\n");
    set(
        &mut script,
        "home4",
        "ifname . ipv4_addr",
        &home(layout, true),
    );
    set(
        &mut script,
        "home6",
        "ifname . ipv6_addr",
        &home(layout, false),
    );
    set(&mut script, "hosted", "ifname", &hosted);
    set(
        &mut script,
        "opened_tcp",
        "inet_service",
        &opened(ports, Protocol::Tcp),
    );
    set(
        &mut script,
        "opened_udp",
        "inet_service",
        &opened(ports, Protocol::Udp),
    );
    script.push_str(&CHAINS.replace("HIGHEST_GUARDED", &HIGHEST_GUARDED.to_string()));
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
