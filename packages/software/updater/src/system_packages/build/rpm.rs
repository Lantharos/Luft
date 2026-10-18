use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result};

use crate::command::text;

const QUERY: &str = "%{NAME}\\t%|EPOCH?{%{EPOCH}:}:{}|%{VERSION}-%{RELEASE}\\t%{ARCH}\\t%{SUMMARY}\\n\
[%{FILENAMES}\\t%{FILEUSERNAME}\\t%{FILEGROUPNAME}\\t%{FILEMODES}\\t%{FILEFLAGS}\\n]";

/// RPMFILE_GHOST: the package claims the path, but its scriptlets or the program make it.
const GHOST: u32 = 1 << 6;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct File {
    pub path: String,
    pub user: String,
    pub group: String,
    pub mode: u32,
    pub ghost: bool,
}

#[derive(Clone, Debug)]
pub struct Rpm {
    pub path: PathBuf,
    pub name: String,
    pub version: String,
    pub arch: String,
    pub summary: String,
    pub files: Vec<File>,
}

pub fn parse(path: &Path, output: &str) -> Option<Rpm> {
    let mut lines = output.lines();
    let mut header = lines.next()?.splitn(4, '\t');
    let (name, version, arch) = (header.next()?, header.next()?, header.next()?);
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
            })
        })
        .filter(|file| file.path != "(contains no files)")
        .collect();
    Some(Rpm {
        path: path.to_path_buf(),
        name: name.to_owned(),
        version: version.to_owned(),
        arch: arch.to_owned(),
        summary: summary.to_owned(),
        files,
    })
}

pub fn query(path: &Path) -> Result<Rpm> {
    let output = text(
        Command::new("rpm")
            .args([
                "--query",
                "--package",
                "--nosignature",
                "--queryformat",
                QUERY,
            ])
            .arg(path),
    )?;
    parse(path, &output).with_context(|| format!("Reading {}", path.display()))
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
mod tests {
    use super::*;

    #[test]
    fn reads_the_header_and_every_file() {
        let output = "tailscale\t1.98.8-1.fc45\tx86_64\tThe easiest, most secure way to use WireGuard\n\
                      /usr/bin/tailscaled\troot\troot\t33261\t0\n\
                      /var/lib/tailscale\troot\troot\t16832\t0\n\
                      /etc/default/tailscaled\troot\troot\t33188\t64\n";
        let rpm = parse(Path::new("t.rpm"), output).unwrap();
        assert_eq!(rpm.name, "tailscale");
        assert_eq!(rpm.version, "1.98.8-1.fc45");
        assert_eq!(rpm.files.len(), 3);
        assert_eq!(rpm.files[1].mode, 0o40700);
        assert!(!rpm.files[1].ghost && rpm.files[2].ghost);
    }

    #[test]
    fn a_package_without_files_has_none() {
        let output = "moby-engine-nano\t29.8.2-2.fc45\tnoarch\tMeta\n(contains no files)\troot\troot\t0\t0\n";
        assert!(parse(Path::new("m.rpm"), output).unwrap().files.is_empty());
    }
}
