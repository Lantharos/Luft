pub fn operand(value: &str) -> Result<&str, String> {
    if value.is_empty() || value.starts_with('-') {
        Err("That isn't a valid name.".into())
    } else {
        Ok(value)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn refuses_options_in_place_of_names() {
        assert!(operand("org.mozilla.firefox").is_ok());
        assert!(operand("app/org.gimp.GIMP/x86_64/stable").is_ok());
        assert!(operand("--installation=evil").is_err());
        assert!(operand("-y").is_err());
        assert!(operand("").is_err());
    }
}
