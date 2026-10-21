use std::collections::{BTreeSet, HashMap};
use std::fs;
use std::os::unix::fs::{MetadataExt, PermissionsExt, lchown};
use std::path::Path;

use anyhow::{Context, Result};
use walkdir::WalkDir;

const SYSUSERS: &str = "usr/lib/sysusers.d/00-luft-system-packages.conf";
const HELD: &str = "luft-held-";

/// A line of /etc/passwd or /etc/group.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Entry {
    fields: Vec<String>,
}

impl Entry {
    fn parse(line: &str) -> Option<Self> {
        let fields: Vec<String> = line.split(':').map(str::to_owned).collect();
        (fields.len() >= 4 && fields[2].parse::<u32>().is_ok()).then_some(Self { fields })
    }

    pub fn name(&self) -> &str {
        &self.fields[0]
    }

    pub fn id(&self) -> u32 {
        self.fields[2].parse().unwrap_or_default()
    }

    fn field(&self, index: usize) -> &str {
        self.fields.get(index).map_or("", String::as_str)
    }

    fn line(&self) -> String {
        self.fields.join(":")
    }
}

pub fn read(text: &str) -> Vec<Entry> {
    text.lines().filter_map(Entry::parse).collect()
}

fn load(path: &Path) -> Result<Vec<Entry>> {
    Ok(read(
        &fs::read_to_string(path).with_context(|| format!("Reading {}", path.display()))?,
    ))
}

fn id_of(entries: &[Entry], name: &str) -> Option<u32> {
    entries
        .iter()
        .find(|entry| entry.name() == name)
        .map(Entry::id)
}

/// One of /etc/passwd and /etc/group as the build root gets it: the ones earlier system
/// packages made are renamed, so the packages make them again and the build learns they're
/// still wanted, while their IDs stay taken.
pub struct Database {
    computer: Vec<Entry>,
    seeded: Vec<Entry>,
}

impl Database {
    pub fn new(computer: Vec<Entry>, made: &BTreeSet<String>) -> Self {
        let seeded = computer
            .iter()
            .map(|entry| {
                let mut entry = entry.clone();
                if made.contains(entry.name()) {
                    entry.fields[0] = format!("{HELD}{}", entry.id());
                }
                entry
            })
            .collect();
        Self { computer, seeded }
    }

    /// What the packages added, with the ID each has on the computer when an earlier build
    /// made it already, and how IDs in the build root move to get there.
    pub fn added(&self, after: Vec<Entry>) -> (Vec<Entry>, HashMap<u32, u32>) {
        let mut moved = HashMap::new();
        let added = after
            .into_iter()
            .filter(|entry| {
                !entry.name().starts_with(HELD) && id_of(&self.seeded, entry.name()).is_none()
            })
            .map(|mut entry| {
                if let Some(id) = id_of(&self.computer, entry.name())
                    && id != entry.id()
                {
                    moved.insert(entry.id(), id);
                    entry.fields[2] = id.to_string();
                }
                entry
            })
            .collect();
        (added, moved)
    }

    fn name_of(&self, id: u32) -> Option<&str> {
        self.computer
            .iter()
            .find(|entry| entry.id() == id)
            .map(Entry::name)
    }
}

fn write(root: &Path, name: &str, lines: impl Iterator<Item = String>) -> Result<()> {
    let path = root.join("etc").join(name);
    let mode = fs::metadata(&path).map(|metadata| metadata.mode() & 0o7777);
    let text: String = lines.map(|line| line + "\n").collect();
    fs::write(&path, text)?;
    if let Ok(mode) = mode {
        fs::set_permissions(&path, fs::Permissions::from_mode(mode))?;
    }
    Ok(())
}

pub struct Seeded {
    users: Database,
    groups: Database,
}

/// Gives the build root the computer's users and groups, without their passwords, so what the
/// packages' scriptlets add gets IDs that are free on the computer.
pub fn seed(root: &Path, users: &BTreeSet<String>, groups: &BTreeSet<String>) -> Result<Seeded> {
    let users = Database::new(load(Path::new("/etc/passwd"))?, users);
    let groups = Database::new(load(Path::new("/etc/group"))?, groups);
    write(root, "passwd", users.seeded.iter().map(Entry::line))?;
    write(root, "group", groups.seeded.iter().map(Entry::line))?;
    write(
        root,
        "shadow",
        users
            .seeded
            .iter()
            .map(|user| format!("{}:!*:::::::", user.name())),
    )?;
    write(
        root,
        "gshadow",
        groups
            .seeded
            .iter()
            .map(|group| format!("{}:!*::", group.name())),
    )?;
    Ok(Seeded { users, groups })
}

