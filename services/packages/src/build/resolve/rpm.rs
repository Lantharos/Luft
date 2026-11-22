use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};

use crate::command::text;
use crate::state::manifest::Origin;

const QUERY: &str = "%{NAME}\\t%|EPOCH?{%{EPOCH}:}:{}|%{VERSION}-%{RELEASE}\\t%{ARCH}\\t[%{PROVIDENAME} ]\\t%{SUMMARY}\\n\
[%{FILENAMES}\\t%{FILEUSERNAME}\\t%{FILEGROUPNAME}\\t%{FILEMODES}\\t%{FILEFLAGS}\\t%{FILECAPS}\\n]";
const NO_CAPABILITIES: [&str; 2] = ["", "(none)"];
const NO_FILES: &str = "(contains no files)";

/// RPMFILE_GHOST: the package claims the path, but its scriptlets or the program make it.
const GHOST: u32 = 1 << 6;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct File {
    pub path: String,
    pub user: String,
    pub group: String,
    pub mode: u32,
    pub ghost: bool,
    pub capabilities: bool,
}

#[derive(Clone, Debug)]
pub struct Rpm {
    pub path: PathBuf,
    pub name: String,
    pub version: String,
    pub arch: String,
    pub summary: String,
    pub provides: Vec<String>,
    pub files: Vec<File>,
    pub origin: Origin,
}

const APPLICATIONS: &str = "/usr/share/applications/";
const PROGRAMS: &str = "/usr/bin/";

impl Rpm {
    /// The app menu entries the package brings.
    pub fn apps(&self) -> Vec<String> {
        self.files
            .iter()
            .filter_map(|file| file.path.strip_prefix(APPLICATIONS))
            .filter(|name| name.ends_with(".desktop") && !name.contains('/'))
            .map(str::to_owned)
            .collect()
    }

    /// The commands the package puts in /usr/bin.
    pub fn commands(&self) -> Vec<String> {
        self.files
            .iter()
            .filter_map(|file| file.path.strip_prefix(PROGRAMS))
            .filter(|name| !name.is_empty() && !name.contains('/'))
            .map(str::to_owned)
            .collect()
    }

    /// Whether the package is `name` or provides it, as dnf takes a name it's asked for.
    pub fn answers(&self, name: &str) -> bool {
        self.name == name || self.provides.iter().any(|provided| provided == name)
    }
}

pub fn parse(path: &Path, output: &str) -> Option<Rpm> {
    let mut lines = output.lines();
    let mut header = lines.next()?.splitn(5, '\t');
    let (name, version, arch, provides) = (
        header.next()?,
        header.next()?,
        header.next()?,
        header.next()?,
    );
    let summary = header.next().unwrap_or_default();
    let files = lines
        .filter_map(|line| {
            let mut fields = line.split('\t');
            Some(File {
                path: fields.next()?.to_owned(),
                user: fields.next()?.to_owned(),
                group: fields.next()?.to_owned(),
                mode: fields.next()?.parse().ok()?,
                ghost: fields
                    .next()
                    .and_then(|flags| flags.parse::<u32>().ok())
                    .is_some_and(|flags| flags & GHOST != 0),
                capabilities: fields
                    .next()
                    .is_some_and(|capabilities| !NO_CAPABILITIES.contains(&capabilities)),
            })
        })
        .filter(|file| file.path != NO_FILES)
        .collect();
    Some(Rpm {
        path: path.to_path_buf(),
        name: name.to_owned(),
        version: version.to_owned(),
        arch: arch.to_owned(),
        summary: summary.to_owned(),
        provides: provides.split_whitespace().map(str::to_owned).collect(),
        files,
        origin: Origin::Fedora,
    })
}

/// Whether a line of the query's output starts the next package: file lines name absolute
/// paths, or that the package has none.
fn starts_package(line: &str) -> bool {
    !line.starts_with('/') && !line.starts_with(NO_FILES)
}

fn split(output: &str) -> Vec<String> {
    let mut packages: Vec<String> = Vec::new();
    for line in output.lines() {
        if starts_package(line) {
            packages.push(String::new());
        }
        if let Some(package) = packages.last_mut() {
            package.push_str(line);
            package.push('\n');
        }
    }
    packages
}

