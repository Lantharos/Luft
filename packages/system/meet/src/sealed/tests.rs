use std::fs;
use std::path::PathBuf;

use super::blob::CHUNK;
use super::*;

fn scratch(name: &str) -> PathBuf {
    let folder = std::env::temp_dir().join(format!("luft-box-{name}-{}", std::process::id()));
    let _ = fs::remove_dir_all(&folder);
    fs::create_dir_all(&folder).unwrap();
    folder
}

fn packed(name: &str, files: &[(&str, Vec<u8>)]) -> (PathBuf, Code) {
    let root = scratch(name);
    let (mut packing, code) = Packing::start(&root).unwrap();
    for (path, bytes) in files {
        packing
            .add(path, Some(7), &mut bytes.as_slice(), |_| {})
            .unwrap();
    }
    packing.finish(Manifest::default()).unwrap();
    (root, code)
}

fn extracted(opened: &mut Opened, index: usize) -> std::io::Result<Vec<u8>> {
    let mut file = Vec::new();
    opened.extract(index, &mut file, |_| {})?;
    Ok(file)
}

#[test]
fn a_box_gives_back_what_was_packed_at_every_chunk_edge() {
    let files: Vec<(String, Vec<u8>)> = [0, 1, CHUNK - 1, CHUNK, CHUNK + 1, 2 * CHUNK]
        .into_iter()
        .map(|size| {
            let bytes = (0..size).map(|at| (at % 251) as u8).collect();
            (format!("files/Documents/{size}"), bytes)
        })
        .collect();
    let named: Vec<(&str, Vec<u8>)> = files
        .iter()
        .map(|(path, bytes)| (path.as_str(), bytes.clone()))
        .collect();
    let (root, code) = packed("edges", &named);
    let typed = code.grouped().to_lowercase().replace('0', "o");
    let mut opened = Opened::open(&root, &Code::parse(&typed).unwrap()).unwrap();
    for (index, (path, bytes)) in files.iter().enumerate() {
        assert_eq!(opened.contents.files[index].path, *path);
        assert_eq!(extracted(&mut opened, index).unwrap(), *bytes, "{path}");
    }
    fs::remove_dir_all(root).unwrap();
}

#[test]
fn another_code_opens_nothing() {
    let (root, _) = packed("code", &[("wifi/0.xml", b"secret".to_vec())]);
    assert!(matches!(
        Opened::open(&root, &Code::random()),
        Err(Refused::WrongCode)
    ));
    fs::remove_file(root.join(key::HEADER)).unwrap();
    assert!(matches!(
        Opened::open(&root, &Code::random()),
        Err(Refused::Unsealed)
    ));
    fs::remove_dir_all(root).unwrap();
}

#[test]
fn swapped_cut_and_changed_files_are_refused() {
    let whole = vec![3; CHUNK * 2];
    let (root, code) = packed(
        "tamper",
        &[
            ("files/Documents/a", b"first".to_vec()),
            ("files/Documents/b", b"other".to_vec()),
            ("files/Documents/c", whole),
        ],
    );
    let blob = |number: u64| root.join("blobs/0").join(number.to_string());
    let first = fs::read(blob(1)).unwrap();
    fs::copy(blob(2), blob(1)).unwrap();
    let mut opened = Opened::open(&root, &code).unwrap();
    assert!(extracted(&mut opened, 0).is_err());

    let mut flipped = first;
    flipped[0] ^= 1;
    fs::write(blob(1), flipped).unwrap();
    assert!(extracted(&mut opened, 0).is_err());

    let long = fs::read(blob(3)).unwrap();
    fs::write(blob(3), &long[..CHUNK + 16]).unwrap();
    assert!(extracted(&mut opened, 2).is_err());

    fs::remove_file(blob(2)).unwrap();
    assert!(extracted(&mut opened, 1).is_err());
    fs::remove_dir_all(root).unwrap();
}

#[test]
fn codes_read_as_people_type_them() {
    let code = Code::random();
    let shown = code.grouped();
    assert_eq!(shown.len(), 14);
    assert_eq!(Code::parse(&shown).unwrap().grouped(), shown);
    assert_eq!(
        Code::parse("oil0-1234-abcd").unwrap().grouped(),
        "0110-1234-ABCD"
    );
    for wrong in ["", "0000-0000-000", "0000-0000-0000-0", "UUUU-0000-0000"] {
        assert!(Code::parse(wrong).is_none(), "{wrong}");
    }
}
