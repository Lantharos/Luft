use std::collections::BTreeSet;

/// The UUID an eSCL scanner reports, spelled the same however it's reached.
pub fn uuid(reported: &str) -> Option<String> {
    let bare = reported.trim().to_lowercase();
    let bare: String = bare
        .trim_start_matches("urn:uuid:")
        .chars()
        .filter(char::is_ascii_hexdigit)
        .collect();
    (!bare.is_empty()).then_some(bare)
}

struct Model {
    make: String,
    numbers: BTreeSet<String>,
}

impl Model {
    fn read(name: &str) -> Option<Self> {
        let mut words = name.split_whitespace().map(str::to_lowercase);
        let make = words.next()?;
        let numbers: BTreeSet<String> = words
            .filter(|word| word.chars().any(|letter| letter.is_ascii_digit()))
            .collect();
        (!numbers.is_empty()).then_some(Model { make, numbers })
    }
}

/// Whether two names are the same make and model, as different drivers spell it.
pub fn same_model(one: &str, other: &str) -> bool {
    let (Some(one), Some(other)) = (Model::read(one), Model::read(other)) else {
        return false;
    };
    one.make == other.make
        && (one.numbers.is_subset(&other.numbers) || other.numbers.is_subset(&one.numbers))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn drivers_spell_one_model_alike() {
        assert!(same_model("Canon MX490 series", "Canon PIXMA MX490 Series"));
        assert!(same_model(
            "Canon MX490 series-6",
            "Canon PIXMA MX490 Series"
        ));
        assert!(same_model("EPSON ET-2850 Series", "Epson ET-2850"));
        assert!(!same_model(
            "Canon PIXMA MX490 Series",
            "Canon PIXMA MX492 Series"
        ));
        assert!(!same_model("HP LaserJet MFP M28w", "HP LaserJet MFP M28a"));
        assert!(!same_model("Canon PIXMA Series", "Canon PIXMA Series"));
    }

    #[test]
    fn uuids_compare_without_their_spelling() {
        assert_eq!(
            uuid("urn:uuid:4509A320-00A0-008F-00B6-002507510EEE"),
            uuid("4509a32000a0008f00b6002507510eee")
        );
        assert_eq!(uuid("  "), None);
    }
}
