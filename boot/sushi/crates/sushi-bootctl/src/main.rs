//! Install and manage SushiBoot on the EFI System Partition.

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};
use clap::{Parser, Subcommand};

const SUSHI_EFI_REL: &str = "EFI/sushi/SushiBoot.efi";
const LOADER_CONF: &str = "loader/loader.conf";
const ENTRIES_DIR: &str = "loader/entries";

#[derive(Parser)]
#[command(
    name = "sushi-bootctl",
    version,
    about = "Install and manage SushiBoot"
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Copy SushiBoot.efi, create loader.conf, register kernel-install layout.
    Install {
        #[arg(long, help = "ESP mount point (default: /boot/efi)")]
        esp: Option<PathBuf>,
        #[arg(long, help = "Create a UEFI boot manager entry via efibootmgr")]
        efi_entry: bool,
    },
    /// List BLS entries on the ESP.
    List {
        #[arg(long)]
        esp: Option<PathBuf>,
    },
    /// Set the default boot entry in loader.conf.
    SetDefault {
        id: String,
        #[arg(long)]
        esp: Option<PathBuf>,
    },
    /// Add a Windows Boot Manager BLS entry (if bootmgfw.efi exists).
    AddWindows {
        #[arg(long)]
        esp: Option<PathBuf>,
    },
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Install { esp, efi_entry } => cmd_install(esp, efi_entry),
        Commands::List { esp } => cmd_list(esp),
        Commands::SetDefault { id, esp } => cmd_set_default(&id, esp),
        Commands::AddWindows { esp } => cmd_add_windows(esp),
    }
}

fn cmd_install(esp: Option<PathBuf>, efi_entry: bool) -> Result<()> {
    let esp = resolve_esp(esp)?;
    let efi_src = find_sushiboot_efi()?;
    let efi_dest = esp.join(SUSHI_EFI_REL);
    if let Some(parent) = efi_dest.parent() {
        fs::create_dir_all(parent).with_context(|| format!("create {}", parent.display()))?;
    }
    fs::copy(&efi_src, &efi_dest)
        .with_context(|| format!("copy {} -> {}", efi_src.display(), efi_dest.display()))?;
    println!("Installed {}", efi_dest.display());

    fs::create_dir_all(esp.join(ENTRIES_DIR))?;
    let loader_path = esp.join(LOADER_CONF);
    if !loader_path.exists() {
        write_loader_conf(&loader_path, None, 5)?;
        println!("Created {}", loader_path.display());
    }

    install_kernel_layout()?;

    if efi_entry {
        create_efi_boot_entry(&esp)?;
    }

    println!("Sushi boot stack installed.");
    println!("  Next: sudo dracut --force --regenerate-all");
    println!(
        "  Rollback: sushi-bootctl uninstall, or pick another entry in the firmware boot menu"
    );
    Ok(())
}

fn cmd_list(esp: Option<PathBuf>) -> Result<()> {
    let esp = resolve_esp(esp)?;
    let entries_dir = esp.join(ENTRIES_DIR);
    if !entries_dir.is_dir() {
        println!("No loader/entries on {}", esp.display());
        return Ok(());
    }
    let conf = read_loader_conf(&esp.join(LOADER_CONF));
    for entry in fs::read_dir(&entries_dir)?.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("conf") {
            continue;
        }
        let id = path.file_stem().and_then(|s| s.to_str()).unwrap_or("?");
        let title = parse_bls_title(&path).unwrap_or_else(|| id.to_string());
        let mark = if conf.default_id.as_deref() == Some(id) {
            " (default)"
        } else {
            ""
        };
        println!("{id}: {title}{mark}");
    }
    Ok(())
}

fn cmd_set_default(id: &str, esp: Option<PathBuf>) -> Result<()> {
    let esp = resolve_esp(esp)?;
    let entry = esp.join(ENTRIES_DIR).join(format!("{id}.conf"));
    if !entry.is_file() {
        bail!("entry not found: {}", entry.display());
    }
    let conf_path = esp.join(LOADER_CONF);
    let conf = read_loader_conf(&conf_path);
    write_loader_conf(&conf_path, Some(id), conf.timeout_secs)?;
    println!("Default boot entry: {id}");
    Ok(())
}

fn cmd_add_windows(esp: Option<PathBuf>) -> Result<()> {
    let esp = resolve_esp(esp)?;
    let win_efi = esp.join("EFI/Microsoft/Boot/bootmgfw.efi");
    if !win_efi.is_file() {
        bail!("Windows bootloader not found at {}", win_efi.display());
    }
    let entry_path = esp.join(ENTRIES_DIR).join("windows.conf");
    fs::create_dir_all(entry_path.parent().unwrap())?;
    let mut f = fs::File::create(&entry_path)?;
    writeln!(f, "title Windows Boot Manager")?;
    writeln!(f, "efi \\\\EFI\\\\Microsoft\\\\Boot\\\\bootmgfw.efi")?;
    println!("Wrote {}", entry_path.display());
    Ok(())
}

