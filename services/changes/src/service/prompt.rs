/// The sentence a password prompt shows for a set of changes, naming every
/// one of them, such as `Authentication is required to turn on developer
/// tools and get nightly versions of Luft`.
pub fn message(changes: &[String]) -> String {
    let listed = match changes {
        [] => String::new(),
        [only] => only.clone(),
        [rest @ .., last] => format!("{} and {last}", rest.join(", ")),
    };
    format!("Authentication is required to {listed}")
}

#[cfg(test)]
mod tests {
    use super::message;

    #[test]
    fn names_every_change() {
        let changes = [
            "turn on developer tools",
            "look for updates every day",
            "set the time automatically",
        ]
        .map(str::to_owned);
        assert_eq!(
            message(&changes),
            "Authentication is required to turn on developer tools, look for updates every day and set the time automatically"
        );
        assert_eq!(
            message(&changes[..1]),
            "Authentication is required to turn on developer tools"
        );
    }
}
