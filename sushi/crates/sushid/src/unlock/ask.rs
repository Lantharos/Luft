use std::path::Path;

use sushi::ipc::password::{Request, SHELL};
use sushi::luks::{self, Unlocking};
use sushi::{policy_key, started};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Why {
    WithoutKey,
    NewerKey,
    Changed,
    NoTpm,
    PinFailed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Accepts {
    RecoveryKey,
    RecoveryKeyOrPassphrase,
    Passphrase,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Ask {
    Disk {
        name: Option<String>,
        accepts: Accepts,
    },
    Pin {
        security_key: bool,
    },
    Fallback {
        why: Why,
        accepts: Accepts,
    },
    Encrypting,
    Shell,
}

pub struct Copy {
    pub title: String,
    pub explanation: Vec<String>,
    pub placeholder: &'static str,
    pub rejected: &'static str,
}

const ENCRYPTING: &str = "trustd:encrypting:";

fn disk_name(message: &str) -> Option<String> {
    message
        .split_once("for disk ")
        .map(|(_, rest)| {
            rest.split(" (")
                .next()
                .unwrap_or(rest)
                .trim_end_matches(':')
                .trim()
        })
        .filter(|disk| !disk.is_empty() && !disk.starts_with("luks-"))
        .map(str::to_owned)
}

fn accepts(unlocking: &Unlocking) -> Accepts {
    match (unlocking.recovery_key, unlocking.passphrase) {
        (true, false) => Accepts::RecoveryKey,
        (true, true) => Accepts::RecoveryKeyOrPassphrase,
        _ => Accepts::Passphrase,
    }
}

fn has_tpm() -> bool {
    Path::new("/sys/class/tpm/tpm0").exists()
}

impl Ask {
    pub fn of(request: &Request, pin_answered: bool) -> Self {
        let message = request.message.as_str();
        if request.id.starts_with(SHELL) {
            return Self::Shell;
        }
        if request.id.starts_with(ENCRYPTING) {
            return Self::Encrypting;
        }
        let unlocking = request
            .id
            .strip_prefix("cryptsetup:")
            .and_then(|device| luks::unlocking(Path::new(device)));
        if message.contains("TPM2 PIN") {
            return Self::Pin {
                security_key: false,
            };
        }
        if message.contains("security token PIN") {
            return Self::Pin { security_key: true };
        }
        if message.contains("token PIN") {
            return Self::Pin {
                security_key: unlocking.is_some_and(|unlocking| !unlocking.tpm),
            };
        }
        match unlocking {
            Some(unlocking) if unlocking.tpm => Self::Fallback {
                why: if pin_answered {
                    Why::PinFailed
                } else if started::without_key() {
                    Why::WithoutKey
                } else if policy_key::this_start_is_signed_with_none_of(&unlocking.tpm_policy_keys)
                {
                    Why::NewerKey
                } else if has_tpm() {
                    Why::Changed
                } else {
                    Why::NoTpm
                },
                accepts: accepts(&unlocking),
            },
            _ => Self::Disk {
                name: disk_name(message),
                accepts: unlocking.as_ref().map_or(Accepts::Passphrase, accepts),
            },
        }
    }

    pub fn accepts_recovery_key(&self) -> bool {
        matches!(
            self,
            Self::Shell
                | Self::Disk {
                    accepts: Accepts::RecoveryKey | Accepts::RecoveryKeyOrPassphrase,
                    ..
                }
                | Self::Fallback {
                    accepts: Accepts::RecoveryKey | Accepts::RecoveryKeyOrPassphrase,
                    ..
                }
        )
    }

    pub fn can_go_back(&self) -> bool {
        *self == Self::Shell
    }

    pub fn wants_only_a_recovery_key(&self) -> bool {
        matches!(
            self,
            Self::Disk {
                accepts: Accepts::RecoveryKey,
                ..
            } | Self::Fallback {
                accepts: Accepts::RecoveryKey,
                ..
            }
        )
    }

    pub fn copy(&self) -> Copy {
        match self {
            Self::Disk { name, accepts } => {
                let unlock = || {
                    name.as_ref()
                        .map_or("Unlock this computer".to_owned(), |name| {
                            format!("Unlock {name}")
                        })
                };
                let (title, placeholder, rejected) = match accepts {
                    Accepts::RecoveryKey => (
                        "Enter your recovery key".to_owned(),
                        "Recovery key",
                        "That didn't unlock the disk. Try again.",
                    ),
                    Accepts::RecoveryKeyOrPassphrase => (
                        unlock(),
                        "Recovery key or passphrase",
                        "That didn't unlock the disk. Try again.",
                    ),
                    Accepts::Passphrase => (
                        unlock(),
                        "Passphrase",
                        "That passphrase didn't work. Try again.",
                    ),
                };
                Copy {
                    title,
                    explanation: Vec::new(),
                    placeholder,
                    rejected,
                }
            }
            Self::Pin {
                security_key: false,
            } => Copy {
                title: "Enter your PIN".to_owned(),
                explanation: Vec::new(),
                placeholder: "PIN",
                rejected: "That PIN didn't work. Try again.",
            },
            Self::Encrypting => Copy {
                title: "Start encrypting Luft".to_owned(),
                explanation: vec![
                    "Enter the passphrase you chose in Settings.".to_owned(),
                    "Leave it empty to start without encrypting this time.".to_owned(),
                ],
                placeholder: "Passphrase",
                rejected: "That passphrase didn't work. Try again.",
            },
            Self::Shell => Copy {
                title: "Enter your recovery key".to_owned(),
                explanation: vec![
                    "A shell can change anything on this computer,".to_owned(),
                    "so it needs the disk's recovery key or passphrase.".to_owned(),
                ],
                placeholder: "Recovery key or passphrase",
                rejected: "That didn't unlock the disk. Try again.",
            },
            Self::Pin { security_key: true } => Copy {
                title: "Enter your security key's PIN".to_owned(),
                explanation: Vec::new(),
                placeholder: "PIN",
                rejected: "That PIN didn't work. Try again.",
            },
            Self::Fallback { why, accepts } => {
                let (title, placeholder) = match accepts {
                    Accepts::RecoveryKey => ("Enter your recovery key", "Recovery key"),
                    Accepts::RecoveryKeyOrPassphrase => {
                        ("Unlock this computer", "Recovery key or passphrase")
                    }
                    Accepts::Passphrase => ("Unlock this computer", "Passphrase"),
                };
                let explanation = match why {
                    Why::WithoutKey => vec![
                        "Secure Boot isn't set up for Luft yet, so this",
                        "computer couldn't unlock by itself. Once you're",
                        "signed in, Luft shows how to finish setting it up.",
                    ],
                    Why::NewerKey => vec![
                        "This version of Luft uses a newer key to unlock,",
                        "so it couldn't unlock by itself this time.",
                        "Unlock it once and it won't ask again.",
                    ],
                    Why::Changed => vec![
                        "Something about how this computer starts has changed,",
                        "so it couldn't unlock by itself this time. A firmware",
                        "update or a change in the firmware settings can do this.",
                    ],
                    Why::NoTpm => vec![
                        "The TPM isn't responding,",
                        "so this computer couldn't unlock by itself this time.",
                    ],
                    Why::PinFailed => {
                        vec!["The PIN didn't work, so use your recovery key instead."]
                    }
                };
                Copy {
                    title: title.to_owned(),
                    explanation: explanation.into_iter().map(str::to_owned).collect(),
                    placeholder,
                    rejected: "That didn't unlock the disk. Try again.",
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::disk_name;

    #[test]
    fn names_the_disk_being_unlocked() {
        assert_eq!(
            disk_name("Please enter passphrase for disk Samsung SSD 980 (luks-2f9b):").as_deref(),
            Some("Samsung SSD 980")
        );
        assert_eq!(disk_name("Enter the recovery key"), None);
        assert_eq!(
            disk_name("Please enter passphrase for disk luks-77e43f8a:"),
            None
        );
    }
}