fn resolve_esp(esp: Option<PathBuf>) -> Result<PathBuf> {
    if let Some(p) = esp {
        return Ok(p);
    }
    if let Ok(m) = fs::read_to_string("/proc/self/mountinfo") {
        for line in m.lines() {
            let parts: Vec<_> = line.split_whitespace().collect();
            if parts.len() >= 5 && parts[4] == "/boot/efi" {
                return Ok(PathBuf::from(parts[3]));
            }
        }
    }
    let fallback = PathBuf::from("/boot/efi");
    if fallback.is_dir() {
        return Ok(fallback);
    }
    bail!("ESP not found. Pass --esp /path/to/esp");
}

fn find_sushiboot_efi() -> Result<PathBuf> {
    for candidate in [
        "/usr/lib/sushi/efi/SushiBoot.efi",
        "/usr/local/lib/sushi/efi/SushiBoot.efi",
        "target/x86_64-unknown-uefi/release/sushiboot.efi",
        "target/x86_64-unknown-uefi/debug/sushiboot.efi",
    ] {
        let p = PathBuf::from(candidate);
        if p.is_file() {
            return Ok(p);
        }
    }
    bail!("SushiBoot.efi not found. Run: make build && sudo make install");
}

fn write_loader_conf(path: &Path, default_id: Option<&str>, timeout: u32) -> Result<()> {
    let mut f = fs::File::create(path)?;
    if let Some(id) = default_id {
        writeln!(f, "default {id}")?;
    }
    writeln!(f, "timeout {timeout}")?;
    writeln!(f, "editor no")?;
    Ok(())
}

fn read_loader_conf(path: &Path) -> LoaderConf {
    let mut conf = LoaderConf::default();
    let Ok(data) = fs::read_to_string(path) else {
        return conf;
    };
    for line in data.lines() {
        let mut parts = line.split_whitespace();
        let Some(key) = parts.next() else { continue };
        let Some(val) = parts.next() else { continue };
        match key {
            "default" => conf.default_id = Some(val.to_string()),
            "timeout" => conf.timeout_secs = val.parse().unwrap_or(conf.timeout_secs),
            _ => {}
        }
    }
    conf
}

#[derive(Default)]
struct LoaderConf {
    default_id: Option<String>,
    timeout_secs: u32,
}

fn parse_bls_title(path: &Path) -> Option<String> {
    let data = fs::read_to_string(path).ok()?;
    for line in data.lines() {
        if let Some(title) = line.strip_prefix("title ") {
            return Some(title.trim().to_string());
        }
    }
    None
}

fn install_kernel_layout() -> Result<()> {
    let conf_dir = Path::new("/etc/kernel");
    fs::create_dir_all(conf_dir.join("install.conf.d"))?;
    fs::create_dir_all(conf_dir.join("cmdline.d"))?;
    fs::write(
        conf_dir.join("install.conf.d/50-sushi.conf"),
        "layout=sushi\n",
    )?;
    fs::write(
        conf_dir.join("cmdline.d/50-sushi.conf"),
        "sushi plymouth.enable=0\n",
    )?;
    println!("Installed /etc/kernel/install.conf.d/50-sushi.conf (layout=sushi)");
    Ok(())
}

fn esp_partition(esp: &Path) -> Result<(String, String)> {
    let mounts = fs::read_to_string("/proc/self/mounts")?;
    let source = mounts
        .lines()
        .map(|line| line.split_whitespace().collect::<Vec<_>>())
        .find(|fields| fields.len() > 1 && Path::new(fields[1]) == esp)
        .map(|fields| fields[0].to_string())
        .context("the ESP is not mounted")?;
    let name = Path::new(&source)
        .file_name()
        .and_then(|name| name.to_str())
        .context("the ESP has no device name")?;
    let block = Path::new("/sys/class/block").join(name);
    let partition = fs::read_to_string(block.join("partition"))?
        .trim()
        .to_string();
    let disk = fs::canonicalize(&block)?
        .parent()
        .and_then(|parent| parent.file_name())
        .and_then(|name| name.to_str())
        .map(|disk| format!("/dev/{disk}"))
        .context("the ESP's disk was not found")?;
    Ok((disk, partition))
}

fn create_efi_boot_entry(esp: &Path) -> Result<()> {
    let (disk, partition) = esp_partition(esp)?;
    let status = Command::new("efibootmgr")
        .args([
            "--create",
            "--disk",
            &disk,
            "--part",
            &partition,
            "--label",
            "Sushi",
            "--loader",
            r"\EFI\sushi\SushiBoot.efi",
        ])
        .status()
        .context("efibootmgr is required to add a firmware boot entry")?;
    if !status.success() {
        bail!("efibootmgr could not add the boot entry");
    }
    println!("Added the Sushi firmware boot entry");
    Ok(())
}
