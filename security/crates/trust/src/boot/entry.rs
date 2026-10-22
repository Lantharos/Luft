use anyhow::Result;

use super::esp::Esp;
use crate::system::host::command::Tool;

const SYSTEMD_BOOT: &str = "Linux Boot Manager";

struct Listing {
    order: Vec<String>,
    entries: Vec<(String, String)>,
}

fn listing() -> Listing {
    let output = Tool::new("efibootmgr").output().unwrap_or_default();
    let order = output
        .lines()
        .find_map(|line| line.strip_prefix("BootOrder: "))
        .map(|order| order.trim().split(',').map(str::to_owned).collect())
        .unwrap_or_default();
    let entries = output
        .lines()
        .filter_map(|line| {
            let (number, rest) = line.strip_prefix("Boot")?.split_once(' ')?;
            let number = number.trim_end_matches('*');
            let label = rest
                .trim_start_matches('*')
                .trim_start()
                .split('\t')
                .next()?;
            (number.len() == 4).then(|| (number.to_owned(), label.to_owned()))
        })
        .collect();
    Listing { order, entries }
}

fn numbers(listing: &Listing, label: &str) -> Vec<String> {
    listing
        .entries
        .iter()
        .filter(|(_, shown)| shown == label)
        .map(|(number, _)| number.clone())
        .collect()
}

pub fn delete(number: &str) -> Result<()> {
    Tool::new("efibootmgr")
        .args(["--bootnum", number, "--delete-bootnum"])
        .status()
}

pub fn exists(label: &str) -> bool {
    !numbers(&listing(), label).is_empty()
}

pub fn remove(label: &str) -> Result<()> {
    numbers(&listing(), label)
        .iter()
        .try_for_each(|number| delete(number))
}

pub fn ensure(esp: &Esp, label: &str, loader: &str) -> Result<()> {
    remove(SYSTEMD_BOOT)?;
    if exists(label) {
        return Ok(());
    }
    Tool::new("efibootmgr")
        .arg("--create")
        .arg("--disk")
        .arg(format!("/dev/{}", esp.disk))
        .arg("--part")
        .arg(esp.partition.to_string())
        .args(["--label", label, "--loader", loader])
        .status()
}

pub fn put_first(labels: &[&str]) -> Result<()> {
    let listing = listing();
    let first: Vec<String> = labels
        .iter()
        .flat_map(|label| numbers(&listing, label))
        .collect();
    let mut order = first.clone();
    order.extend(
        listing
            .order
            .iter()
            .filter(|number| !first.contains(number))
            .cloned(),
    );
    if order == listing.order {
        return Ok(());
    }
    Tool::new("efibootmgr")
        .args(["--bootorder", &order.join(",")])
        .status()
}