/// The users and groups the packages made, with the IDs they get on the computer.
pub struct Made {
    users: Vec<Entry>,
    groups: Vec<Entry>,
    uids: HashMap<u32, u32>,
    gids: HashMap<u32, u32>,
}

pub fn collect(root: &Path, seeded: &Seeded) -> Result<Made> {
    let (groups, gids) = seeded.groups.added(load(&root.join("etc/group"))?);
    let (mut users, uids) = seeded.users.added(load(&root.join("etc/passwd"))?);
    for user in &mut users {
        if let Some(gid) = user.fields[3].parse().ok().and_then(|gid| gids.get(&gid)) {
            user.fields[3] = gid.to_string();
        }
    }
    Ok(Made {
        users,
        groups,
        uids,
        gids,
    })
}

fn quoted(text: &str) -> String {
    if text.is_empty() {
        "-".to_owned()
    } else {
        format!("\"{}\"", text.replace('"', ""))
    }
}

pub fn sysusers(made: &Made, seeded: &Seeded) -> String {
    let mut text = String::new();
    for group in &made.groups {
        text.push_str(&format!("g {} {}\n", group.name(), group.id()));
    }
    for user in &made.users {
        let gid: u32 = user.field(3).parse().unwrap_or_default();
        let group = made
            .groups
            .iter()
            .find(|group| group.id() == gid)
            .map(Entry::name)
            .or_else(|| seeded.groups.name_of(gid))
            .map_or_else(|| gid.to_string(), str::to_owned);
        text.push_str(&format!(
            "u {} {}:{group} {} {} {}\n",
            user.name(),
            user.id(),
            quoted(user.field(4)),
            quoted(user.field(5)),
            quoted(user.field(6)),
        ));
    }
    for group in &made.groups {
        for member in group
            .field(3)
            .split(',')
            .filter(|member| !member.is_empty())
        {
            text.push_str(&format!("m {member} {}\n", group.name()));
        }
    }
    text
}

/// Declares what the packages made with sysusers.d, so the computer makes the same users and
/// groups with the same IDs, and moves the files the build owns to those IDs.
pub fn settle(stage: &Path, made: &Made, seeded: &Seeded) -> Result<()> {
    let text = sysusers(made, seeded);
    if !text.is_empty() {
        let path = stage.join(SYSUSERS);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(&path, text)?;
    }
    if made.uids.is_empty() && made.gids.is_empty() {
        return Ok(());
    }
    for entry in WalkDir::new(stage) {
        let entry = entry?;
        let metadata = entry.path().symlink_metadata()?;
        let (uid, gid) = (
            made.uids.get(&metadata.uid()),
            made.gids.get(&metadata.gid()),
        );
        if uid.is_none() && gid.is_none() {
            continue;
        }
        lchown(entry.path(), uid.copied(), gid.copied())?;
        if !metadata.is_symlink() {
            fs::set_permissions(
                entry.path(),
                fs::Permissions::from_mode(metadata.mode() & 0o7777),
            )?;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn database(text: &str, made: &[&str]) -> Database {
        Database::new(
            read(text),
            &made.iter().map(|name| (*name).to_owned()).collect(),
        )
    }

    #[test]
    fn a_group_made_again_keeps_the_id_it_has_on_the_computer() {
        let groups = database("wheel:x:10:kristof\ndocker:x:975:kristof\n", &["docker"]);
        assert_eq!(groups.seeded[1].name(), "luft-held-975");
        let (added, moved) = groups.added(read(
            "wheel:x:10:kristof\nluft-held-975:x:975:\ndocker:x:974:\nonepassword:x:973:\n",
        ));
        assert_eq!(
            added.iter().map(Entry::name).collect::<Vec<_>>(),
            ["docker", "onepassword"]
        );
        assert_eq!(added[0].id(), 975);
        assert_eq!(moved, HashMap::from([(974, 975)]));
    }

    #[test]
    fn declares_users_with_their_group_and_members() {
        let seeded = Seeded {
            users: database("root:x:0:0:root:/root:/bin/bash\n", &[]),
            groups: database("root:x:0:\n", &[]),
        };
        let made = Made {
            users: read("dockremap:x:972:971:Docker remap:/:/sbin/nologin\n"),
            groups: read("dockremap:x:971:\nonepassword:x:973:dockremap\n"),
            uids: HashMap::new(),
            gids: HashMap::new(),
        };
        assert_eq!(
            sysusers(&made, &seeded),
            "g dockremap 971\ng onepassword 973\n\
             u dockremap 972:dockremap \"Docker remap\" \"/\" \"/sbin/nologin\"\n\
             m dockremap onepassword\n"
        );
    }
}
