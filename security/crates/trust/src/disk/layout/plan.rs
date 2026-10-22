use anyhow::{Result, bail, ensure};
use luft_meet::Folder;
use luft_meet::resize::{Change, needed};
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
    pub luks_uuid: Option<String>,
    pub startup: Option<(Span, String)>,
    pub free_before: Option<Span>,
    pub free_after: Option<Span>,
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
    Seal { at: u64 },
    Join { at: u64 },
    Hand { from: u64, to: u64 },
    Leave { at: u64 },
    Retire { at: u64 },
    Delete { at: u64 },
    Grow { at: u64, end: u64 },
    Rename { at: u64, uuid: String },
    Settle { at: u64, uuid: String },
    Discard { at: u64, uuid: String },
    ForgetStartEntry { number: u16 },
    RemoveFolder { folder: Folder },
}

fn align_up(bytes: u64) -> u64 {
    bytes.div_ceil(MIB) * MIB
}

pub fn align_down(bytes: u64) -> u64 {
    bytes / MIB * MIB
}

struct Move {
    root: Span,
    target: u64,
    end: u64,
    need: u64,
    sealed: bool,
}

impl Move {
    fn into(&self, from: u64, to: u64, size: u64) -> Vec<Step> {
        let mut steps = vec![Step::Create { at: to, size }];
        if self.sealed {
            steps.push(Step::Seal { at: to });
        }
        steps.extend([
            Step::Join { at: to },
            Step::Hand { from, to },
            Step::Leave { at: from },
        ]);
        if self.sealed {
            steps.push(Step::Retire { at: from });
        }
        steps.push(Step::Delete { at: from });
        steps
    }

    fn steps(&self) -> Result<Vec<Step>> {
        let (start, end, target, need) =
            (self.root.offset, self.root.end(), self.target, self.need);
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
        let lands_at_the_end = direct && target > start;
        if direct && target < start {
            steps.extend(self.into(start, target, start - target));
        } else if lands_at_the_end {
            steps.push(Step::Shrink {
                at: start,
                size: target - start,
            });
            steps.extend(self.into(start, target, end - target));
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
            steps.extend(self.into(start, middle, end - middle));
            steps.extend(self.into(middle, target, middle - target));
        }
        if !lands_at_the_end || self.end > end {
            steps.push(Step::Grow {
                at: target,
                end: self.end,
            });
        }
        Ok(steps)
    }
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

fn in_place(layout: &Layout, change: Change, need: u64) -> Option<Result<Vec<Step>>> {
    let root = layout.root;
    match change {
        Change::Grow if layout.free_before.is_none() => Some(match layout.free_after {
            Some(after) => Ok(vec![Step::Grow {
                at: root.offset,
                end: after.end(),
            }]),
            None => Err(anyhow::anyhow!("There's no free space next to Luft")),
        }),
        Change::Trim { bytes } => Some(
            root.size
                .checked_sub(bytes)
                .map(align_down)
                .filter(|kept| *kept >= need)
                .map(|size| {
                    vec![Step::Shrink {
                        at: root.offset,
                        size,
                    }]
                })
                .ok_or_else(|| anyhow::anyhow!("Luft wouldn't have room for its files")),
        ),
        Change::Grow | Change::Shrink { .. } => None,
    }
}

pub fn plan(layout: &Layout, change: Change) -> Result<Vec<Step>> {
    let need = needed(layout.allocated);
    if let Some(steps) = in_place(layout, change, need) {
        return steps;
    }
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
        Change::Trim { .. } => unreachable!("trimming happens in place"),
    };
    let end = match change {
        Change::Grow => layout.free_after.map_or(layout.root.end(), Span::end),
        _ => layout.root.end(),
    };
    steps.extend(
        Move {
            root: layout.root,
            target,
            end,
            need,
            sealed: layout.luks_uuid.is_some(),
        }
        .steps()?,
    );
    if let (Change::Shrink { .. }, Some(startup)) = (change, &layout.startup) {
        move_startup(&mut steps, startup, target - startup.0.size);
    }
    steps.push(Step::Rename {
        at: target,
        uuid: layout.root_uuid.clone(),
    });
    if let Some(uuid) = &layout.luks_uuid {
        steps.push(Step::Settle {
            at: target,
            uuid: uuid.clone(),
        });
    }
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
            luks_uuid: None,
            startup: Some((span(100 * GIB, 2 * GIB), "startup".into())),
            free_before,
            free_after: None,
            allocated,
        }
    }

    fn final_root(steps: &[Step]) -> u64 {
        match steps.last() {
            Some(Step::Rename { at, .. } | Step::Settle { at, .. }) => *at,
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

    #[test]
    fn an_encrypted_luft_moves_into_a_copy_that_opens_with_the_same_keys() {
        let mut encrypted = layout(10 * GIB, Some(span(60 * GIB, 40 * GIB)));
        encrypted.luks_uuid = Some("luks".into());
        let steps = plan(&encrypted, Change::Grow).unwrap();
        let seal = steps
            .iter()
            .position(|step| *step == Step::Seal { at: 62 * GIB });
        let join = steps
            .iter()
            .position(|step| *step == Step::Join { at: 62 * GIB });
        let leave = steps
            .iter()
            .position(|step| *step == Step::Leave { at: 102 * GIB });
        let retire = steps
            .iter()
            .position(|step| *step == Step::Retire { at: 102 * GIB });
        assert!(seal < join && leave < retire && seal.is_some() && retire.is_some());
        assert_eq!(
            steps.last(),
            Some(&Step::Settle {
                at: 62 * GIB,
                uuid: "luks".into()
            })
        );
    }

    #[test]
    fn luft_grows_and_shrinks_in_place_at_its_end() {
        let mut alone = layout(10 * GIB, None);
        alone.startup = None;
        alone.free_after = Some(span(202 * GIB, 30 * GIB));
        assert_eq!(
            plan(&alone, Change::Grow).unwrap(),
            [Step::Grow {
                at: 102 * GIB,
                end: 232 * GIB
            }]
        );
        assert_eq!(
            plan(&alone, Change::Trim { bytes: 40 * GIB }).unwrap(),
            [Step::Shrink {
                at: 102 * GIB,
                size: 60 * GIB
            }]
        );
        assert!(plan(&alone, Change::Trim { bytes: 95 * GIB }).is_err());
    }
}
