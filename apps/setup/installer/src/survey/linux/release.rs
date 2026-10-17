use std::collections::HashMap;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Family {
    Fedora,
    Arch,
    Other,
}

pub struct Release {
    pub name: String,
    pub id: String,
    pub version: String,
    pub family: Family,
}

fn fields(text: &str) -> HashMap<&str, String> {
    text.lines()
        .filter_map(|line| line.split_once('='))
        .map(|(key, value)| (key.trim(), value.trim().trim_matches('"').to_owned()))
        .collect()
}

pub fn parse(text: &str) -> Release {
    let fields = fields(text);
    let id = fields
        .get("ID")
        .cloned()
        .unwrap_or_else(|| "linux".to_owned());
    let like = fields.get("ID_LIKE").cloned().unwrap_or_default();
    let family_of = |name: &str| id == name || like.split_whitespace().any(|kind| kind == name);
    Release {
        name: fields
            .get("PRETTY_NAME")
            .or_else(|| fields.get("NAME"))
            .cloned()
            .unwrap_or_else(|| "Linux".to_owned()),
        version: fields.get("VERSION_ID").cloned().unwrap_or_default(),
        family: if family_of("fedora") {
            Family::Fedora
        } else if family_of("arch") {
            Family::Arch
        } else {
            Family::Other
        },
        id,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn knows_fedora_and_arch_and_their_relatives() {
        let fedora = parse(
            "NAME=\"Fedora Linux\"\nVERSION_ID=45\nID=fedora\nPRETTY_NAME=\"Fedora Linux 45 (Workstation Edition)\"\n",
        );
        assert_eq!(fedora.family, Family::Fedora);
        assert_eq!(fedora.name, "Fedora Linux 45 (Workstation Edition)");
        assert_eq!(parse("ID=endeavouros\nID_LIKE=arch\n").family, Family::Arch);
        assert_eq!(parse("ID=ubuntu\nID_LIKE=debian\n").family, Family::Other);
    }
}