/// Reads the headers of the package files at `paths`, in the same order, with one run of rpm.
pub fn query(paths: &[PathBuf]) -> Result<Vec<Rpm>> {
    let mut rpms = Vec::with_capacity(paths.len());
    for chunk in paths.chunks(512) {
        let output = text(
            Command::new("rpm")
                .args([
                    "--query",
                    "--package",
                    "--nosignature",
                    "--queryformat",
                    QUERY,
                ])
                .args(chunk),
        )?;
        let packages = split(&output);
        if packages.len() != chunk.len() {
            bail!("rpm read {} of {} packages", packages.len(), chunk.len());
        }
        for (path, package) in chunk.iter().zip(packages) {
            rpms.push(
                parse(path, &package).with_context(|| format!("Reading {}", path.display()))?,
            );
        }
    }
    Ok(rpms)
}

/// Reads the packages `labels` name, as `name-version.arch`, from the package database in
/// `root`, in the same order.
pub fn query_installed(root: &Path, labels: &[String]) -> Result<Vec<Rpm>> {
    let output = text(
        Command::new("rpm")
            .arg("--root")
            .arg(root)
            .args(["--query", "--queryformat", QUERY])
            .args(labels),
    )?;
    let packages = split(&output);
    if packages.len() != labels.len() {
        bail!("rpm found {} of {} packages", packages.len(), labels.len());
    }
    packages
        .iter()
        .map(|package| parse(Path::new(""), package).context("Reading the installed packages"))
        .collect()
}

pub fn installed(root: &Path) -> Result<Vec<String>> {
    let output = text(Command::new("rpm").arg("--root").arg(root).args([
        "--query",
        "--all",
        "--queryformat",
        "%{NAME}\\n",
    ]))?;
    Ok(output.lines().map(str::to_owned).collect())
}

#[cfg(test)]
pub fn sample(name: &str, paths: &[&str]) -> Rpm {
    Rpm {
        path: format!("{name}.rpm").into(),
        name: name.to_owned(),
        version: "1-1".to_owned(),
        arch: "x86_64".to_owned(),
        summary: String::new(),
        provides: Vec::new(),
        files: paths
            .iter()
            .map(|path| File {
                path: (*path).to_owned(),
                user: "root".to_owned(),
                group: "root".to_owned(),
                mode: 0o100644,
                ghost: false,
                capabilities: false,
            })
            .collect(),
        origin: Origin::Fedora,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_the_header_and_every_file() {
        let output = "tailscale\t1.98.8-1.fc45\tx86_64\ttailscale tailscale(x86-64) \tThe easiest, most secure way to use WireGuard\n\
                      /usr/bin/tailscaled\troot\troot\t33261\t0\tcap_net_admin=ep\n\
                      /var/lib/tailscale\troot\troot\t16832\t0\t\n\
                      /etc/default/tailscaled\troot\troot\t33188\t64\t\n";
        let rpm = parse(Path::new("t.rpm"), output).unwrap();
        assert_eq!(rpm.name, "tailscale");
        assert_eq!(rpm.version, "1.98.8-1.fc45");
        assert_eq!(rpm.files.len(), 3);
        assert_eq!(rpm.files[1].mode, 0o40700);
        assert!(!rpm.files[1].ghost && rpm.files[2].ghost);
        assert!(rpm.files[0].capabilities && !rpm.files[1].capabilities);
        assert!(rpm.answers("tailscale(x86-64)") && !rpm.answers("tail"));
    }

    #[test]
    fn one_query_splits_into_its_packages() {
        let output = "htop\t3.5.3-1.fc45\tx86_64\thtop \tViewer\n/usr/bin/htop\troot\troot\t33261\t0\t\n\
                      nano-meta\t1-1\tnoarch\t\tMeta\n(contains no files)\troot\troot\t0\t0\t(none)\n\
                      xrdb\t1.2-1\tx86_64\txrdb \tX\n/usr/bin/xrdb\troot\troot\t33261\t0\t\n";
        let packages = split(output);
        assert_eq!(packages.len(), 3);
        assert!(packages[1].starts_with("nano-meta") && packages[2].starts_with("xrdb"));
    }

    #[test]
    fn a_package_without_files_has_none() {
        let output = "moby-engine-nano\t29.8.2-2.fc45\tnoarch\t\tMeta\n(contains no files)\troot\troot\t0\t0\t(none)\n";
        assert!(parse(Path::new("m.rpm"), output).unwrap().files.is_empty());
    }
}
