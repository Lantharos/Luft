mod ask;
mod report;

use std::path::PathBuf;

use anyhow::{Result, bail};
use clap::{Parser, Subcommand};

use crate::boot::kernels::Kernel;
use crate::boot::{sign, startup};
use crate::disk::keys;
use crate::system::command::Tool;
use crate::system::secret::Secret;
use crate::system::tpm;
use crate::{actions, disk};

#[derive(Parser)]
#[command(
    name = "trustctl",
    version,
    about = "Secure Boot signing, TPM disk unlock and device encryption"
)]
pub struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Show Secure Boot, the TPM, the signed startup and the disk
    Status,
    /// Luft's Secure Boot key
    SecureBoot {
        #[command(subcommand)]
        action: SecureBootAction,
    },
    /// The signed startup: Luft's boot menu and signed kernel images on the EFI system partition
    Startup {
        #[command(subcommand)]
        action: StartupAction,
    },
    /// Sign with Luft's Secure Boot key
    Sign {
        #[command(subcommand)]
        action: SignAction,
    },
    /// Unlocking the disk with the TPM
    Tpm {
        #[command(subcommand)]
        action: TpmAction,
    },
    /// The disk's recovery key
    RecoveryKey {
        #[command(subcommand)]
        action: RecoveryAction,
    },
    /// Encrypting or decrypting the system disk
    Encryption {
        #[command(subcommand)]
        action: EncryptionAction,
    },
}

#[derive(Subcommand)]
enum SecureBootAction {
    /// Make the key if needed and ask the firmware to trust it at the next restart
    Enroll,
    /// Withdraw the request before restarting
    Cancel,
}

#[derive(Subcommand)]
enum StartupAction {
    Install,
    Uninstall,
    /// Build the signed image for a newly installed kernel (used by kernel-install)
    Add {
        version: String,
    },
    /// Remove a kernel's signed image (used by kernel-install)
    Remove {
        version: String,
    },
    /// Rebuild the initramfs and signed images after changing what goes into them
    Rebuild,
    /// Rebuild the signed images whose kernel got new or changed modules, such as a graphics driver built by akmods
    Refresh,
    /// Show or change the kernel command line inside the signed images
    Arguments {
        /// Arguments to add, such as quiet or loglevel=3
        #[arg(long, value_name = "ARGUMENTS")]
        add: Vec<String>,
        /// Arguments to take out, by name, such as loglevel
        #[arg(long, value_name = "NAMES")]
        remove: Vec<String>,
        /// Start with the changed command line at the next restart only
        #[arg(long)]
        once: bool,
    },
}

#[derive(Subcommand)]
enum SignAction {
    /// Sign an EFI program
    Efi { input: PathBuf, output: PathBuf },
    /// Sign a kernel module the way DKMS asks: hash, key, certificate, module
    Module {
        hash: String,
        key: PathBuf,
        certificate: PathBuf,
        module: PathBuf,
    },
}

#[derive(Subcommand)]
enum TpmAction {
    /// Let the TPM unlock the disk, optionally with a PIN
    Enroll {
        #[arg(long)]
        pin: bool,
    },
    Remove,
}

#[derive(Subcommand)]
enum RecoveryAction {
    Show,
    Replace,
}

#[derive(Subcommand)]
enum EncryptionAction {
    /// Check whether this computer can be encrypted, without changing anything
    Check,
    On,
    Off,
    /// The step that runs at startup before the system disk is mounted
    Initrd,
}

impl Cli {
    pub fn run(self) -> Result<()> {
        match self.command {
            Command::Status => {
                report::status();
                Ok(())
            }
            Command::SecureBoot { action } => secure_boot(action),
            Command::Startup { action } => startup(action),
            Command::Sign { action } => signing(action),
            Command::Tpm { action } => tpm_unlock(action),
            Command::RecoveryKey { action } => recovery_key(action),
            Command::Encryption { action } => encryption(action),
        }
    }
}

