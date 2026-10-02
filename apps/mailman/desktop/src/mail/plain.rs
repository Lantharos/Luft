fn escape(text: &str) -> String {
    let mut escaped = String::with_capacity(text.len());
    for character in text.chars() {
        match character {
            '&' => escaped.push_str("&amp;"),
            '<' => escaped.push_str("&lt;"),
            '>' => escaped.push_str("&gt;"),
            '"' => escaped.push_str("&quot;"),
            _ => escaped.push(character),
        }
    }
    escaped
}

fn linkify(line: &str) -> String {
    let mut linked = String::with_capacity(line.len());
    for (index, word) in line.split(' ').enumerate() {
        if index > 0 {
            linked.push(' ');
        }
        let trimmed = word.trim_end_matches(['.', ',', ')', ';', ':', '!', '?']);
        let tail = &word[trimmed.len()..];
        let target = if trimmed.starts_with("https://") || trimmed.starts_with("http://") {
            Some(trimmed.to_owned())
        } else if trimmed.starts_with("www.") {
            Some(format!("https://{trimmed}"))
        } else if trimmed.contains('@')
            && trimmed.contains('.')
            && !trimmed.starts_with('@')
            && !trimmed.contains(['/', ':'])
        {
            Some(format!(
                "mailto:{}",
                trimmed.trim_start_matches('<').trim_end_matches('>')
            ))
        } else {
            None
        };
        match target {
            Some(target) => linked.push_str(&format!(
                "<a href=\"{}\">{}</a>{}",
                escape(&target),
                escape(trimmed),
                escape(tail)
            )),
            None => linked.push_str(&escape(word)),
        }
    }
    linked
}

fn is_attribution(line: &str) -> bool {
    let line = line.trim();
    (line.starts_with("On ") && line.ends_with("wrote:"))
        || (line.starts_with("Am ") && line.ends_with("schrieb:"))
        || line.starts_with("-----Original Message-----")
}

fn is_signature(line: &str) -> bool {
    line == "-- " || line == "--"
}

pub fn to_html(text: &str) -> String {
    let lines: Vec<&str> = text.lines().collect();
    let mut html = String::from("<div class=\"mm-plain\">");
    let mut quoting = false;
    let mut signed = false;
    for (index, line) in lines.iter().enumerate() {
        if !signed && is_signature(line) {
            if quoting {
                html.push_str("</blockquote>");
                quoting = false;
            }
            html.push_str("<div class=\"mm-signature\">");
            signed = true;
        }
        let quoted = line.starts_with('>');
        let opens_quote = is_attribution(line)
            && lines.get(index + 1..).is_some_and(|rest| {
                rest.iter()
                    .find(|next| !next.trim().is_empty())
                    .is_some_and(|next| next.starts_with('>'))
            });
        if (quoted || opens_quote) && !quoting {
            html.push_str("<blockquote class=\"mm-quote\">");
            quoting = true;
        } else if quoting && !quoted && !line.trim().is_empty() {
            html.push_str("</blockquote>");
            quoting = false;
        }
        let content = if quoted {
            line.trim_start_matches('>').trim_start_matches(' ')
        } else {
            line
        };
        html.push_str(&linkify(content));
        html.push('\n');
    }
    if quoting {
        html.push_str("</blockquote>");
    }
    if signed {
        html.push_str("</div>");
    }
    html.push_str("</div>");
    html
}

pub fn without_quotes(text: &str) -> String {
    let mut fresh = Vec::new();
    for line in text.lines() {
        if is_attribution(line) || is_signature(line) {
            break;
        }
        if !line.starts_with('>') {
            fresh.push(line);
        }
    }
    fresh.join("\n")
}
