use std::path::PathBuf;

use clap::Parser;

#[derive(Parser)]
#[command(about = "Installs Luft from the live system and finishes first-run setup")]
pub struct Options {
    /// Where to read the images to install from and how to start them.
    #[arg(long, default_value = "/usr/lib/luft-installer/install.toml")]
    pub config: PathBuf,
    /// Where an installed system remembers that its first-run setup is pending.
    #[arg(long, default_value = "/var/lib/luft-installer")]
    pub state_dir: PathBuf,
    /// Where the live system started from, with Meet Luft's notes when it came from Windows.
    #[arg(long, default_value = "/run/initramfs/live")]
    pub live_medium: PathBuf,
    /// Where to assemble the new system while installing.
    #[arg(long, default_value = "/run/luft-installer/target")]
    pub target: PathBuf,
}
