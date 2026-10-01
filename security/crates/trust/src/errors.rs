use std::fmt;

#[derive(Debug)]
pub struct WrongKey;

#[derive(Debug)]
pub struct NeedsKey;

#[derive(Debug)]
pub struct Unsupported(pub String);

#[derive(Debug)]
pub struct Busy;

impl fmt::Display for WrongKey {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str("That recovery key or passphrase doesn't unlock this disk.")
    }
}

impl fmt::Display for NeedsKey {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str("Enter the disk's recovery key or passphrase to continue.")
    }
}

impl fmt::Display for Unsupported {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(&self.0)
    }
}

impl fmt::Display for Busy {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str("Something else is changing the disk right now. Try again in a moment.")
    }
}

impl std::error::Error for WrongKey {}
impl std::error::Error for NeedsKey {}
impl std::error::Error for Unsupported {}
impl std::error::Error for Busy {}
