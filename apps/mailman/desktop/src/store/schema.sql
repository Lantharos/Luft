PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS accounts (
	id INTEGER PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	config TEXT NOT NULL,
	signature TEXT NOT NULL DEFAULT '',
	added INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS mailboxes (
	id INTEGER PRIMARY KEY,
	account INTEGER NOT NULL REFERENCES accounts ON DELETE CASCADE,
	remote TEXT NOT NULL,
	name TEXT NOT NULL,
	role TEXT,
	selectable INTEGER NOT NULL DEFAULT 1,
	validity INTEGER,
	modseq INTEGER,
	state TEXT,
	UNIQUE (account, remote)
);

CREATE TABLE IF NOT EXISTS messages (
	id INTEGER PRIMARY KEY,
	account INTEGER NOT NULL REFERENCES accounts ON DELETE CASCADE,
	mailbox INTEGER NOT NULL REFERENCES mailboxes ON DELETE CASCADE,
	remote TEXT NOT NULL,
	message_id TEXT,
	thread INTEGER NOT NULL DEFAULT 0,
	in_reply_to TEXT,
	refs TEXT NOT NULL DEFAULT '',
	subject TEXT NOT NULL DEFAULT '',
	sender_name TEXT NOT NULL DEFAULT '',
	sender TEXT NOT NULL DEFAULT '',
	recipients TEXT NOT NULL DEFAULT '[]',
	date INTEGER NOT NULL,
	snippet TEXT NOT NULL DEFAULT '',
	seen INTEGER NOT NULL DEFAULT 0,
	flagged INTEGER NOT NULL DEFAULT 0,
	answered INTEGER NOT NULL DEFAULT 0,
	draft INTEGER NOT NULL DEFAULT 0,
	attachments INTEGER NOT NULL DEFAULT 0,
	size INTEGER NOT NULL DEFAULT 0,
	category TEXT NOT NULL DEFAULT 'primary',
	unsubscribe TEXT,
	snoozed_until INTEGER,
	remind_at INTEGER,
	UNIQUE (mailbox, remote)
);

CREATE INDEX IF NOT EXISTS messages_by_mailbox ON messages (mailbox, date DESC);
CREATE INDEX IF NOT EXISTS messages_by_thread ON messages (thread, date);
CREATE INDEX IF NOT EXISTS messages_by_message_id ON messages (message_id);
CREATE INDEX IF NOT EXISTS messages_by_sender ON messages (sender);
CREATE INDEX IF NOT EXISTS messages_snoozed ON messages (snoozed_until) WHERE snoozed_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS messages_reminders ON messages (remind_at) WHERE remind_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS bodies (
	message INTEGER PRIMARY KEY REFERENCES messages ON DELETE CASCADE,
	raw BLOB NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS search USING fts5 (subject, people, body, tokenize = 'unicode61 remove_diacritics 2');

CREATE TRIGGER IF NOT EXISTS messages_forget_search AFTER DELETE ON messages BEGIN
	DELETE FROM search WHERE rowid = old.id;
END;

CREATE TABLE IF NOT EXISTS senders (
	address TEXT PRIMARY KEY,
	verdict TEXT NOT NULL,
	images INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS outbox (
	id INTEGER PRIMARY KEY,
	account INTEGER NOT NULL REFERENCES accounts ON DELETE CASCADE,
	raw BLOB NOT NULL,
	sender TEXT NOT NULL,
	recipients TEXT NOT NULL,
	draft TEXT NOT NULL,
	send_at INTEGER NOT NULL,
	remind_at INTEGER,
	error TEXT
);

CREATE TABLE IF NOT EXISTS reminders (
	message_id TEXT PRIMARY KEY,
	account INTEGER NOT NULL REFERENCES accounts ON DELETE CASCADE,
	subject TEXT NOT NULL,
	remind_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS operations (
	id INTEGER PRIMARY KEY,
	account INTEGER NOT NULL REFERENCES accounts ON DELETE CASCADE,
	operation TEXT NOT NULL,
	attempts INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS templates (
	id INTEGER PRIMARY KEY,
	name TEXT NOT NULL,
	body TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL
);