fn secure_boot(action: SecureBootAction) -> Result<()> {
    match action {
        SecureBootAction::Enroll => {
            let encrypted = disk::status().is_some_and(|disk| disk.encrypted);
            crate::keys::create(encrypted)?;
            let code = crate::keys::mok::request()?;
            report::enrollment_steps(&code);
            Ok(())
        }
        SecureBootAction::Cancel => crate::keys::mok::cancel(),
    }
}

fn startup(action: StartupAction) -> Result<()> {
    match action {
        StartupAction::Install => startup::install(),
        StartupAction::Uninstall => startup::uninstall(),
        StartupAction::Add { version } => startup::add(&Kernel::named(&version)),
        StartupAction::Remove { version } => startup::remove(&version),
        StartupAction::Rebuild => startup::rebuild_boot_files(),
        StartupAction::Refresh => startup::refresh(true),
        StartupAction::Arguments { add, remove, once } => {
            let words = |values: Vec<String>| -> Vec<String> {
                values
                    .iter()
                    .flat_map(|value| value.split_whitespace().map(str::to_owned))
                    .collect()
            };
            let changing = !add.is_empty() || !remove.is_empty();
            let line = startup::arguments(&words(add), &words(remove), once)?;
            println!("{line}");
            if changing && once {
                println!("The next restart starts with this command line once.");
            }
            Ok(())
        }
    }
}

fn signing(action: SignAction) -> Result<()> {
    let keys = crate::keys::unseal()?;
    match action {
        SignAction::Efi { input, output } => sign::efi_binary(&input, &output, &keys),
        SignAction::Module { hash, module, .. } => sign::kernel_module(&module, &hash, &keys),
    }
}

fn tpm_unlock(action: TpmAction) -> Result<()> {
    match action {
        TpmAction::Enroll { pin } => {
            let unlock = ask::unlock_key()?;
            let pin = if pin {
                ask::new_pin()?
            } else {
                Secret::default()
            };
            if let Some(created) = actions::set_up_tpm_unlock(&unlock, &pin)? {
                report::recovery_key(&created);
            }
            println!("The TPM now unlocks the disk at startup.");
            Ok(())
        }
        TpmAction::Remove => actions::remove_tpm_unlock(&ask::unlock_key()?),
    }
}

fn recovery_key(action: RecoveryAction) -> Result<()> {
    let key = match action {
        RecoveryAction::Show => actions::show_recovery_key()?,
        RecoveryAction::Replace => actions::replace_recovery_key(&ask::unlock_key()?)?,
    };
    report::recovery_key(&key);
    Ok(())
}

fn encryption(action: EncryptionAction) -> Result<()> {
    match action {
        EncryptionAction::Check => {
            let checks = disk::check();
            report::checks(&checks);
            if checks.iter().any(|check| !check.passed) {
                bail!("This computer can't be encrypted yet.");
            }
            Ok(())
        }
        EncryptionAction::On => {
            let key = keys::generate_recovery_key()?;
            report::recovery_key(&key);
            ask::confirm(
                "Type yes once you've saved the recovery key somewhere other than this computer",
            )?;
            let (pin, passphrase) = if tpm::detect().usable {
                (
                    if ask::yes("Ask for a PIN at startup?")? {
                        ask::new_pin()?
                    } else {
                        Secret::default()
                    },
                    Secret::default(),
                )
            } else {
                (Secret::default(), ask::new_passphrase()?)
            };
            disk::turn_on(&key, &pin, &passphrase)?;
            println!("Restart to start encrypting. The rest happens in the background afterwards.");
            Ok(())
        }
        EncryptionAction::Off => {
            disk::turn_off(&ask::unlock_key()?)?;
            Tool::new("systemctl")
                .args(["start", "trustd.service"])
                .status()?;
            println!("Decrypting in the background. You can keep using the computer.");
            Ok(())
        }
        EncryptionAction::Initrd => disk::run_in_initrd(),
    }
}
