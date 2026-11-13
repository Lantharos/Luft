use std::collections::HashMap;

use super::ImapRemote;
use crate::mail::envelope;
use crate::protocols::imap::uid_set;

impl ImapRemote {
    pub(super) fn move_messages(
        &mut self,
        source: &str,
        target: &str,
        uids: &[u32],
    ) -> Result<HashMap<u32, u32>, String> {
        if self.client.has("UIDPLUS") {
            self.select(source)?;
            return Ok(self
                .client
                .move_messages(uids, target)?
                .into_iter()
                .collect());
        }
        let first_new = self.client.select(target, None, false)?.uidnext;
        self.selected = Some(target.to_owned());
        self.select(source)?;
        let departing = self.unique_message_ids(&uid_set(uids), 0)?;
        let mut moved: HashMap<u32, u32> = self
            .client
            .move_messages(uids, target)?
            .into_iter()
            .collect();
        if departing.keys().all(|uid| moved.contains_key(uid)) {
            return Ok(moved);
        }
        self.select(target)?;
        let arrived: HashMap<String, u32> = self
            .unique_message_ids(&format!("{first_new}:*"), first_new)?
            .into_iter()
            .map(|(uid, message_id)| (message_id, uid))
            .collect();
        for (uid, message_id) in departing {
            if let Some(&new) = arrived.get(&message_id) {
                moved.entry(uid).or_insert(new);
            }
        }
        Ok(moved)
    }

    fn unique_message_ids(
        &mut self,
        set: &str,
        lowest: u32,
    ) -> Result<HashMap<u32, String>, String> {
        let found: Vec<(u32, String)> = self
            .client
            .fetch_headers(set)?
            .into_iter()
            .filter(|header| header.uid >= lowest)
            .filter_map(|header| Some((header.uid, envelope::parse(&header.raw).message_id?)))
            .collect();
        let mut seen: HashMap<&str, usize> = HashMap::new();
        for (_, message_id) in &found {
            *seen.entry(message_id).or_default() += 1;
        }
        Ok(found
            .iter()
            .filter(|(_, message_id)| seen[message_id.as_str()] == 1)
            .cloned()
            .collect())
    }
}
