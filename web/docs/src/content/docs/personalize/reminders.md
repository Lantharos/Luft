---
title: Reminders
description: Birthdays, to-dos and goals in the taskbar, how to add them in plain words, and what happens when you don't answer.
sidebar:
  order: 8
asks:
  - to-do list
  - todo
  - remind me
  - set a reminder
  - { ask: birthday reminder, to: birthdays-and-anniversaries }
  - { ask: anniversary, to: birthdays-and-anniversaries }
  - { ask: recurring reminder, to: adding-a-reminder }
  - { ask: snooze reminder, to: when-it-comes-due }
  - { ask: missed reminder, to: when-it-comes-due }
  - { ask: deadline, to: goals }
  - { ask: import ics, to: calendars }
  - { ask: export reminders, to: calendars }
---

Reminders is an extension from [Schelf](/apps/schelf/). It sits in the taskbar and shows what's next, or how many things are due. Click it, or press Super+Alt+R, to see everything: what's overdue, what's on today, what's coming up, and to-dos with no date.

## Adding a reminder

Type it the way you'd say it, in English, in the field at the top. As you type, Reminders shows what it understood, so you can correct it before pressing Enter.

| You type | You get |
| --- | --- |
| dentist tuesday 3pm | Dentist, next Tuesday at 3 PM |
| mum's birthday 14 march every year | A birthday, each year on 14 March |
| pay rent every month on the 1st | A reminder on the 1st of every month |
| finish thesis by 1 december | A goal with that date |
| standup every weekday at 9 | Monday to Friday at 9 |
| stretch in 30 minutes | Half an hour from now |
| buy stamps | A to-do with no date |

An hour without am or pm is a working hour, so "at 3" means the afternoon and "at 9" the morning. You can also add one from Start: type "dentist friday 4pm" into search and pick **Add reminder**, or search for a reminder you already have.

Click a reminder to snooze it, edit it or delete it. The circle in front of it checks it off, and both can be undone until you close the list. A repeating reminder moves on to its next date when you check it off.

## When it comes due

A notification appears with **Done** and **Snooze**. If you don't press either, it comes back, marked as still waiting and saying how many times it has reminded you, until you do. Dismissing the notification doesn't count as an answer. You can choose how often it comes back in Settings, turn it off for one reminder when you edit it, or turn it off altogether. Coming back pauses while the screen is locked.

During Do Not Disturb or a Focus session, reminders wait and arrive when it's over, and you don't lose any.

If the computer was off or asleep when something came due, it appears the next time you're back, once, marked as missed. A daily reminder that you missed for a week comes back as one, not seven. When several come due at the same moment, they arrive as one notification.

Reminders always use the time on your clock. Something set for 9:00 stays at 9:00 when daylight saving changes and when you travel to another time zone.

Things with only a date, such as birthdays, ring at 9:00, which you can change in Settings.

## Birthdays and anniversaries

Anything with "birthday" or "anniversary" in it repeats every year by itself, and gives you a heads-up three days ahead, to leave time for a card. Say so if you want something else, as in "dad's birthday 2 may, a week before", or change the default in Settings.

## Goals

Say "by" and a date, or start with "goal:", and you have a goal. Once its date passes, the list shows how long it's overdue, and every few days a quiet note in the morning says so too, with a light word of encouragement if you leave **A bit of humour** on. Pressing **Not today** on it leaves you alone until tomorrow. You can pick how often it nudges you in Settings, for each goal when you edit it, or never.

## Calendars

**Settings → Extensions → Reminders** can import an `.ics` file and export your reminders as one, to move them to or from a calendar app. Importing leaves out past events and finished tasks, and importing the same file twice changes nothing. Repeating events keep repeating, and times in other time zones become local time.

Your reminders stay on your computer and are never sent anywhere. Removing the extension deletes them, so export them first if you want to keep them.
