use std::iter::Peekable;
use std::str::Chars;

#[derive(Debug, Clone, PartialEq)]
pub enum Expr {
    List(Vec<Expr>),
    Text(String),
    Character(char),
    Symbol(String),
    Number(i64),
}

fn escaped(characters: &mut Peekable<Chars>) -> Option<char> {
    match characters.next()? {
        'n' => Some('\n'),
        't' => Some('\t'),
        'e' => Some('\u{1b}'),
        other => Some(other),
    }
}

fn text(characters: &mut Peekable<Chars>) -> String {
    let mut text = String::new();
    while let Some(character) = characters.next() {
        match character {
            '"' => break,
            '\\' => text.extend(escaped(characters)),
            other => text.push(other),
        }
    }
    text
}

fn atom(first: char, characters: &mut Peekable<Chars>) -> Expr {
    let mut atom = String::new();
    let mut next = Some(first);
    while let Some(character) = next {
        if character == '\\' {
            atom.extend(escaped(characters));
        } else {
            atom.push(character);
        }
        next = characters.next_if(|character| {
            !character.is_whitespace() && !matches!(character, '(' | ')' | '"' | ';')
        });
    }
    atom.parse().map_or(Expr::Symbol(atom), Expr::Number)
}

fn skip(characters: &mut Peekable<Chars>) {
    while let Some(&character) = characters.peek() {
        if character == ';' {
            while characters.next_if(|character| *character != '\n').is_some() {}
        } else if character.is_whitespace() {
            characters.next();
        } else {
            break;
        }
    }
}

fn expression(characters: &mut Peekable<Chars>) -> Option<Expr> {
    skip(characters);
    match characters.next()? {
        '(' => {
            let mut items = Vec::new();
            loop {
                skip(characters);
                if characters.next_if_eq(&')').is_some() || characters.peek().is_none() {
                    return Some(Expr::List(items));
                }
                items.extend(expression(characters));
            }
        }
        ')' => expression(characters),
        '"' => Some(Expr::Text(text(characters))),
        '?' => {
            let character = match characters.next()? {
                '\\' => escaped(characters)?,
                other => other,
            };
            Some(Expr::Character(character))
        }
        first => Some(atom(first, characters)),
    }
}

pub fn parse(source: &str) -> Vec<Expr> {
    let mut characters = source.chars().peekable();
    let mut expressions = Vec::new();
    while let Some(expression) = expression(&mut characters) {
        expressions.push(expression);
    }
    expressions
}
