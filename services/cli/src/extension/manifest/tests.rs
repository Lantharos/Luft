use super::parse;

const PULT: &str = r#"
id = "com.lantharos.Pult"
name = "Pult"
version = "1.0.0"
api = 1
permissions = ["taskbar", "popups", "notifications", "search"]

[network]
hosts = ["app.pult.sh"]

[[settings]]
key = "count"
type = "choice"
label = "count"
default = "open"
options = [
  { value = "open", label = "count-open" },
  { value = "unread", label = "count-unread" },
]

[luft]
minimum = "1.0-nightly.27"
"#;

fn with(extra: &str) -> String {
    format!("id = \"com.example.Hello\"\nname = \"Hello\"\nversion = \"1.0.0\"\napi = 1\n{extra}")
}

#[test]
fn reads_a_manifest_from_the_store() {
    let manifest = parse(PULT).unwrap();
    assert_eq!(manifest.id, "com.lantharos.Pult");
    assert_eq!(manifest.minimum.as_deref(), Some("1.0-nightly.27"));
    assert!(manifest.labels.contains(&"count-open".to_owned()));
}

#[test]
fn refuses_what_kestrel_refuses_in_its_words() {
    for (extra, reason) in [
        (
            "permissions = [\"keylogger\"]",
            "it asks for an unknown permission, keylogger",
        ),
        (
            "permissions = [\"locked-sounds\"]",
            "locked-sounds needs the sounds permission too",
        ),
        (
            "permissions = [\"sounds\", \"input-sounds\", \"audio-levels\"]",
            "input-sounds can't go with the audio-levels permission",
        ),
        (
            "[helper]\npath = \"../escape\"",
            "helper.path must stay inside the extension",
        ),
        (
            "[network]\nhosts = []",
            "network names neither hosts nor ports to listen on",
        ),
        (
            "[network]\nhosts = [\"Example.com\"]",
            "network.hosts[0] must be a host name such as api.example.com",
        ),
        (
            "[[network.listen]]\nport = 8080\nprotocol = \"tcp\"\n[[network.listen]]\nport = 8080\nprotocol = \"tcp\"",
            "network.listen names a port twice",
        ),
        (
            "[luft]\nminimum = \"next\"",
            "luft.minimum must be a version of Luft, such as 1.2 or 1.2-nightly.21",
        ),
        (
            "[[settings]]\nkey = \"loud\"\ntype = \"switch\"\nlabel = \"loud\"\ndefault = \"yes\"",
            "settings[0].default doesn't fit the setting",
        ),
        (
            "[[settings]]\nkey = \"level\"\ntype = \"slider\"\nlabel = \"level\"\nmin = 5\nmax = 1\ndefault = 3",
            "settings[0].min must be below max",
        ),
        (
            "[[settings]]\nkey = \"a\"\ntype = \"switch\"\nlabel = \"a\"\ndefault = true\n[[settings]]\nkey = \"b\"\ntype = \"switch\"\nlabel = \"b\"\ndefault = true\ndepends = \"c\"",
            "b depends on c, which isn't declared before it",
        ),
        (
            "[[settings]]\nkey = \"art\"\ntype = \"switch\"\nlabel = \"art\"\ndefault = true\npage = \"appearance\"",
            "settings[0] shows on the appearance page, which needs the wallpaper permission",
        ),
    ] {
        assert_eq!(parse(&with(extra)), Err(reason.to_owned()), "{extra}");
    }
    assert_eq!(
        parse("id = \"hello\"\nname = \"Hello\"\nversion = \"1\"\napi = 1"),
        Err("manifest.id is missing or malformed".to_owned())
    );
    assert_eq!(
        parse("id = \"com.example.Hello\"\napi = 2"),
        Err("it targets extension API 2, which this Kestrel doesn't support".to_owned())
    );
}

#[test]
fn takes_settings_that_depend_on_others() {
    let manifest = with(
        "permissions = [\"taskbar\"]\n[[settings]]\nkey = \"show\"\ntype = \"switch\"\nlabel = \"show\"\ndefault = true\n[[settings]]\nkey = \"size\"\ntype = \"slider\"\nlabel = \"size\"\nmin = 1\nmax = 10\ndefault = 4\ndepends = \"show\"\n[[settings]]\nkey = \"badge\"\ntype = \"switch\"\nlabel = \"badge\"\ndefault = false\ndepends = \"size\"\nwhen = { min = 5 }",
    );
    assert!(parse(&manifest).is_ok());
}

#[test]
fn leaves_out_what_the_desktop_says_a_sandbox_leaves_out() {
    let source = include_str!("../../../../../kestrel/ui/src/extensions/sandbox/leavesOut.ts");
    let list = source
        .split_once("SANDBOX_LEAVES_OUT")
        .and_then(|(_, rest)| rest.split_once("= ["))
        .and_then(|(_, rest)| rest.split_once(']'))
        .map(|(list, _)| list)
        .unwrap();
    let from_desktop: Vec<&str> = list
        .split(',')
        .map(|name| name.trim().trim_matches('\''))
        .filter(|name| *name != "listen")
        .collect();
    assert_eq!(from_desktop, super::IN_DESKTOP_ONLY);
}
