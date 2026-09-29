use std::fs::File;
use std::io::BufReader;
use std::path::Path;

use exif::{Exif, In, Tag, Value};
use serde::Serialize;

const ROTATED_ORIENTATIONS: [u32; 4] = [5, 6, 7, 8];

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Details {
    width: Option<usize>,
    height: Option<usize>,
    camera: Option<String>,
    lens: Option<String>,
    exposure: Option<f64>,
    aperture: Option<f64>,
    iso: Option<u32>,
    focal_length: Option<f64>,
    taken: Option<String>,
    location: Option<Location>,
}

#[derive(Serialize)]
pub struct Location {
    latitude: f64,
    longitude: f64,
    altitude: Option<f64>,
}

pub fn details(path: &Path) -> Details {
    let exif = File::open(path).ok().and_then(|file| {
        exif::Reader::new()
            .read_from_container(&mut BufReader::new(file))
            .ok()
    });
    let mut details = exif.as_ref().map(from_exif).unwrap_or_default();
    if let Ok(size) = imagesize::size(path) {
        let rotated = exif
            .as_ref()
            .and_then(|exif| number(exif, Tag::Orientation))
            .is_some_and(|orientation| ROTATED_ORIENTATIONS.contains(&(orientation as u32)));
        let (width, height) = if rotated {
            (size.height, size.width)
        } else {
            (size.width, size.height)
        };
        details.width = Some(width);
        details.height = Some(height);
    }
    details
}

fn from_exif(exif: &Exif) -> Details {
    Details {
        camera: camera(exif),
        lens: text(exif, Tag::LensModel),
        exposure: number(exif, Tag::ExposureTime),
        aperture: number(exif, Tag::FNumber),
        iso: number(exif, Tag::PhotographicSensitivity).map(|iso| iso as u32),
        focal_length: number(exif, Tag::FocalLength),
        taken: taken(exif),
        location: location(exif),
        ..Details::default()
    }
}

fn text(exif: &Exif, tag: Tag) -> Option<String> {
    let field = exif.get_field(tag, In::PRIMARY)?;
    let Value::Ascii(parts) = &field.value else {
        return None;
    };
    let text = String::from_utf8_lossy(parts.first()?).trim().to_string();
    (!text.is_empty()).then_some(text)
}

fn numbers(exif: &Exif, tag: Tag) -> Option<Vec<f64>> {
    let field = exif.get_field(tag, In::PRIMARY)?;
    let values: Vec<f64> = match &field.value {
        Value::Rational(values) => values.iter().map(|value| value.to_f64()).collect(),
        Value::SRational(values) => values.iter().map(|value| value.to_f64()).collect(),
        Value::Short(values) => values.iter().map(|&value| value.into()).collect(),
        Value::Long(values) => values.iter().map(|&value| value.into()).collect(),
        Value::Byte(values) => values.iter().map(|&value| value.into()).collect(),
        _ => return None,
    };
    (!values.is_empty() && values.iter().all(|value| value.is_finite())).then_some(values)
}

fn number(exif: &Exif, tag: Tag) -> Option<f64> {
    numbers(exif, tag)?.first().copied()
}

fn camera(exif: &Exif) -> Option<String> {
    let model = text(exif, Tag::Model);
    match (text(exif, Tag::Make), model) {
        (Some(make), Some(model)) if model.to_lowercase().starts_with(&make.to_lowercase()) => {
            Some(model)
        }
        (Some(make), Some(model)) => Some(format!("{make} {model}")),
        (make, model) => model.or(make),
    }
}

fn taken(exif: &Exif) -> Option<String> {
    let stamp = text(exif, Tag::DateTimeOriginal).or_else(|| text(exif, Tag::DateTime))?;
    let (date, time) = stamp.split_once(' ')?;
    let offset = text(exif, Tag::OffsetTimeOriginal).unwrap_or_default();
    Some(format!("{}T{time}{offset}", date.replace(':', "-")))
}

fn coordinate(exif: &Exif, tag: Tag, reference: Tag, negative: &str) -> Option<f64> {
    let parts = numbers(exif, tag)?;
    let [degrees, minutes, seconds] = parts[..] else {
        return None;
    };
    let value = degrees + minutes / 60.0 + seconds / 3600.0;
    let flipped = text(exif, reference).is_some_and(|reference| reference == negative);
    Some(if flipped { -value } else { value })
}

fn location(exif: &Exif) -> Option<Location> {
    let latitude = coordinate(exif, Tag::GPSLatitude, Tag::GPSLatitudeRef, "S")?;
    let longitude = coordinate(exif, Tag::GPSLongitude, Tag::GPSLongitudeRef, "W")?;
    let below_sea = number(exif, Tag::GPSAltitudeRef) == Some(1.0);
    let altitude =
        number(exif, Tag::GPSAltitude).map(|altitude| if below_sea { -altitude } else { altitude });
    Some(Location {
        latitude,
        longitude,
        altitude,
    })
}
