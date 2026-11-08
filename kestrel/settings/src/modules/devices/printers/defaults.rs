use std::io;
use std::path::PathBuf;

const DEFAULT: &str = "Default ";
const DESTINATION: &str = "Dest ";

fn path() -> PathBuf {
    glib::home_dir().join(".cups/lpoptions")
}

fn destination(line: &str) -> Option<&str> {
    let rest = line
        .strip_prefix(DEFAULT)
        .or_else(|| line.strip_prefix(DESTINATION))?;
    rest.split_whitespace().next()?.split('/').next()
}

pub async fn chosen() -> Option<String> {
    let options = tokio::fs::read_to_string(path()).await.ok()?;
    options
        .lines()
        .filter(|line| line.starts_with(DEFAULT))
        .find_map(destination)
        .map(str::to_owned)
}

fn with_default(options: &str, printer: &str) -> String {
    let mut lines: Vec<String> = options
        .lines()
        .map(|line| match line.strip_prefix(DEFAULT) {
            Some(rest) => format!("{DESTINATION}{rest}"),
            None => line.to_owned(),
        })
        .collect();
    match lines
        .iter_mut()
        .find(|line| destination(line) == Some(printer))
    {
        Some(line) => *line = format!("{DEFAULT}{}", &line[DESTINATION.len()..]),
        None => lines.push(format!("{DEFAULT}{printer}")),
    }
    lines.join("\n") + "\n"
}

pub async fn choose(printer: &str) -> io::Result<()> {
    let path = path();
    let options = match tokio::fs::read_to_string(&path).await {
        Ok(options) => options,
        Err(error) if error.kind() == io::ErrorKind::NotFound => String::new(),
        Err(error) => return Err(error),
    };
    if let Some(folder) = path.parent() {
        tokio::fs::create_dir_all(folder).await?;
    }
    tokio::fs::write(&path, with_default(&options, printer)).await
}

#[cfg(test)]
mod tests {
    use super::with_default;

    #[test]
    fn moves_the_default_and_keeps_options() {
        let options = "Default Office media=A4\nDest Labels sides=one-sided\n";
        assert_eq!(
            with_default(options, "Labels"),
            "Dest Office media=A4\nDefault Labels sides=one-sided\n"
        );
        assert_eq!(with_default("", "Office"), "Default Office\n");
    }
}
