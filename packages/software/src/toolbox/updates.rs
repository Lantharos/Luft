use std::collections::HashMap;

use super::container;
use super::installed;

#[derive(Clone, Debug)]
pub struct Update {
    pub package: String,
    pub from: Option<String>,
    pub to: String,
    pub size: u64,
}

fn query(program: &[&str], packages: &[&str]) -> Result<Vec<Vec<String>>, String> {
    let mut command = program.to_vec();
    command.extend_from_slice(packages);
    Ok(container::query(&command)?
        .lines()
        .map(|line| line.split('\t').map(str::to_owned).collect())
        .collect())
}

pub fn updates() -> Result<Vec<Update>, String> {
    let tools = installed::installed();
    if tools.is_empty() {
        return Ok(Vec::new());
    }
    let packages: Vec<&str> = tools.iter().map(|tool| tool.package.as_str()).collect();
    let installed: HashMap<String, String> = query(
        &[
            "dnf",
            "repoquery",
            "--quiet",
            "--installed",
            "--queryformat",
            "%{name}\t%{version}-%{release}\n",
        ],
        &packages,
    )?
    .into_iter()
    .filter_map(|fields| Some((fields.first()?.clone(), fields.get(1)?.clone())))
    .collect();
    let available = query(
        &[
            "dnf",
            "repoquery",
            "--quiet",
            "--upgrades",
            "--latest-limit=1",
            "--queryformat",
            "%{name}\t%{version}-%{release}\t%{downloadsize}\n",
        ],
        &packages,
    )?;
    Ok(available
        .into_iter()
        .filter_map(|fields| {
            let [package, to, size] = fields.as_slice() else {
                return None;
            };
            Some(Update {
                from: installed.get(package).cloned(),
                package: package.clone(),
                to: to.clone(),
                size: size.trim().parse().unwrap_or(0),
            })
        })
        .collect())
}
