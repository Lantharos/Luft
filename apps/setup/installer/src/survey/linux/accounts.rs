use std::collections::HashMap;

const FIRST_UID: u32 = 1000;
const LAST_UID: u32 = 59999;
const ADMIN_GROUPS: [&str; 3] = ["wheel", "sudo", "admin"];
const NO_LOGIN: [&str; 2] = ["nologin", "false"];

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Account {
    pub name: String,
    pub full_name: String,
    pub uid: u32,
    pub gid: u32,
    pub group: String,
    pub home: String,
    pub hash: Option<String>,
    pub admin: bool,
}

fn groups(text: &str) -> Vec<(String, u32, Vec<String>)> {
    text.lines()
        .filter_map(|line| {
            let fields: Vec<&str> = line.split(':').collect();
            Some((
                (*fields.first()?).to_owned(),
                fields.get(2)?.parse().ok()?,
                fields
                    .get(3)
                    .map(|members| {
                        members
                            .split(',')
                            .filter(|member| !member.is_empty())
                            .map(str::to_owned)
                            .collect()
                    })
                    .unwrap_or_default(),
            ))
        })
        .collect()
}

fn hashes(shadow: &str) -> HashMap<&str, &str> {
    shadow
        .lines()
        .filter_map(|line| {
            let mut fields = line.split(':');
            Some((fields.next()?, fields.next()?))
        })
        .collect()
}

pub fn read(passwd: &str, shadow: &str, group: &str) -> Vec<Account> {
    let groups = groups(group);
    let hashes = hashes(shadow);
    let mut accounts: Vec<Account> = passwd
        .lines()
        .filter_map(|line| {
            let fields: Vec<&str> = line.split(':').collect();
            let [name, _, uid, gid, gecos, home, shell] = fields.as_slice() else {
                return None;
            };
            let uid: u32 = uid.parse().ok()?;
            let gid: u32 = gid.parse().ok()?;
            let usable = (FIRST_UID..=LAST_UID).contains(&uid)
                && home.starts_with("/home/")
                && !NO_LOGIN.iter().any(|blocked| shell.ends_with(blocked));
            usable.then(|| Account {
                name: (*name).to_owned(),
                full_name: gecos.split(',').next().unwrap_or_default().to_owned(),
                uid,
                gid,
                group: groups
                    .iter()
                    .find(|(_, id, _)| *id == gid)
                    .map_or_else(|| (*name).to_owned(), |(group, _, _)| group.clone()),
                home: (*home).to_owned(),
                hash: hashes
                    .get(name)
                    .filter(|hash| hash.starts_with('$'))
                    .map(|hash| (*hash).to_owned()),
                admin: groups.iter().any(|(group, _, members)| {
                    ADMIN_GROUPS.contains(&group.as_str())
                        && members.iter().any(|member| member == name)
                }),
            })
        })
        .collect();
    accounts.sort_by_key(|account| account.uid);
    accounts
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn people_keep_their_ids_password_and_admin_rights() {
        let accounts = read(
            "root:x:0:0:root:/root:/bin/bash\nada:x:1000:1000:Ada Lovelace,,,:/home/ada:/bin/bash\ngrace:x:1001:1001::/home/grace:/bin/zsh\nnobody:x:65534:65534::/:/sbin/nologin\nbackup:x:1002:1002::/home/backup:/usr/sbin/nologin\n",
            "ada:$y$j9T$abc:19000::::::\ngrace:!:19000::::::\n",
            "wheel:x:10:ada\nada:x:1000:\ngrace:x:1001:\n",
        );
        assert_eq!(accounts.len(), 2);
        assert_eq!(accounts[0].full_name, "Ada Lovelace");
        assert_eq!(accounts[0].hash.as_deref(), Some("$y$j9T$abc"));
        assert!(accounts[0].admin);
        assert_eq!(accounts[1].hash, None);
        assert!(!accounts[1].admin);
        assert_eq!(accounts[1].group, "grace");
    }
}
