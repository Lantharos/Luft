export type Platform =
	| 'linux-x86_64'
	| 'linux-aarch64'
	| 'windows-x86_64'
	| 'windows-aarch64'
	| 'macos-aarch64'
	| 'macos-x86_64'
	| 'macos-universal'
	| 'android'
	| 'any'
	| 'luft'
	| 'luft-x86_64'
	| 'luft-aarch64';

export type Role = 'owner' | 'admin' | 'developer';
export type Format = 'sabine' | 'appimage' | 'luft-extension' | 'files';
export type Updater = 'sabine' | 'electron' | 'tauri';
export type AppStatus = 'draft' | 'in-review' | 'published' | 'delisted' | 'pulled' | 'deleted';
export type ReleaseStatus =
	| 'uploading'
	| 'checking'
	| 'failed'
	| 'in-review'
	| 'changes-requested'
	| 'rejected'
	| 'rolling-out'
	| 'live'
	| 'withdrawn'
	| 'pulled';
export type CheckName =
	| 'namespace'
	| 'version'
	| 'platforms'
	| 'files'
	| 'attestation'
	| 'listing'
	| 'permissions'
	| 'impersonation'
	| 'extension'
	| 'malware'
	| 'inspection'
	| 'diff'
	| 'licence';

export interface DashboardPublisher {
	id: string;
	kind: 'person' | 'organisation';
	name: string;
	slug: string;
	logo: string | null;
	verified: boolean;
	status: 'active' | 'suspended';
	role: Role;
}

export interface Account {
	user: { id: string; name: string; email: string; image: string | null };
	publishers: DashboardPublisher[];
}

export interface DashboardApp {
	id: string;
	slug: string;
	publisher_slug: string;
	visibility: 'listed' | 'unlisted';
	kind: 'app' | 'extension';
	format: Format;
	name: string;
	icon: string | null;
	status: AppStatus;
	version: string | null;
	release_status: ReleaseStatus | null;
	installs_7d: number;
}

export type Projects = DashboardApp[];

export interface Part {
	files: string[];
	platforms: Platform[];
	format?: 'files' | 'sabine';
	updater?: Updater;
	tool?: string;
}

export interface Privacy {
	telemetry: 'none' | 'opt-in' | 'opt-out';
	ads: boolean;
	ai: 'none' | 'on-device' | 'online';
}

export interface DomainRecord {
	type: 'TXT' | 'CNAME';
	name: string;
	value: string;
}

export interface CustomDomainState {
	domain: string;
	status: 'proving' | 'connecting' | 'active' | 'paused';
	records: DomainRecord[];
	waiting: string | null;
	checked_at: string | null;
}

export type PublisherDomain = CustomDomainState | null;

export type ShortNameState = 'resolves' | 'paused' | 'free' | 'taken' | 'reserved';

export interface ProjectTool {
	name: string;
	part: string | null;
	address: string;
	short: ShortNameState;
	install: string;
	add: string;
}

export interface PublisherTool extends ProjectTool {
	project: string;
	project_name: string;
}

export type PublisherTools = PublisherTool[];

export interface Channel {
	name: string;
	keep: number | null;
	gradual: boolean;
	releases: number;
	ended_into: string | null;
	invite_only: boolean;
}

export interface TrustedPublisher {
	id: string;
	repository: string;
	workflow: string;
	environment: string | null;
}

export interface Project {
	app: DashboardApp & {
		repository: string | null;
		licence: string | null;
		distribution: 'open' | 'proprietary';
		latest_follows_rollout: boolean;
		platforms: Platform[] | null;
		parts: Record<string, Part>;
		tool: string | null;
		privacy: Privacy | null;
		domain: CustomDomainState | null;
		created_at: string;
	};
	tools: ProjectTool[];
	links: { page: string; latest: string; json: string; feeds: { updater: Updater; part: string | null; url: string }[] };
	channels: Channel[];
	trusted_publishers: TrustedPublisher[];
}

export interface ReleaseSummary {
	id: string;
	version: string;
	channel: string;
	origin: 'oidc' | 'manual';
	promoted_from: string | null;
	status: ReleaseStatus;
	rollout_percent: number;
	rollout_paused: boolean;
	platforms: Platform[];
	created_at: string;
	approved_at: string | null;
	approved_by: string | null;
}

export type Releases = ReleaseSummary[];

export interface CheckResult {
	name: CheckName;
	status: 'passed' | 'warning' | 'failed';
	summary: string;
	detail?: unknown;
}

export type TimelineStep =
	| { kind: 'uploaded'; at: string; origin: 'oidc' | 'manual'; run_url: string | null }
	| { kind: 'check'; at: string; check: CheckResult }
	| { kind: 'review'; at: string; decision: string | null; reason: string | null }
	| { kind: 'rollout'; at: string; percent: number; paused: boolean };

export interface Release extends ReleaseSummary {
	notes: string;
	commit: string | null;
	run_url: string | null;
	permissions_widened: boolean;
	shell: { review: 'waiting' | 'approved' | 'refused' | null; runs_in_shell: boolean; reason: string | null; requestable: boolean } | null;
	artifacts: { part: string | null; platform: Platform; name: string; size: number; sha256: string }[];
	checks: CheckResult[];
	timeline: TimelineStep[];
	next: string | null;
}

export interface Promoted {
	release: ReleaseSummary;
}

export interface Stats {
	days: { day: string; installs: number; updates: number }[];
	versions: { version: string; installs: number; updates: number }[];
	platforms: { platform: Platform; installs: number; updates: number }[];
	total: { installs: number; updates: number };
}

export interface ChannelAccess {
	channel: string;
	invites: { id: string; email: string; invited_by: string; created_at: string }[];
	tokens: { id: string; name: string; created_at: string; last_used_at: string | null; revoked_at: string | null }[];
}

export interface Member {
	user_id: string;
	name: string;
	email: string;
	image: string | null;
	role: Role;
	joined_at: string;
}

export interface SentInvite {
	id: string;
	email: string | null;
	github: string | null;
	role: Role;
	invited_by: string | null;
	expires_at: string;
}

export interface Members {
	members: Member[];
	invites: SentInvite[];
}

export interface Namespace {
	prefix: string;
	verified: boolean;
	verified_at: string | null;
}

export type Namespaces = Namespace[];

export type VerificationStatus = 'draft' | 'open' | 'more-requested' | 'approved' | 'rejected' | 'revoked';

export interface VerificationState {
	verified: boolean;
	current: {
		status: VerificationStatus;
		legal_name: string;
		domains: { name: string; proof: string | null }[];
		reason: string | null;
		submitted_at: string | null;
		decided_at: string | null;
	} | null;
}

export interface Approval {
	id: string;
	url: string;
	status: 'pending' | 'done' | 'failed' | 'cancelled' | 'expired';
	steps: { summary: string; outcome: 'done' | 'failed' | null; detail: string | null }[];
	passkey: boolean;
	expires_at: string;
}
