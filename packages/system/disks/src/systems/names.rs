const KNOWN: [(&str, &str); 18] = [
    ("almalinux", "AlmaLinux"),
    ("arch", "Arch Linux"),
    ("centos", "CentOS"),
    ("debian", "Debian"),
    ("elementary", "elementary OS"),
    ("endeavouros", "EndeavourOS"),
    ("fedora", "Fedora"),
    ("kali", "Kali Linux"),
    ("manjaro", "Manjaro"),
    ("mint", "Linux Mint"),
    ("neon", "KDE neon"),
    ("nixos", "NixOS"),
    ("opensuse", "openSUSE"),
    ("pop", "Pop!_OS"),
    ("redhat", "Red Hat Enterprise Linux"),
    ("rocky", "Rocky Linux"),
    ("ubuntu", "Ubuntu"),
    ("zorin", "Zorin OS"),
];

pub fn linux(folder: &str, entries: &[(u16, String)]) -> String {
    let name = folder.rsplit('/').next().unwrap_or(folder);
    if let Some((_, known)) = KNOWN.iter().find(|(id, _)| name.eq_ignore_ascii_case(id)) {
        return (*known).to_owned();
    }
    entries.first().map_or_else(
        || {
            let mut letters = name.chars();
            letters.next().map_or_else(String::new, |first| {
                first.to_uppercase().chain(letters).collect()
            })
        },
        |(_, label)| label.clone(),
    )
}

pub fn windows(version: Option<&str>) -> String {
    let Some(version) = version else {
        return "Windows".to_owned();
    };
    let mut words = version.split_whitespace();
    match (words.next(), words.next()) {
        (Some("Windows"), Some(release)) => format!("Windows {release}"),
        _ => version.to_owned(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_systems_the_way_people_know_them() {
        assert_eq!(windows(Some("Windows 11 Pro")), "Windows 11");
        assert_eq!(windows(None), "Windows");
        assert_eq!(linux("EFI/ubuntu", &[(1, "ubuntu".to_owned())]), "Ubuntu");
        assert_eq!(linux("EFI/gentoo", &[]), "Gentoo");
        assert_eq!(
            linux("EFI/void", &[(3, "Void Linux".to_owned())]),
            "Void Linux"
        );
    }
}
