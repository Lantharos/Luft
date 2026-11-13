use serde::Serialize;

/// Prints `value` the way `JSON.stringify(value, null, 2)` does, keeping the
/// order of keys in JSON that came from the store as it was.
pub fn pretty(value: &impl Serialize) -> String {
    let compact = serde_json::to_string(value).expect("values the CLI emits serialise");
    indent(&compact)
}

fn indent(compact: &str) -> String {
    let mut out = String::with_capacity(compact.len() * 2);
    let mut depth = 0usize;
    let mut chars = compact.chars().peekable();
    let newline = |out: &mut String, depth: usize| {
        out.push('\n');
        out.push_str(&"  ".repeat(depth));
    };
    while let Some(character) = chars.next() {
        match character {
            '"' => {
                out.push('"');
                while let Some(inner) = chars.next() {
                    out.push(inner);
                    match inner {
                        '\\' => out.extend(chars.next()),
                        '"' => break,
                        _ => {}
                    }
                }
            }
            '{' | '[' => {
                let closing = if character == '{' { '}' } else { ']' };
                if chars.peek() == Some(&closing) {
                    chars.next();
                    out.push(character);
                    out.push(closing);
                } else {
                    out.push(character);
                    depth += 1;
                    newline(&mut out, depth);
                }
            }
            '}' | ']' => {
                depth -= 1;
                newline(&mut out, depth);
                out.push(character);
            }
            ',' => {
                out.push(',');
                newline(&mut out, depth);
            }
            ':' => out.push_str(": "),
            ' ' | '\n' | '\r' | '\t' => {}
            other => out.push(other),
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::value::RawValue;

    #[test]
    fn keeps_the_order_and_shape_of_javascript() {
        let raw = RawValue::from_string(r#"{"b":1,"a":[],"c":{},"d":["x, y",{"e":"\"}"}]}"#.into())
            .unwrap();
        assert_eq!(
            pretty(&raw),
            "{\n  \"b\": 1,\n  \"a\": [],\n  \"c\": {},\n  \"d\": [\n    \"x, y\",\n    {\n      \"e\": \"\\\"}\"\n    }\n  ]\n}"
        );
    }
}
