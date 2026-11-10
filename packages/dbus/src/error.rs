const UNEXPLAINED: &str = "Something went wrong. Try again.";

/// The last part of a Luft service's error name, such as `NotInstalled` for
/// `com.lantharos.Speech1.Error.NotInstalled`, which apps translate.
pub fn kind(error: &zbus::Error) -> Option<String> {
    let name = crate::error_name(error)?;
    name.rsplit_once(".Error.").map(|(_, kind)| kind.to_owned())
}

/// What a service tells its caller about an error: the words the service
/// wrote itself, never what a tool or the system printed underneath.
pub fn plain_words(error: &anyhow::Error) -> String {
    let outermost = error.to_string();
    let written_by_the_service = error
        .downcast_ref::<&'static str>()
        .is_some_and(|words| *words == outermost)
        || error.downcast_ref::<String>() == Some(&outermost);
    if written_by_the_service {
        outermost
    } else {
        UNEXPLAINED.to_owned()
    }
}

/// A service's `Error`: named `<prefix>.<Kind>` on the bus, with
/// `NotAuthorized`, `Failed` and the kinds listed. An `anyhow` error that
/// holds one keeps its kind; any other becomes `Failed` with its plain words,
/// and the rest goes to the journal.
#[macro_export]
macro_rules! errors {
    ($prefix:tt { $($kind:ident),* $(,)? }) => {
        #[derive(Debug, ::zbus::DBusError)]
        #[zbus(prefix = $prefix)]
        pub enum Error {
            #[zbus(error)]
            ZBus(::zbus::Error),
            NotAuthorized(String),
            $($kind(String),)*
            Failed(String),
        }

        impl From<$crate::anyhow::Error> for Error {
            fn from(error: $crate::anyhow::Error) -> Self {
                match error.downcast::<Self>() {
                    Ok(named) => named,
                    Err(error) => {
                        eprintln!("{error:#}");
                        Self::Failed($crate::error::plain_words(&error))
                    }
                }
            }
        }

        impl From<$crate::polkit::Denied> for Error {
            fn from(denied: $crate::polkit::Denied) -> Self {
                match denied {
                    $crate::polkit::Denied::Refused => {
                        Self::NotAuthorized("You aren't allowed to do this.".to_owned())
                    }
                    $crate::polkit::Denied::Unanswered(error) => Self::ZBus(error),
                }
            }
        }
    };
}

#[cfg(test)]
mod tests {
    use anyhow::{Context, anyhow};

    use super::{UNEXPLAINED, plain_words};

    #[test]
    fn only_a_service_s_own_words_reach_the_caller() {
        let tool = || std::io::Error::other("lsblk: /dev/sda: not a block device");
        assert_eq!(plain_words(&anyhow::Error::from(tool())), UNEXPLAINED);
        let explained = Err::<(), _>(tool()).context("The drives couldn't be listed");
        assert_eq!(
            plain_words(&explained.unwrap_err()),
            "The drives couldn't be listed"
        );
        let device = "/dev/sda";
        assert_eq!(
            plain_words(&anyhow!("{device} isn't there anymore")),
            "/dev/sda isn't there anymore"
        );
    }
}
