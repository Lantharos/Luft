//! Packing an extension the way `extensions/pack.sh` does for the store: one
//! folder named after its id, owned by root in the archive, compressed with
//! zstd, with the processor in the name when it brings a helper program.

use std::fs::File;
use std::path::{Path, PathBuf};
use std::process::Command;

use super::manifest::Manifest;
use crate::failure::{Failure, Outcome};

const LEVEL: i32 = 19;
const LEFT_OUT: [&str; 10] = [
    "src",
    "store",
    "tests",
    "node_modules",
    "schelf.toml",
    "package.json",
    "bun.lock",
    "tsconfig.json",
    "build.sh",
    "icon.svg",
];

fn kept(name: &str) -> bool {
    !name.starts_with('.') && !LEFT_OUT.contains(&name) && !name.ends_with(".ts")
}

fn copy(from: &Path, to: &Path) -> Outcome {
    std::fs::create_dir_all(to)?;
    for entry in std::fs::read_dir(from)? {
        let entry = entry?;
        let name = entry.file_name().to_string_lossy().into_owned();
        if !kept(&name) {
            continue;
        }
        let kind = entry.file_type()?;
        if kind.is_dir() {
            copy(&entry.path(), &to.join(&name))?;
        } else if kind.is_file() {
            std::fs::copy(entry.path(), to.join(&name))?;
        }
    }
    Ok(())
}

fn stage(folder: &Path, staged: &Path) -> Outcome {
    let build = folder.join("build.sh");
    if !build.is_file() {
        return copy(folder, staged);
    }
    let status = Command::new("sh")
        .arg(&build)
        .arg(staged)
        .current_dir(folder)
        .status()?;
    if !status.success() {
        return Err(Failure::failed(format!("build.sh failed: {status}")));
    }
    Ok(())
}

pub fn pack(folder: &Path, manifest: &Manifest, output: &Path) -> Outcome<PathBuf> {
    if manifest.minimum.is_none() {
        return Err(Failure::invalid(
            "The store needs the oldest version of Luft the extension runs on, as minimum under [luft].",
        ));
    }
    let scratch = tempfile::tempdir()?;
    let staged = scratch.path().join(&manifest.id);
    stage(folder, &staged)?;
    let suffix = if manifest.helper.is_some() {
        format!("-{}", std::env::consts::ARCH)
    } else {
        String::new()
    };
    std::fs::create_dir_all(output)?;
    let archive = output.join(format!("{}{suffix}.tar.zst", manifest.id));
    let compressed = zstd::Encoder::new(File::create(&archive)?, LEVEL)?;
    let mut tar = tar::Builder::new(compressed);
    tar.mode(tar::HeaderMode::Deterministic);
    tar.follow_symlinks(false);
    tar.append_dir_all(&manifest.id, &staged)?;
    tar.into_inner()?.finish()?;
    Ok(archive)
}

#[cfg(test)]
mod tests {
    use std::io::Read;

    use super::pack;
    use crate::extension::{manifest, template};

    #[test]
    fn packs_one_folder_named_after_the_id_without_the_sources() {
        let parent = tempfile::tempdir().unwrap();
        let folder = template::make(parent.path(), "com.example.Weather", "1.2").unwrap();
        std::fs::create_dir_all(folder.join("src")).unwrap();
        std::fs::write(folder.join("src/extension.ts"), "").unwrap();
        let manifest =
            manifest::parse(&std::fs::read_to_string(folder.join("extension.toml")).unwrap())
                .unwrap();
        let archive = pack(&folder, &manifest, parent.path()).unwrap();
        assert_eq!(archive.file_name().unwrap(), "com.example.Weather.tar.zst");
        let mut bytes = Vec::new();
        zstd::Decoder::new(std::fs::File::open(&archive).unwrap())
            .unwrap()
            .read_to_end(&mut bytes)
            .unwrap();
        let mut tar = tar::Archive::new(bytes.as_slice());
        let mut names: Vec<String> = tar
            .entries()
            .unwrap()
            .map(|entry| entry.unwrap().path().unwrap().display().to_string())
            .collect();
        names.sort();
        assert!(names.contains(&"com.example.Weather/extension.toml".to_owned()));
        assert!(
            names
                .iter()
                .all(|name| name.starts_with("com.example.Weather") && !name.contains("/src"))
        );
    }
}
