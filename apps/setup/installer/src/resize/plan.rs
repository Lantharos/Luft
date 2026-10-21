use anyhow::{Result, bail, ensure};
use luft_meet::resize::Change;
use serde::{Deserialize, Serialize};

const MIB: u64 = 1 << 20;
const GIB: u64 = 1 << 30;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub struct Span {
    pub offset: u64,
    pub size: u64,
}

impl Span {
    pub fn end(self) -> u64 {
        self.offset + self.size
    }
}

pub struct Layout {
    pub root: Span,
    pub root_uuid: String,
    pub startup: Option<(Span, String)>,
    pub free_before: Option<Span>,
    pub allocated: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(
    tag = "step",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Step {
    CopyStartup { from: Span, to: Span },
    Shrink { at: u64, size: u64 },
    Create { at: u64, size: u64 },
    Join { at: u64 },
    Hand { from: u64, to: u64 },
    Leave { at: u64 },
    Delete { at: u64 },
    Grow { at: u64, end: u64 },
    Rename { at: u64, uuid: String },
}

pub fn needed(allocated: u64) -> u64 {
    align_up(allocated + allocated / 10 + GIB)
}

fn align_up(bytes: u64) -> u64 {
    bytes.div_ceil(MIB) * MIB
}

fn align_down(bytes: u64) -> u64 {
    bytes / MIB * MIB
}

fn into(from: u64, to: u64, size: u64) -> [Step; 5] {
    [
        Step::Create { at: to, size },
        Step::Join { at: to },
        Step::Hand { from, to },
        Step::Leave { at: from },
        Step::Delete { at: from },
    ]
}

fn relocate(root: Span, target: u64, need: u64) -> Result<Vec<Step>> {
    let (start, end) = (root.offset, root.end());
    ensure!(
        end - target >= need,
        "Luft wouldn't have room for its files"
    );
    let mut steps = Vec::new();
    let direct = if target < start {
        start - target >= need
    } else {
        target - start >= need
    };
    if direct && target < start {
        steps.extend(into(start, target, start - target));
        steps.push(Step::Grow { at: target, end });
    } else if direct {
        steps.push(Step::Shrink {
            at: start,
            size: target - start,
        });
        steps.extend(into(start, target, end - target));
    } else {
        let kept = align_up(need + target.saturating_sub(start));
        let middle = start + kept;
        ensure!(
            end.saturating_sub(middle) >= need,
            "Luft is too full to move this way"
        );
        steps.push(Step::Shrink {
            at: start,
            size: kept,
        });
        steps.extend(into(start, middle, end - middle));
        steps.extend(into(middle, target, middle - target));
        steps.push(Step::Grow { at: target, end });
    }
    Ok(steps)
}

fn move_startup(steps: &mut Vec<Step>, startup: &(Span, String), to: u64) {
    let (from, uuid) = startup;
    let to = Span {
        offset: to,
        size: from.size,
    };
    steps.push(Step::CopyStartup { from: *from, to });
    steps.push(Step::Delete { at: from.offset });
    steps.push(Step::Rename {
        at: to.offset,
        uuid: uuid.clone(),
    });
}

pub fn plan(layout: &Layout, change: Change) -> Result<Vec<Step>> {
    let need = needed(layout.allocated);
    let startup_size = layout.startup.as_ref().map_or(0, |(span, _)| span.size);
    let mut steps = Vec::new();
    let target = match change {
        Change::Grow => {
            let Some(free) = layout.free_before else {
                bail!("There's no free space right before Luft");
            };
            ensure!(
                free.size >= GIB.max(startup_size),
                "The free space is too small"
            );
            let mut target = align_up(free.offset);
            if let Some(startup) = &layout.startup {
                move_startup(&mut steps, startup, target);
                target += startup.0.size;
            }
            target
        }
        Change::Shrink { bytes } => {
            ensure!(
                bytes >= GIB.max(startup_size),
                "That's too little to give back"
            );
            align_down(layout.root.offset + bytes)
        }
    };
    steps.extend(relocate(layout.root, target, need)?);
    if let (Change::Shrink { .. }, Some(startup)) = (change, &layout.startup) {
        move_startup(&mut steps, startup, target - startup.0.size);
    }
    steps.push(Step::Rename {
        at: target,
        uuid: layout.root_uuid.clone(),
    });
    Ok(steps)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn span(offset: u64, size: u64) -> Span {
        Span { offset, size }
    }

    fn layout(allocated: u64, free_before: Option<Span>) -> Layout {
        Layout {
            root: span(102 * GIB, 100 * GIB),
            root_uuid: "root".into(),
            startup: Some((span(100 * GIB, 2 * GIB), "startup".into())),
            free_before,
            allocated,
        }
    }

    fn final_root(steps: &[Step]) -> u64 {
        match steps.last() {
            Some(Step::Rename { at, .. }) => *at,
            _ => panic!("the root keeps its partition's UUID"),
        }
    }

    #[test]
    fn luft_grows_into_space_windows_gave_in_one_move_when_it_fits() {
        let steps = plan(
            &layout(10 * GIB, Some(span(60 * GIB, 40 * GIB))),
            Change::Grow,
        )
        .unwrap();
        assert_eq!(
            steps[..3],
            [
                Step::CopyStartup {
                    from: span(100 * GIB, 2 * GIB),
                    to: span(60 * GIB, 2 * GIB)
                },
                Step::Delete { at: 100 * GIB },
                Step::Rename {
                    at: 60 * GIB,
                    uuid: "startup".into()
                },
            ]
        );
        assert_eq!(
            steps[3],
            Step::Create {
                at: 62 * GIB,
                size: 40 * GIB
            }
        );
        assert!(steps.contains(&Step::Grow {
            at: 62 * GIB,
            end: 202 * GIB
        }));
        assert_eq!(final_root(&steps), 62 * GIB);
        assert!(!steps.iter().any(|step| matches!(step, Step::Shrink { .. })));
    }

    #[test]
    fn a_fuller_luft_moves_twice_to_grow_into_a_little_space() {
        let steps = plan(
            &layout(30 * GIB, Some(span(90 * GIB, 10 * GIB))),
            Change::Grow,
        )
        .unwrap();
        let need = needed(30 * GIB);
        assert!(steps.contains(&Step::Shrink {
            at: 102 * GIB,
            size: need
        }));
        assert!(steps.contains(&Step::Create {
            at: 92 * GIB,
            size: 102 * GIB + need - 92 * GIB
        }));
        assert_eq!(final_root(&steps), 92 * GIB);
    }

    #[test]
    fn giving_space_back_frees_it_right_after_windows() {
        let steps = plan(&layout(20 * GIB, None), Change::Shrink { bytes: 30 * GIB }).unwrap();
        assert_eq!(final_root(&steps), 132 * GIB);
        assert!(steps.contains(&Step::CopyStartup {
            from: span(100 * GIB, 2 * GIB),
            to: span(130 * GIB, 2 * GIB)
        }));
        assert_eq!(
            steps[0],
            Step::Shrink {
                at: 102 * GIB,
                size: 30 * GIB
            }
        );
    }

    #[test]
    fn a_luft_too_full_to_move_is_left_alone() {
        assert!(
            plan(
                &layout(70 * GIB, Some(span(98 * GIB, 2 * GIB))),
                Change::Grow
            )
            .is_err()
        );
        assert!(plan(&layout(60 * GIB, None), Change::Shrink { bytes: 10 * GIB }).is_err());
        assert!(plan(&layout(10 * GIB, None), Change::Shrink { bytes: GIB }).is_err());
    }
}
