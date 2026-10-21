mod ask;
mod report;

use std::path::PathBuf;

use anyhow::{Result, bail};
use clap::{Parser, Subcommand};

use crate::boot::{attempts, startup};
use crate::disk;
use crate::disk::keys;
use crate::keys::{mok, others};
use crate::service::{self, actions, status};
use crate::system::secret::Secret;
use crate::system::tpm;

#[derive(Parser)]
#[command(
    name = "trustctl",
    version,
    about = "Luft's Secure Boot key, signed startup, TPM disk unlock and device encryption"
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
    /// The signed startup: shim and Luft's boot menu on the EFI system partition
    Startup {
        #[command(subcommand)]
        action: StartupAction,
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
    /// Check what games with anti-cheat look for in how the computer started
    AntiCheat,
}

#[derive(Subcommand)]
enum SecureBootAction {
    /// Ask shim to trust Luft's key at the next restart
    Enroll,
    /// Withdraw the request before restarting
    Cancel,
    /// Ask shim to remove the keys added from elsewhere at the next restart
    RemoveOthers,
    /// Withdraw the request to remove them
    KeepOthers,
}

#[derive(Subcommand)]
enum StartupAction {
    /// Put shim and Luft's boot menu on the EFI system partition and make Luft the firmware's boot entry
    Install {
        /// The EFI system partition's mount point, when it isn't this system's own
        #[arg(long)]
        esp: Option<PathBuf>,
    },
    /// Make the version before the default after an update didn't start, and say so
    WentBack,
}

#[derive(Subcommand)]
enum TpmAction {
    /// Let the TPM unlock the disk, optionally with a PIN
    Enroll {
        #[arg(long)]
        pin: bool,
    },
    Remove,
    /// Seal the disk key to the Secure Boot settings the next start measures
    BeforeRestart,
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
    /// Copy the system disk's encryption onto a partition and open it there, to move the system onto it
    CopyTo {
        device: PathBuf,
    },
    /// Close a partition the system moved off and wipe its encryption
    Retire {
        device: PathBuf,
    },
    /// Give a partition the system moved onto the system disk's own LUKS UUID
    Settle {
        device: PathBuf,
        uuid: String,
    },
    /// Fit the open encryption on a partition to the partition, or to SIZE bytes of it
    Fit {
        device: PathBuf,
        size: Option<u64>,
    },
    /// The step at startup that opens both partitions while the system moves
    InitrdMove,
}

impl Command {
    fn changes_the_system(&self) -> bool {
        !matches!(
            self,
            Command::Status
                | Command::AntiCheat
                | Command::Encryption {
                    action: EncryptionAction::Check
                }
        )
    }
}

impl Cli {
    pub fn run(self) -> Result<()> {
        if self.command.changes_the_system() && !rustix::process::geteuid().is_root() {
            bail!("trustctl needs to run as root for this. Run it again with sudo.");
        }
        match self.command {
            Command::Status => {
                report::status();
                Ok(())
            }
            Command::SecureBoot { action } => secure_boot(action),
            Command::Startup { action } => startup(action),
            Command::Tpm { action } => tpm_unlock(action),
            Command::RecoveryKey { action } => recovery_key(action),
            Command::Encryption { action } => encryption(action),
            Command::AntiCheat => {
                let status = status::gather();
                report::anti_cheat(&status.anti_cheat, &status.signing_key.other_keys);
                if !status.anti_cheat.ready() {
                    bail!("This computer isn't ready for games with anti-cheat yet.");
                }
                Ok(())
            }
        }
    }
}

fn secure_boot(action: SecureBootAction) -> Result<()> {
    match action {
        SecureBootAction::Enroll => {
            let code = mok::request()?;
            report::enrollment_steps(&code);
            Ok(())
        }
        SecureBootAction::Cancel => mok::cancel(),
        SecureBootAction::RemoveOthers => {
            let code = others::request_removal()?;
            report::removal_steps(&code);
            Ok(())
        }
        SecureBootAction::KeepOthers => others::withdraw_removal(),
    }
}

fn startup(action: StartupAction) -> Result<()> {
    match action {
        StartupAction::Install { esp } => startup::install(esp.as_deref()),
        StartupAction::WentBack => attempts::went_back(),
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
        TpmAction::BeforeRestart => disk::seal::before_restart(),
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
            if disk::turn_on(&key, &pin, &passphrase)? == disk::TurnedOn::AfterDiskChanges {
                println!("Luft is still changing its size. Encryption waits until that's done.");
                disk::finish_waiting()?;
            }
            println!("Restart to start encrypting. The rest happens in the background afterwards.");
            Ok(())
        }
        EncryptionAction::Off => {
            ask_trustd_to_decrypt(&ask::unlock_key()?)?;
            println!("Decrypting in the background. You can keep using the computer.");
            Ok(())
        }
        EncryptionAction::Initrd => disk::run_in_initrd(),
        EncryptionAction::CopyTo { device } => {
            println!("{}", disk::moving::copy_to(&device)?.display());
            Ok(())
        }
        EncryptionAction::Retire { device } => disk::moving::retire(&device),
        EncryptionAction::Settle { device, uuid } => disk::moving::settle(&device, &uuid),
        EncryptionAction::Fit { device, size } => disk::moving::fit(&device, size),
        EncryptionAction::InitrdMove => disk::moving::open_in_initrd(),
    }
}

fn ask_trustd_to_decrypt(unlock: &Secret) -> Result<()> {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(async {
            zbus::Connection::system()
                .await?
                .call_method(
                    Some(service::NAME),
                    service::PATH,
                    Some(service::NAME),
                    "TurnOffEncryption",
                    &(unlock.text()),
                )
                .await
        })?;
    Ok(())
}
