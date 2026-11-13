use std::sync::LazyLock;

use regex::Regex;

static NAME: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[a-z0-9](?:[a-z0-9_-]{0,38}[a-z0-9])?$").unwrap());
static ADDRESS: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^([a-z0-9]+(?:-[a-z0-9]+)*)/([a-z0-9_-]+)$").unwrap());

/// What a tool's name has to look like, as schelf.toml is told.
pub const NAME_MESSAGE: &str =
    "A tool is the name of the program it installs, in lowercase, like sabine";

const SHELLS: &[&str] = &[
    "sh", "bash", "zsh", "fish", "dash", "ksh", "csh", "tcsh", "nu", "pwsh", "elvish", "xonsh",
];
const SYSTEM: &[&str] = &[
    "schelf",
    "sch",
    "luft",
    "sudo",
    "su",
    "doas",
    "pkexec",
    "login",
    "passwd",
    "init",
    "systemd",
    "systemctl",
    "journalctl",
    "mount",
    "umount",
    "bootc",
    "toolbox",
    "dnf",
    "yum",
    "rpm",
    "apt",
    "apt-get",
    "dpkg",
    "flatpak",
    "snap",
    "brew",
    "pacman",
    "nix",
    "open",
    "xdg-open",
    "which",
    "whereis",
    "file",
    "man",
];
const COREUTILS: &[&str] = &[
    "ls",
    "cp",
    "mv",
    "rm",
    "cat",
    "echo",
    "printf",
    "mkdir",
    "rmdir",
    "touch",
    "chmod",
    "chown",
    "chgrp",
    "ln",
    "pwd",
    "cd",
    "test",
    "true",
    "false",
    "head",
    "tail",
    "sort",
    "uniq",
    "wc",
    "cut",
    "tr",
    "tee",
    "date",
    "df",
    "du",
    "id",
    "whoami",
    "env",
    "kill",
    "ps",
    "top",
    "find",
    "grep",
    "sed",
    "awk",
    "xargs",
    "stat",
    "install",
    "sleep",
    "yes",
    "basename",
    "dirname",
    "readlink",
    "realpath",
    "mktemp",
    "sha256sum",
    "md5sum",
    "base64",
    "diff",
    "patch",
    "tar",
    "gzip",
    "gunzip",
    "zip",
    "unzip",
    "xz",
    "zstd",
    "less",
    "more",
];
const WELL_KNOWN: &[&str] = &[
    "curl",
    "wget",
    "ssh",
    "scp",
    "sftp",
    "rsync",
    "git",
    "gh",
    "make",
    "cmake",
    "cc",
    "gcc",
    "clang",
    "ld",
    "vi",
    "vim",
    "nvim",
    "nano",
    "emacs",
    "code",
    "python",
    "python3",
    "pip",
    "pip3",
    "pipx",
    "uv",
    "node",
    "npm",
    "npx",
    "yarn",
    "pnpm",
    "bun",
    "bunx",
    "deno",
    "cargo",
    "rustc",
    "rustup",
    "go",
    "java",
    "ruby",
    "gem",
    "perl",
    "php",
    "zig",
    "docker",
    "podman",
    "kubectl",
    "helm",
    "terraform",
    "aws",
    "gcloud",
    "az",
    "wrangler",
    "openssl",
    "gpg",
    "jq",
    "rg",
    "fd",
    "bat",
    "fzf",
    "eza",
    "htop",
    "btop",
    "tmux",
    "screen",
    "zellij",
    "ffmpeg",
    "sqlite3",
    "psql",
    "mysql",
    "nc",
    "nmap",
    "starship",
    "zoxide",
    "just",
    "pandoc",
    "hugo",
    "yt-dlp",
    "ollama",
    "claude",
    "codex",
    "gemini",
];

/// The systems a tool is built for.
pub const PLATFORMS: [&str; 7] = [
    "linux-x86_64",
    "linux-aarch64",
    "macos-aarch64",
    "macos-x86_64",
    "macos-universal",
    "windows-x86_64",
    "windows-aarch64",
];

/// The kinds of file a tool installs from.
pub const KINDS: [&str; 4] = ["binary", "tarball", "zip", "exe"];

/// The store's own tool, which installs every other one.
pub const STORE_TOOL: Address<'static> = Address {
    publisher: "lantharos",
    name: "schelf",
};

/// Whether `name` is a tool name: a program name in lowercase.
pub fn valid_name(name: &str) -> bool {
    NAME.is_match(name)
}

/// Whether a bare name is kept for the system and other well-known programs,
/// so no tool answers to it.
pub fn reserved(name: &str) -> bool {
    let name = name.to_lowercase();
    [SHELLS, SYSTEM, COREUTILS, WELL_KNOWN]
        .iter()
        .any(|names| names.contains(&name.as_str()))
}

/// A tool's full address, `publisher/name`.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Address<'a> {
    pub publisher: &'a str,
    pub name: &'a str,
}

pub fn address(publisher: &str, name: &str) -> String {
    format!("{publisher}/{name}")
}

pub fn split_address(address: &str) -> Option<Address<'_>> {
    let found = ADDRESS.captures(address)?;
    Some(Address {
        publisher: found.get(1)?.as_str(),
        name: found.get(2)?.as_str(),
    })
}

/// What someone asked to install: a tool's address or its bare name.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Handle<'a> {
    Address(Address<'a>),
    Bare(&'a str),
}

/// Reads `text` as a tool's address or bare name, when it's either.
pub fn handle(text: &str) -> Option<Handle<'_>> {
    split_address(text)
        .map(Handle::Address)
        .or_else(|| valid_name(text).then_some(Handle::Bare(text)))
}

/// Where the store keeps the signed index of the tool `handle` names.
pub fn index_path(handle: Handle) -> String {
    match handle {
        Handle::Address(Address { publisher, name }) => {
            format!("index/v1/tools/{publisher}/{name}.json")
        }
        Handle::Bare(name) => format!("index/v1/tools/{name}.json"),
    }
}

/// The index of an invite-only channel of a tool.
pub fn invited_index_path(publisher: &str, name: &str, channel: &str) -> String {
    format!("invited/index/v1/tools/{publisher}/{name}/{channel}.json")
}

pub fn install_url(tool: Option<&str>) -> String {
    match tool {
        Some(tool) => format!("{}/install/{tool}", crate::api::STORE_ORIGIN),
        None => format!("{}/install", crate::api::STORE_ORIGIN),
    }
}

pub fn install_line(tool: Option<&str>) -> String {
    format!("curl -fsSL {} | sh", install_url(tool))
}

pub fn add_line(tool: &str) -> String {
    format!("sch add {tool}")
}
