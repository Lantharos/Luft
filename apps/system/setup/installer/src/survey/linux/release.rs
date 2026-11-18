use std::collections::HashMap;

pub struct Release {
    pub name: String,
    /// Whether it's Fedora or a system made from it, whose packages Luft can install too.
    pub fedora: bool,
}

fn fields(text: &str) -> HashMap<&str, String> {
    text.lines()
        .filter_map(|line| line.split_once('='))
        .map(|(key, value)| (key.trim(), value.trim().trim_matches('"').to_owned()))
        .collect()
}

pub fn parse(text: &str) -> Release {
    let fields = fields(text);
    let id = fields.get("ID").map_or("linux", String::as_str);
    let like = fields.get("ID_LIKE").map_or("", String::as_str);
    Release {
        name: fields
            .get("PRETTY_NAME")
            .or_else(|| fields.get("NAME"))
            .cloned()
            .unwrap_or_else(|| "Linux".to_owned()),
        fedora: id == "fedora" || like.split_whitespace().any(|kind| kind == "fedora"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn knows_fedora_and_its_relatives() {
        let fedora = parse(
            "NAME=\"Fedora Linux\"\nVERSION_ID=45\nID=fedora\nPRETTY_NAME=\"Fedora Linux 45 (Workstation Edition)\"\n",
        );
        assert!(fedora.fedora);
        assert_eq!(fedora.name, "Fedora Linux 45 (Workstation Edition)");
        assert!(parse("ID=nobara\nID_LIKE=\"rhel centos fedora\"\n").fedora);
        assert!(!parse("ID=endeavouros\nID_LIKE=arch\n").fedora);
    }
}
