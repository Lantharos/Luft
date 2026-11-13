use std::path::{Path, PathBuf};

use luft_dbus::runtime::block_on;
use luft_software::apps::places::{self, Access, Answer, Drive, Known};
use schelf_core::library::InstalledApp;

use super::trust::sandboxed_named;
use crate::install::Exit;
use crate::install::arguments::Arguments;
use crate::install::sources::installed;
use crate::install::terminal::{Ink, bytes};

/// A drive or folder named on the command line.
enum Place {
    Drive(Drive),
    Held(Known),
    Folder(PathBuf),
}

fn drive_name(label: &str, size: u64) -> String {
    if label.is_empty() {
        format!("the {} drive", bytes(size))
    } else {
        label.to_owned()
    }
}

fn place_name(place: &Place) -> String {
    match place {
        Place::Drive(drive) => drive_name(&drive.label, drive.size),
        Place::Held(known) => drive_name(&known.label, known.size),
        Place::Folder(folder) => folder.display().to_string(),
    }
}

/// The drive or folder `word` names: a drive by its name or where it's
/// mounted, any other folder by its path, and when taking one away, also a
/// drive that isn't plugged in now.
fn find(word: &str, mounted: &[Drive], held: &[(Known, Answer)]) -> Option<Place> {
    let path = Path::new(word);
    let real = path.canonicalize().ok();
    if let Some(drive) = mounted.iter().find(|drive| {
        drive.label.eq_ignore_ascii_case(word)
            || drive
                .mount_points
                .iter()
                .any(|point| Some(point) == real.as_ref())
    }) {
        return Some(Place::Drive(drive.clone()));
    }
    if let Some((known, _)) = held
        .iter()
        .find(|(known, _)| known.label.eq_ignore_ascii_case(word))
    {
        return Some(Place::Held(known.clone()));
    }
    real.filter(|real| real.is_dir()).map(Place::Folder)
}

fn list(
    app: &InstalledApp,
    mounted: &[Drive],
    held: &[(Known, Answer)],
    folders: &[(String, Access)],
) {
    let ink = Ink::stdout();
    let can = |access: Access| match access {
        Access::ReadWrite => "can read and change it",
        Access::ReadOnly => "can read it",
    };
    let mut given = false;
    for (known, answer) in held {
        if let Answer::Given(access) = answer {
            given = true;
            println!(
                "  {}  {}",
                ink.bold(drive_name(&known.label, known.size)),
                can(*access)
            );
        }
    }
    for (folder, access) in folders {
        given = true;
        println!("  {}  {}", ink.bold(folder), can(*access));
    }
    if !given {
        println!("{} has only its sandbox.", ink.bold(&app.name));
    }
    let others: Vec<&Drive> = mounted
        .iter()
        .filter(|drive| {
            !held
                .iter()
                .any(|(known, answer)| known.is(drive) && matches!(answer, Answer::Given(_)))
        })
        .collect();
    if !others.is_empty() {
        println!("\nDrives you can give it:");
        for drive in others {
            let points: Vec<String> = drive
                .mount_points
                .iter()
                .map(|point| point.display().to_string())
                .collect();
            println!(
                "  {}  {}",
                ink.bold(drive_name(&drive.label, drive.size)),
                ink.dim(points.join(", "))
            );
        }
    }
}

async fn change(app: &InstalledApp, words: &[String], give: bool, access: Access) -> Exit {
    let ink = Ink::stdout();
    let attempt = async {
        let connection = luft_dbus::session().await?;
        let (mounted, held) =
            futures_util::try_join!(places::mounted(), places::held(connection, &app.id))?;
        let [word] = words else {
            list(
                app,
                &mounted,
                &held,
                &places::folders(connection, &app.id).await?,
            );
            return Ok(Exit::Done);
        };
        let Some(place) = find(word, &mounted, &held) else {
            eprintln!(
                "There's no drive or folder called {}.",
                Ink::stderr().bold(word)
            );
            list(app, &mounted, &held, &[]);
            return Ok(Exit::Missing);
        };
        let name = place_name(&place);
        match (place, give) {
            (Place::Drive(drive), true) => {
                places::give(connection, &app.id, &drive, access).await?
            }
            (Place::Folder(folder), true) => {
                places::give_folder(connection, &app.id, &folder.to_string_lossy(), access).await?
            }
            (Place::Held(_), true) => {
                eprintln!(
                    "{name} isn't plugged in. Plug it in to give it to {}.",
                    app.name
                );
                return Ok(Exit::Missing);
            }
            (Place::Drive(drive), false) => {
                for (known, _) in held.iter().filter(|(known, _)| known.is(&drive)) {
                    places::take(connection, &app.id, known).await?;
                }
            }
            (Place::Held(known), false) => places::take(connection, &app.id, &known).await?,
            (Place::Folder(folder), false) => {
                places::take_folder(connection, &app.id, &folder.to_string_lossy()).await?
            }
        }
        let done = match (give, access) {
            (true, Access::ReadWrite) => format!("{} can use {name}", ink.bold(&app.name)),
            (true, Access::ReadOnly) => format!("{} can read {name}", ink.bold(&app.name)),
            (false, _) => format!("{} can't use {name} any more", ink.bold(&app.name)),
        };
        println!("{done} from the next time it opens.");
        Ok::<Exit, String>(Exit::Done)
    };
    attempt.await.unwrap_or_else(|error| {
        eprintln!("{error}");
        Exit::Failed
    })
}

/// `give` and `take`: a drive or folder for one sandboxed app, or what it has
/// and could have when no place is named.
pub fn run(arguments: &Arguments, give: bool) -> Exit {
    let [name, words @ ..] = arguments.words.as_slice() else {
        return Exit::Usage;
    };
    if words.len() > 1 {
        eprintln!("Name one drive or folder at a time.");
        return Exit::Usage;
    }
    let app = match sandboxed_named(name, &installed::all(None), arguments.yes) {
        Ok(app) => app,
        Err(exit) => return exit,
    };
    let access = if arguments.read_only {
        Access::ReadOnly
    } else {
        Access::ReadWrite
    };
    block_on(change(&app, words, give, access))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn drive(label: &str, point: &Path) -> Drive {
        Drive {
            uuid: format!("{label}-uuid"),
            drive: "Samsung-870-S6PX".to_owned(),
            label: label.to_owned(),
            size: 500_000_000_000,
            removable: false,
            mount_points: vec![point.canonicalize().unwrap()],
        }
    }

    #[test]
    fn a_drives_mount_point_names_the_drive_not_a_folder() {
        let mounted = tempfile::tempdir().unwrap();
        let inside = mounted.path().join("SteamLibrary");
        std::fs::create_dir(&inside).unwrap();
        let drives = [drive("Games", mounted.path())];
        let unplugged = [(
            Known {
                uuid: "77aa".to_owned(),
                drive: String::new(),
                label: "Backup".to_owned(),
                size: 0,
            },
            Answer::Given(Access::ReadOnly),
        )];
        let path = mounted.path().to_string_lossy();
        assert!(matches!(find(&path, &drives, &[]), Some(Place::Drive(_))));
        assert!(matches!(find("games", &drives, &[]), Some(Place::Drive(_))));
        assert!(matches!(
            find(&inside.to_string_lossy(), &drives, &[]),
            Some(Place::Folder(_))
        ));
        assert!(matches!(
            find("backup", &drives, &unplugged),
            Some(Place::Held(_))
        ));
        assert!(find("Elsewhere", &drives, &unplugged).is_none());
    }
}
