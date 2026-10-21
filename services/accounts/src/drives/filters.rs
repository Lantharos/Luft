use super::covers;

pub fn keeps(kept: &[String], skipped: &[String], path: &str) -> bool {
    kept.iter().any(|root| covers(root, path)) && !skipped.iter().any(|skip| covers(skip, path))
}

pub fn render(kept: &[String], skipped: &[String]) -> String {
    let mut rules = String::new();
    for skip in skipped {
        let skip = escape(skip);
        rules.push_str(&format!("- /{skip}\n- /{skip}/**\n"));
    }
    for root in kept {
        if root.is_empty() {
            rules.push_str("+ /**\n");
            continue;
        }
        let root = escape(root);
        rules.push_str(&format!("+ /{root}\n+ /{root}/**\n"));
    }
    rules.push_str("- **\n");
    rules
}

pub fn add(kept: &mut Vec<String>, skipped: &mut Vec<String>, path: &str) {
    if keeps(kept, skipped, path) {
        return;
    }
    skipped.retain(|skip| !covers(path, skip) && !covers(skip, path));
    if !kept.iter().any(|root| covers(root, path)) {
        kept.retain(|root| !covers(path, root));
        kept.push(path.to_owned());
    }
}

pub fn remove(kept: &mut Vec<String>, skipped: &mut Vec<String>, path: &str) {
    kept.retain(|root| !covers(path, root));
    skipped.retain(|skip| !covers(path, skip));
    if kept.iter().any(|root| covers(root, path)) {
        skipped.push(path.to_owned());
    }
}

fn escape(path: &str) -> String {
    path.chars().fold(
        String::with_capacity(path.len()),
        |mut escaped, character| {
            if matches!(character, '*' | '?' | '[' | ']' | '{' | '}' | '\\') {
                escaped.push('\\');
            }
            escaped.push(character);
            escaped
        },
    )
}

#[cfg(test)]
mod tests {
    use super::{add, keeps, remove, render};

    #[test]
    fn keeping_and_freeing_nested_paths() {
        let (mut kept, mut skipped) = (Vec::new(), Vec::new());
        add(&mut kept, &mut skipped, "Docs/Old");
        add(&mut kept, &mut skipped, "Docs");
        assert_eq!(kept, ["Docs"]);
        remove(&mut kept, &mut skipped, "Docs/big.iso");
        assert!(!keeps(&kept, &skipped, "Docs/big.iso"));
        assert!(keeps(&kept, &skipped, "Docs/a.txt"));
        add(&mut kept, &mut skipped, "Docs/big.iso");
        assert!(skipped.is_empty() && keeps(&kept, &skipped, "Docs/big.iso"));
        remove(&mut kept, &mut skipped, "Docs");
        assert!(kept.is_empty() && skipped.is_empty());
    }

    #[test]
    fn filters_escape_names() {
        let rules = render(&["Photos [2024]".into()], &["Photos [2024]/raw".into()]);
        assert_eq!(
            rules,
            "- /Photos \\[2024\\]/raw\n- /Photos \\[2024\\]/raw/**\n+ /Photos \\[2024\\]\n+ /Photos \\[2024\\]/**\n- **\n"
        );
    }
}
