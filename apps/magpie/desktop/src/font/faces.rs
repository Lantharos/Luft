use serde::Serialize;
use skrifa::attribute::Style;
use skrifa::raw::{FileRef, TableProvider};
use skrifa::string::StringId;
use skrifa::{FontRef, MetadataProvider};

const FIRST_PRINTABLE: u32 = 0x20;
const DELETE: u32 = 0x7f;
const LAST_C1_CONTROL: u32 = 0x9f;

#[derive(Serialize)]
pub struct Axis {
    tag: String,
    name: String,
    min: f32,
    default: f32,
    max: f32,
}

#[derive(Serialize)]
pub struct Instance {
    name: String,
    coordinates: Vec<(String, f32)>,
}

#[derive(Serialize)]
pub struct Identity {
    pub family: String,
    pub style: String,
    pub postscript: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Face {
    index: u32,
    #[serde(flatten)]
    identity: Identity,
    full_name: Option<String>,
    weight: f32,
    italic: bool,
    version: Option<String>,
    designer: Option<String>,
    manufacturer: Option<String>,
    license: Option<String>,
    license_url: Option<String>,
    copyright: Option<String>,
    sample: Option<String>,
    glyphs: u16,
    monospace: bool,
    characters: Vec<[u32; 2]>,
    axes: Vec<Axis>,
    instances: Vec<Instance>,
}

fn text(font: &FontRef, id: StringId) -> Option<String> {
    let value: String = font
        .localized_strings(id)
        .english_or_first()?
        .chars()
        .collect();
    let value = value.trim();
    (!value.is_empty()).then(|| value.to_owned())
}

fn first_text(font: &FontRef, ids: &[StringId]) -> Option<String> {
    ids.iter().find_map(|id| text(font, *id))
}

fn printable(codepoint: u32) -> bool {
    codepoint >= FIRST_PRINTABLE
        && !(DELETE..=LAST_C1_CONTROL).contains(&codepoint)
        && char::from_u32(codepoint).is_some_and(|character| !character.is_whitespace())
}

fn character_ranges(font: &FontRef) -> Vec<[u32; 2]> {
    let mut codepoints: Vec<u32> = font
        .charmap()
        .mappings()
        .map(|(codepoint, _)| codepoint)
        .filter(|codepoint| printable(*codepoint))
        .collect();
    codepoints.sort_unstable();
    codepoints.dedup();
    let mut ranges: Vec<[u32; 2]> = Vec::new();
    for codepoint in codepoints {
        match ranges.last_mut() {
            Some(range) if range[1] + 1 == codepoint => range[1] = codepoint,
            _ => ranges.push([codepoint, codepoint]),
        }
    }
    ranges
}

fn axes(font: &FontRef) -> Vec<Axis> {
    font.axes()
        .iter()
        .filter(|axis| !axis.is_hidden())
        .map(|axis| Axis {
            tag: axis.tag().to_string(),
            name: text(font, axis.name_id()).unwrap_or_else(|| axis.tag().to_string()),
            min: axis.min_value(),
            default: axis.default_value(),
            max: axis.max_value(),
        })
        .collect()
}

fn instances(font: &FontRef) -> Vec<Instance> {
    let tags: Vec<String> = font
        .axes()
        .iter()
        .map(|axis| axis.tag().to_string())
        .collect();
    font.named_instances()
        .iter()
        .filter_map(|instance| {
            Some(Instance {
                name: text(font, instance.subfamily_name_id())?,
                coordinates: tags.iter().cloned().zip(instance.user_coords()).collect(),
            })
        })
        .collect()
}

fn identity(font: &FontRef) -> Identity {
    Identity {
        family: first_text(
            font,
            &[StringId::TYPOGRAPHIC_FAMILY_NAME, StringId::FAMILY_NAME],
        )
        .unwrap_or_default(),
        style: first_text(
            font,
            &[
                StringId::TYPOGRAPHIC_SUBFAMILY_NAME,
                StringId::SUBFAMILY_NAME,
            ],
        )
        .unwrap_or_else(|| "Regular".to_owned()),
        postscript: text(font, StringId::POSTSCRIPT_NAME),
    }
}

fn face(index: u32, font: &FontRef) -> Face {
    let attributes = font.attributes();
    Face {
        index,
        identity: identity(font),
        full_name: text(font, StringId::FULL_NAME),
        weight: attributes.weight.value(),
        italic: !matches!(attributes.style, Style::Normal),
        version: text(font, StringId::VERSION_STRING),
        designer: text(font, StringId::DESIGNER),
        manufacturer: text(font, StringId::MANUFACTURER),
        license: text(font, StringId::LICENSE_DESCRIPTION),
        license_url: text(font, StringId::LICENSE_URL),
        copyright: text(font, StringId::COPYRIGHT_NOTICE),
        sample: text(font, StringId::SAMPLE_TEXT),
        glyphs: font
            .maxp()
            .map(|maxp| maxp.num_glyphs())
            .unwrap_or_default(),
        monospace: luft_app::fonts::has_fixed_advances(font),
        characters: character_ranges(font),
        axes: axes(font),
        instances: instances(font),
    }
}

fn each<T>(bytes: &[u8], read: impl Fn(u32, &FontRef) -> T) -> Result<Vec<T>, String> {
    let unreadable = || "This isn't a font Magpie can read".to_string();
    let file = FileRef::new(bytes).map_err(|_| unreadable())?;
    let faces: Vec<T> = file
        .fonts()
        .zip(0..)
        .filter_map(|(font, index)| Some(read(index, &font.ok()?)))
        .collect();
    if faces.is_empty() {
        return Err(unreadable());
    }
    Ok(faces)
}

pub fn read(bytes: &[u8]) -> Result<Vec<Face>, String> {
    each(bytes, face)
}

pub fn identities(bytes: &[u8]) -> Result<Vec<Identity>, String> {
    each(bytes, |_, font| identity(font))
}
