use std::path::Path;

use luft_policy::{Explained, Policy};
use serde_json::json;

use crate::cli::PolicyAction;
use crate::failure::{Failure, Outcome};
use crate::output::{Output, table};

pub fn run(action: Option<PolicyAction>, output: Output) -> Outcome {
    match action {
        None => show(&Policy::explain(), output),
        Some(PolicyAction::Check { file }) => check(&file, output),
    }
}

fn show(explained: &Explained, output: Output) -> Outcome {
    let decided: Vec<_> = explained
        .decided
        .iter()
        .map(|decided| json!({ "key": decided.key, "value": decided.value, "file": decided.file }))
        .collect();
    let left_out: Vec<_> = explained
        .left_out
        .iter()
        .map(|(file, problems)| json!({ "file": file, "problems": problems }))
        .collect();
    output.show(&json!({ "decided": decided, "leftOut": left_out }), || {
        words(explained)
    })
}

fn words(explained: &Explained) -> String {
    let mut text = if explained.decided.is_empty() {
        "No policy decides any setting on this computer.\n".to_owned()
    } else {
        let keys: Vec<String> = explained
            .decided
            .iter()
            .map(|decided| format!("{} = {}", decided.key, decided.value))
            .collect();
        table(
            keys.iter()
                .zip(&explained.decided)
                .map(|(key, decided)| (key.as_str(), decided.file.display().to_string())),
        )
    };
    for (file, problems) in &explained.left_out {
        text.push_str(&format!("\nLeft out {}:\n", file.display()));
        for problem in problems {
            text.push_str(&format!("  {problem}\n"));
        }
    }
    text
}

fn check(file: &Path, output: Output) -> Outcome {
    let text = std::fs::read_to_string(file)
        .map_err(|error| Failure::failed(format!("Couldn't read {}: {error}", file.display())))?;
    match luft_policy::check(&text) {
        Ok(_) => output.show(&json!({ "file": file, "problems": [] }), || {
            format!("{} reads as policy.", file.display())
        }),
        Err(problems) => Err(Failure::invalid(format!(
            "{} would be left out:\n{}",
            file.display(),
            problems
                .iter()
                .map(|problem| format!("  {problem}"))
                .collect::<Vec<_>>()
                .join("\n")
        ))),
    }
}
