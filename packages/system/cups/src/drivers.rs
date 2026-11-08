use crate::ipp::Attributes;
use crate::uri::decode;

const SIMPLIFIED: &str = "simplified";

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Fit {
    Exact,
    Close,
    Other,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Driver {
    pub name: String,
    pub description: String,
    pub fit: Fit,
}

#[derive(Clone, Default, Debug, PartialEq, Eq)]
pub struct DeviceId {
    pub make: String,
    pub model: String,
}

impl DeviceId {
    pub fn from_usb_uri(uri: &str) -> Option<Self> {
        let path = uri.strip_prefix("usb://")?.split('?').next()?;
        let (make, model) = path.split_once('/')?;
        Some(Self {
            make: decode(make),
            model: decode(model),
        })
    }

    pub fn parse(id: &str) -> Self {
        let mut parsed = Self::default();
        for field in id.split(';') {
            let Some((key, value)) = field.split_once(':') else {
                continue;
            };
            let value = value.trim().to_owned();
            match key.trim().to_ascii_uppercase().as_str() {
                "MFG" | "MANUFACTURER" => parsed.make = value,
                "MDL" | "MODEL" => parsed.model = value,
                _ => {}
            }
        }
        parsed
    }

    pub fn same_printer(&self, other: &Self) -> bool {
        !self.model.is_empty()
            && squash(&self.make) == squash(&other.make)
            && squash(&self.model) == squash(&other.model)
    }
}

fn squash(text: &str) -> String {
    text.chars()
        .filter(char::is_ascii_alphanumeric)
        .map(|character| character.to_ascii_lowercase())
        .collect()
}

fn model_of<'a>(description: &'a str, make: &str) -> &'a str {
    let model = description.split(" - ").next().unwrap_or(description);
    model
        .get(..make.len())
        .filter(|prefix| prefix.eq_ignore_ascii_case(make))
        .map_or(model, |_| model[make.len()..].trim_start())
}

fn numbered(model: &str) -> Option<String> {
    model
        .split_whitespace()
        .find(|word| word.chars().any(|character| character.is_ascii_digit()))
        .map(squash)
}

fn fit(device: &DeviceId, description: &str) -> Fit {
    let model = model_of(description, &device.make);
    if squash(model) == squash(&device.model) {
        return Fit::Exact;
    }
    let close = numbered(&device.model)
        .is_some_and(|wanted| model.split_whitespace().any(|word| squash(word) == wanted));
    if close { Fit::Close } else { Fit::Other }
}

pub fn rank(device: &DeviceId, found: &[Attributes]) -> Vec<Driver> {
    let mut drivers: Vec<Driver> = found
        .iter()
        .filter_map(|attributes| {
            let name = attributes.text("ppd-name")?.to_owned();
            let description = attributes.text("ppd-make-and-model")?.to_owned();
            Some(Driver {
                fit: fit(device, &description),
                name,
                description,
            })
        })
        .collect();
    drivers.sort_by(|left, right| {
        let simplified =
            |driver: &Driver| driver.description.to_ascii_lowercase().contains(SIMPLIFIED);
        (left.fit, simplified(left), &left.description).cmp(&(
            right.fit,
            simplified(right),
            &right.description,
        ))
    });
    drivers
}

pub fn best(device: &DeviceId, found: &[Attributes]) -> Option<Driver> {
    rank(device, found)
        .into_iter()
        .next()
        .filter(|driver| driver.fit != Fit::Other)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn device() -> DeviceId {
        DeviceId::parse(
            "MFG:Canon;CMD:BJL,BJRaster3,BSCCe,NCCe,IVEC,IVECPLI;MDL:MX490 series;CLS:PRINTER;DES:Canon MX490 series;",
        )
    }

    #[test]
    fn reads_make_and_model() {
        assert_eq!(
            device(),
            DeviceId {
                make: "Canon".into(),
                model: "MX490 series".into()
            }
        );
    }

    #[test]
    fn picks_the_full_driver_for_the_exact_model() {
        let found: Vec<Attributes> = [
            (
                "gutenprint.5.3://bjc-PIXMA-MX490/expert",
                "Canon PIXMA MX490 - CUPS+Gutenprint v5.3.5",
            ),
            (
                "gutenprint.5.3://bjc-MX490-series/simple",
                "Canon MX490 series - CUPS+Gutenprint v5.3.5 Simplified",
            ),
            (
                "gutenprint.5.3://bjc-MX490-series/expert",
                "Canon MX490 series - CUPS+Gutenprint v5.3.5",
            ),
            (
                "gutenprint.5.3://bjc-MX520-series/expert",
                "Canon MX520 series - CUPS+Gutenprint v5.3.5",
            ),
        ]
        .into_iter()
        .map(|(name, description)| {
            Attributes::from_texts(&[("ppd-name", name), ("ppd-make-and-model", description)])
        })
        .collect();
        let ranked = rank(&device(), &found);
        assert_eq!(ranked[0].name, "gutenprint.5.3://bjc-MX490-series/expert");
        assert_eq!(ranked[2].fit, Fit::Close);
        assert_eq!(ranked[3].fit, Fit::Other);
    }

    #[test]
    fn matches_the_same_printer_reached_two_ways() {
        let network = DeviceId {
            make: "Canon".into(),
            model: "MX490 Series".into(),
        };
        assert!(device().same_printer(&network));
        assert!(!device().same_printer(&DeviceId::default()));
        let usb = DeviceId::from_usb_uri("usb://Canon/MX490%20series?serial=585EF4&interface=1");
        assert_eq!(usb, Some(device()));
    }
}
