use super::sexp::{self, Expr};
use crate::method::definition::{Entry, Method, Rule};

fn head(expression: &Expr) -> Option<(&str, &[Expr])> {
    match expression {
        Expr::List(items) => match items.split_first()? {
            (Expr::Symbol(name), rest) => Some((name.as_str(), rest)),
            _ => None,
        },
        _ => None,
    }
}

fn key(expression: &Expr) -> Option<char> {
    match expression {
        Expr::Character(character) => Some(*character),
        Expr::Number(number) if (0..=9).contains(number) => char::from_digit(*number as u32, 10),
        Expr::Symbol(symbol) => {
            let mut characters = symbol.chars();
            match (characters.next(), characters.next()) {
                (Some(character), None) => Some(character),
                _ => None,
            }
        }
        _ => None,
    }
}

fn keys(expression: &Expr) -> Option<String> {
    match expression {
        Expr::Text(text) => Some(text.clone()),
        Expr::List(items) => items.iter().map(key).collect(),
        _ => None,
    }
}

fn candidates(items: &[Expr]) -> Vec<String> {
    match items {
        [Expr::Text(group)] => group.chars().map(String::from).collect(),
        _ => items
            .iter()
            .flat_map(|item| match item {
                Expr::Text(text) => vec![text.clone()],
                Expr::List(inner) => candidates(inner),
                _ => Vec::new(),
            })
            .collect(),
    }
}

fn entry(expression: &Expr, method: &mut Method) {
    let Expr::List(items) = expression else {
        return;
    };
    let Some((sequence, actions)) = items.split_first() else {
        return;
    };
    let Some(keys) = keys(sequence).filter(|keys| !keys.is_empty()) else {
        return;
    };
    for action in actions {
        match action {
            Expr::Text(text) => {
                method.rules.push(Rule {
                    keys,
                    text: text.clone(),
                    after: String::new(),
                });
                return;
            }
            Expr::Character(character) => {
                method.rules.push(Rule {
                    keys,
                    text: character.to_string(),
                    after: String::new(),
                });
                return;
            }
            Expr::List(items)
                if items
                    .iter()
                    .all(|item| matches!(item, Expr::Text(_) | Expr::List(_))) =>
            {
                method
                    .words
                    .extend(candidates(items).into_iter().map(|text| Entry {
                        keys: keys.clone(),
                        text,
                    }));
                return;
            }
            _ => {}
        }
    }
}

pub fn parse(source: &str, fallback: &str) -> Result<Method, String> {
    let mut method = Method::named(fallback);
    for expression in sexp::parse(source) {
        let Some((name, rest)) = head(&expression) else {
            continue;
        };
        match (name, rest) {
            ("input-method", [language, ..]) => {
                if let Expr::Symbol(language) = language
                    && language != "t"
                {
                    method.language = language.clone();
                }
                if let Some(Expr::Symbol(id)) = rest.get(1) {
                    method.name = id.clone();
                }
            }
            ("title", [Expr::Text(title), ..]) => method.label = title.clone(),
            ("map", maps) => {
                for map in maps {
                    if let Expr::List(definition) = map {
                        definition
                            .iter()
                            .skip(1)
                            .for_each(|item| entry(item, &mut method));
                    }
                }
            }
            _ => {}
        }
    }
    if method.rules.is_empty() && method.words.is_empty() {
        return Err("This file doesn't have any rules Keys can use".into());
    }
    Ok(method)
}
