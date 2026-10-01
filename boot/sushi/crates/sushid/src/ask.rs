use std::path::Path;

use sushi::luks::{self, Unlocking};
use sushi::password::Request;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Why {
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
    Passphrase { disk: Option<String> },
    Pin { security_key: bool },
    Fallback { why: Why, accepts: Accepts },
}

pub struct Copy {
    pub title: String,
    pub explanation: Vec<String>,
    pub placeholder: &'static str,
    pub rejected: &'static str,
}

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

fn accepts(unlocking: Unlocking) -> Accepts {
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
        if request.id.starts_with("trustd:recovery:") {
            return Self::Fallback {
                why: Why::Changed,
                accepts: Accepts::RecoveryKey,
            };
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
                } else if has_tpm() {
                    Why::Changed
                } else {
                    Why::NoTpm
                },
                accepts: accepts(unlocking),
            },
            _ => Self::Passphrase {
                disk: disk_name(message),
            },
        }
    }

    pub fn accepts_recovery_key(&self) -> bool {
        matches!(
            self,
            Self::Fallback {
                accepts: Accepts::RecoveryKey | Accepts::RecoveryKeyOrPassphrase,
                ..
            }
        )
    }

    pub fn wants_only_a_recovery_key(&self) -> bool {
        matches!(
            self,
            Self::Fallback {
                accepts: Accepts::RecoveryKey,
                ..
            }
        )
    }

    pub fn copy(&self) -> Copy {
        match self {
            Self::Passphrase { disk } => Copy {
                title: disk
                    .as_ref()
                    .map_or("Unlock this computer".to_owned(), |disk| {
                        format!("Unlock {disk}")
                    }),
                explanation: Vec::new(),
                placeholder: "Passphrase",
                rejected: "That passphrase didn't work. Try again.",
            },
            Self::Pin {
                security_key: false,
            } => Copy {
                title: "Enter your PIN".to_owned(),
                explanation: Vec::new(),
                placeholder: "PIN",
                rejected: "That PIN didn't work. Try again.",
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
