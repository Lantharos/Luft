mod ask;
mod report;

use std::path::PathBuf;

use anyhow::{Result, bail};
use clap::{Parser, Subcommand};

use crate::boot::{attempts, startup};
use crate::disk;
use crate::keys::{mok, others};
use crate::service::{actions, status};
use crate::system::secrets::secret::Secret;

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
    /// Encrypting the system disk while Luft is installed
    Encryption {
        #[command(subcommand)]
        action: EncryptionAction,
    },
    /// Check what games with anti-cheat look for in how the computer started
    AntiCheat,
    /// Catch up once per start on Luft's key, the startup files and the TPM's disk key
    FollowUp,
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
    /// Encrypt an empty partition with the recovery key and passphrase given on stdin, one per line, and open it
    Format { partition: PathBuf },
    /// Let the TPM unlock the partition once Luft is installed, with the recovery key on stdin, keeping trustd's state in STATE
    Seal {
        partition: PathBuf,
        #[arg(long)]
        state: PathBuf,
    },
    /// Copy the system disk's encryption onto a partition and open it there, to move the system onto it
    CopyTo { device: PathBuf },
    /// Close a partition the system moved off and wipe its encryption
    Retire { device: PathBuf },
    /// Give a partition the system moved onto the system disk's own LUKS UUID
    Settle { device: PathBuf, uuid: String },
    /// Fit the open encryption on a partition to the partition, or to SIZE bytes of it
    Fit { device: PathBuf, size: Option<u64> },
    /// The step at startup that opens both partitions while the system moves
    InitrdMove,
}

impl Command {
    fn changes_the_system(&self) -> bool {
        !matches!(self, Command::Status | Command::AntiCheat)
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
            Command::FollowUp => {
                follow_up();
                Ok(())
            }
        }
    }
}

fn follow_up() {
    if let Err(error) = mok::follow_up() {
        eprintln!("Couldn't follow up on adding Luft's key: {error:#}");
    }
    if let Err(error) = startup::follow_up() {
        eprintln!("Couldn't follow up on Luft's startup: {error:#}");
    }
    if let Err(error) = disk::unlock::seal::follow_up() {
        eprintln!("Couldn't seal the disk key to how this computer starts: {error:#}");
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
        TpmAction::BeforeRestart => disk::unlock::seal::before_restart(),
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
        EncryptionAction::Format { partition } => {
            let given = ask::piped(2)?;
            let opened = disk::encryption::format(&partition, &given[0], &given[1])?;
            println!("{}", opened.display());
            Ok(())
        }
        EncryptionAction::Seal { partition, state } => {
            disk::encryption::seal(&partition, &ask::piped(1)?[0], &state)
        }
        EncryptionAction::CopyTo { device } => {
            println!("{}", disk::layout::moving::copy_to(&device)?.display());
            Ok(())
        }
        EncryptionAction::Retire { device } => disk::layout::moving::retire(&device),
        EncryptionAction::Settle { device, uuid } => disk::layout::moving::settle(&device, &uuid),
        EncryptionAction::Fit { device, size } => disk::layout::moving::fit(&device, size),
        EncryptionAction::InitrdMove => disk::layout::moving::open_in_initrd(),
    }
}
