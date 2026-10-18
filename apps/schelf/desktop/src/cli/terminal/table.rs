use super::Ink;

const GAP: usize = 2;
const INDENT: &str = "  ";
const ELLIPSIS: char = '…';

#[derive(Clone, Copy)]
pub enum Look {
    Plain,
    Bold,
    Dim,
    Done,
}

pub struct Table {
    looks: Vec<Look>,
    rows: Vec<Vec<String>>,
}

pub fn truncate(text: &str, room: usize) -> String {
    if text.chars().count() <= room {
        return text.to_owned();
    }
    let kept: String = text.chars().take(room.saturating_sub(1)).collect();
    format!("{}{ELLIPSIS}", kept.trim_end())
}

impl Table {
    pub fn new(looks: &[Look]) -> Self {
        Self {
            looks: looks.to_vec(),
            rows: Vec::new(),
        }
    }

    pub fn row(&mut self, cells: Vec<String>) {
        self.rows.push(cells);
    }

    pub fn print(&self, ink: Ink) {
        for line in self.lines(ink) {
            println!("{line}");
        }
    }

    pub fn eprint(&self, ink: Ink) {
        for line in self.lines(ink) {
            eprintln!("{line}");
        }
    }

    fn lines(&self, ink: Ink) -> Vec<String> {
        let columns: Vec<usize> = (0..self.looks.len())
            .filter(|&column| {
                self.rows
                    .iter()
                    .any(|row| row.get(column).is_some_and(|cell| !cell.is_empty()))
            })
            .collect();
        let Some((&last, leading)) = columns.split_last() else {
            return Vec::new();
        };
        let widths: Vec<usize> = (0..self.looks.len())
            .map(|column| {
                self.rows
                    .iter()
                    .map(|row| row.get(column).map_or(0, |cell| cell.chars().count()))
                    .max()
                    .unwrap_or(0)
            })
            .collect();
        let used: usize = INDENT.len()
            + leading
                .iter()
                .map(|&column| widths[column] + GAP)
                .sum::<usize>();
        let room = super::width().saturating_sub(used).max(GAP * 4);
        self.rows
            .iter()
            .map(|row| {
                let mut line = String::from(INDENT);
                for &column in &columns {
                    let cell = row.get(column).map_or("", String::as_str);
                    let padded = if column == last {
                        truncate(cell, room)
                    } else {
                        format!("{cell:<width$}", width = widths[column] + GAP)
                    };
                    let (text, padding) = padded.split_at(padded.trim_end().len());
                    line.push_str(&match self.looks[column] {
                        _ if text.is_empty() => String::new(),
                        Look::Plain => text.to_owned(),
                        Look::Bold => ink.bold(text),
                        Look::Dim => ink.dim(text),
                        Look::Done => ink.done(text),
                    });
                    line.push_str(padding);
                }
                line.trim_end().to_owned()
            })
            .collect()
    }
}
