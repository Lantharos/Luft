## Shared by the pages for people who publish on schelf.store

developer-cancel = Cancel
developer-done = Done
developer-try-again = Try again
# Button that opens a list, such as the people on a channel or every check that passed
developer-show = Show
# Button that sends an invitation
developer-invite = Invite
developer-invite-someone = Invite someone
developer-nothing-yet = Nothing yet
developer-not-proven = Not proven yet
developer-copy-link = Copy the link
developer-copied = Copied
developer-offline-cached = Offline, showing what { -schelf } read last
developer-problem-offline = You're offline, or schelf.store couldn't be reached.
developer-problem-signed-out = Your schelf.store sign-in ended.
developer-invite-only = Invite only
# Button that goes from the publishing pages back to the store
developer-back-to-store = Back to the store

## A release's state

developer-status-uploading = Uploading
developer-status-checking = Checking
developer-status-failed = Needs a fix
developer-status-in-review = In review
developer-status-changes-requested = Changes requested
developer-status-rejected = Rejected
developer-status-rolling-out = Rolling out
developer-status-live = Live
developer-status-withdrawn = Withdrawn
developer-status-pulled = Stopped by { -schelf }

## The checks schelf.store runs on every release

developer-check-namespace = Namespace
developer-check-version = Version
developer-check-platforms = Systems
developer-check-files = Files
developer-check-attestation = Build provenance
developer-check-listing = Listing
developer-check-permissions = Permissions
developer-check-impersonation = Name and icon
developer-check-extension = Extension manifest
developer-check-malware = Malware scan
developer-check-inspection = What the app can do
developer-check-diff = Source changes
developer-check-licence = Licence

## Systems a release's files are made for

developer-platform-linux = Linux
developer-platform-linux-arm = Linux on Arm
developer-platform-windows = Windows
developer-platform-windows-arm = Windows on Arm
developer-platform-macos-apple = macOS on Apple silicon
developer-platform-macos-intel = macOS on Intel
developer-platform-macos = macOS
developer-platform-android = Android
developer-platform-any = Any system
developer-platform-luft = { -luft }
developer-platform-luft-arm = { -luft } on Arm

## How far a release has reached; $percent is already formatted, such as 40%

developer-rollout-everyone = Everyone has it
developer-rollout-paused = Paused at { $percent }
developer-rollout-share = { $percent } of people

## Approving something in the browser

developer-approval-done = Approved and done.
developer-approval-failed = Approved, but not everything happened.
developer-approval-cancelled = The request was cancelled.
developer-approval-expired = The request ran out before it was approved.
developer-approval-passkey = Approve it in your browser with your passkey.
developer-approval-browser = Approve it in your browser.
developer-approval-open-again = Open the page again

## The sidebar and the publisher's pages

developer-page-tools = Command-line tools
developer-page-members = Members
developer-page-verification = Verification
developer-page-domain = Download domain

## A project's tabs

developer-tabs-label = Project
developer-tab-overview = Overview
developer-tab-releases = Releases
developer-tab-stats = Stats
developer-tab-channels = Channels
developer-tab-people = People
developer-tab-files = Files

## A download domain

developer-domain-proving = Waiting for the TXT record
developer-domain-connecting = Connecting
developer-domain-active = Serving download links
developer-domain-paused = Paused
# $when is how long ago, such as 5 minutes ago
developer-domain-checked = checked { $when }
# $type is TXT or CNAME, $name the name the record goes under
developer-domain-record = { $type } record for { $name }
developer-domain-copy-value = Copy the value
developer-domain-check-again = Check again
developer-domain-checked-again = Checked the domain again
developer-domain-default = Download links are on dl.schelf.store
developer-domain-use = Use a domain
# $domain is the publisher's own domain, such as get.example.com
developer-domain-stop-using = Stop using { $domain }
developer-domain-stop = Stop
developer-domain-serve = Serve downloads on { $domain }
developer-domain-stop-serving = Stop serving downloads on your domain
developer-domain-dialog-title = Use your own domain
developer-domain-dialog-description = One under a domain you own, like get.example.com.
developer-domain-field = Domain
developer-domain-placeholder = get.example.com
developer-domain-continue = Continue

## A project's overview

developer-overview-latest = Latest release
# $version is the release's version, $channel the channel it's on
developer-overview-latest-on = { $version } on { $channel }
# $date is a date, such as 3 March 2026
developer-overview-published = Published { $date }
developer-overview-each-channel = On each channel
# $rollout says how far it reached, such as 40% of people
developer-overview-channel-live = { $version } · { $rollout }
# $channel is the channel the people on an ended channel were moved to
developer-overview-channel-ended = Ended, its people moved to { $channel }
developer-overview-channel-empty = Nothing reached anyone yet
developer-overview-project = Project
developer-overview-installs-week = Installs this week
# The project's page on schelf.store
developer-overview-page = Page
# Opens the project's page in the browser
developer-overview-open = Open
developer-overview-visibility = Visibility
developer-overview-listed = Listed
developer-overview-unlisted = Unlisted
developer-overview-source = Source
developer-overview-visit = Visit
developer-overview-publishes-from = Publishes from
# $repository is a GitHub repository and $workflow a workflow file in it
developer-overview-workflow = { $repository }, { $workflow }
# $environment is the GitHub environment the workflow publishes from
developer-overview-workflow-environment = { $repository }, { $workflow }, { $environment }
developer-overview-licence = Licence
developer-overview-privacy = Privacy
# $telemetry is none, opt-in or opt-out, $ads yes or no, $ai none, on-device or online
developer-overview-privacy-facts = { $telemetry ->
    [opt-in] Usage data if people turn it on
    [opt-out] Usage data unless people turn it off
   *[none] No usage data
}, { $ads ->
    [yes] shows ads
   *[no] no ads
}, { $ai ->
    [on-device] AI on the computer
    [online] online AI features
   *[none] no AI features
}

## A project's releases

developer-releases-every-channel = Every channel
developer-releases-channel = Channel
# $channel is the channel's name and $date when it was published; $promoted is yes when it was offered on this channel after another
developer-releases-facts = { $promoted ->
    [yes] { $channel } · { $date } · promoted
   *[no] { $channel } · { $date }
}
developer-releases-empty = Releases appear here once the publish workflow sends one.

## A project's stats

# $count is a number of days
developer-stats-days = { $count ->
    [one] { $count } day
   *[other] { $count } days
}
developer-stats-period = Period
developer-stats-measure = Measure
# What people did with a project that's a set of files to download
developer-stats-downloads = Downloads
developer-stats-installs = Installs
developer-stats-updates = Updates
developer-stats-busiest = On the busiest day
developer-stats-by-version = By version
developer-stats-by-system = By system
# $downloads is yes for a project people download instead of install
developer-stats-chart = { $downloads ->
    [yes] Downloads and updates each day
   *[no] Installs and updates each day
}
# Read out for a day on the chart; $date is the day, $installs and $updates how many
developer-stats-chart-day = { $downloads ->
    [yes] { $date }: { $installs ->
        [one] { $installs } download
       *[other] { $installs } downloads
    }, { $updates ->
        [one] { $updates } update
       *[other] { $updates } updates
    }
   *[no] { $date }: { $installs ->
        [one] { $installs } install
       *[other] { $installs } installs
    }, { $updates ->
        [one] { $updates } update
       *[other] { $updates } updates
    }
}

## A project's channels

# $keep is how many releases the channel keeps, 0 when it keeps all; $ended is the channel it ended into, or nothing
developer-channels-facts = { $gradual ->
    [yes] Reaches people step by step
   *[no] Reaches everyone at once
}{ $keep ->
    [0] {""}
   *[other] , keeps the last { $keep }
}{ $ended ->
    [yes] , ended into { $endedInto }
   *[no] {""}
}
developer-channels-people = People
developer-channels-where = Channels are set under [channels] in schelf.toml.

## People on an invite-only channel

# $by is who sent the invitation and $date when
developer-people-invited-by = Invited by { $by }, { $date }
developer-people-remove = Remove
developer-people-nobody = Nobody yet
developer-people-tokens = Download tokens
developer-people-last-used = Last used { $date }
developer-people-not-used = Not used yet
developer-people-revoke = Revoke
# $name is the download token's name
developer-people-revoke-title = Revoke { $name }?
developer-people-revoke-description = Anything using it stops getting this channel.
developer-people-revoked = { $name } no longer works
# $name is the invited person's email
developer-people-remove-title = Remove { $name }?
developer-people-remove-description = They keep what they installed and go back to public releases.
developer-people-removed = { $name } can't download it any more
# $channel is the channel's name
developer-people-invite-title = Invite to { $channel }
developer-people-invite-description = schelf.store emails them, and you approve it in your browser first.
developer-people-email = Email
developer-people-email-placeholder = name@example.com
# $email is who is invited; the title of the approval in the browser
developer-people-invite-approval = Invite { $email }

## A project's files and links

developer-files-parts = Parts
# $files are the part's file names, $systems the systems they're for
developer-files-part = { $files } · { $systems }
# $tool is the command the part installs
developer-files-installs = Installs { $tool }
developer-files-systems = Systems
developer-files-links = Download links
developer-files-newest = Newest release
developer-files-json = As JSON
developer-files-feed = Update feed
# $part is the name of one part of the project
developer-files-feed-part = Update feed for { $part }

## Command-line tools

developer-tools-short-resolves = Installs by its short name too
developer-tools-short-paused = Its short name works again once the publisher is verified
developer-tools-short-free = Its short name is free to claim
developer-tools-short-taken = Its short name belongs to another publisher
developer-tools-short-reserved = Its short name is kept for the system
# $address is the tool's full address and $short one of the lines about its short name
developer-tools-facts = { $address } · { $short }
developer-tools-copy-install = Copy the install line
developer-tools-copy-schelf = Copy the schelf line
# $project is the project the tool comes with and $part the part of it that's the tool
developer-tools-part = { $project }, its { $part } part
developer-tools-empty = A part with tool = "name" in its schelf.toml makes it a command-line tool.

## A publisher's members

developer-role-owner = Owner
developer-role-admin = Admin
developer-role-developer = Developer
developer-members-role = Role
# $email is the member's email and $date when they joined
developer-members-since = { $email } · since { $date }
# $name is the member's name
developer-members-more = More for { $name }
# $role is admin or developer
developer-members-make = { $role ->
    [admin] Make admin
   *[developer] Make developer
}
developer-members-make-approval = { $role ->
    [admin] Make { $name } admin
   *[developer] Make { $name } developer
}
developer-members-remove = Remove
developer-members-remove-approval = Remove { $name }
developer-members-invited = Invited
# $role is the role they're invited as, $date when the invitation ends, $by who sent it
developer-members-invite-facts = { $role }, until { $date }
developer-members-invite-facts-by = { $role }, until { $date }, from { $by }
developer-members-take-back = Take back
# $who is the invited person's email or GitHub username
developer-members-take-back-title = Take back { $who }'s invitation?
developer-members-take-back-description = The link in their email stops working.
developer-members-taken-back = Took back { $who }'s invitation
# $publisher is the publisher's name
developer-members-invite-title = Invite to { $publisher }
developer-members-who = Email or GitHub username
developer-members-who-placeholder = name@example.com or @username
developer-members-invite-approval = Invite { $who }

## A publisher's verification

developer-verification-draft = Started, not sent yet
developer-verification-open = Waiting for a reviewer
developer-verification-more-requested = The reviewer asked for more
developer-verification-approved = Approved
developer-verification-rejected = Turned down
developer-verification-revoked = Taken back
# $status is one of the lines above and $date when it was decided
developer-verification-decided = { $status } { $date }
developer-verification-gives-mark = A check mark next to its name on every page
developer-verification-gives-short = Short tool names, like sch add lumi
developer-verification-gives-extensions = Extensions that may run inside { -luft }
developer-verification-gives-domain = Download links on its own domain
# $publisher is the publisher's name
developer-verification-verified = { $publisher } is verified
developer-verification-unverified = { $publisher } isn't verified
developer-verification-open-browser = Open in the browser
developer-verification-continue-browser = Continue in the browser
developer-verification-start-browser = Start in the browser
developer-verification-reason = The reviewer's reason
developer-verification-legal-name = Legal name
# $proof is well-known, dns or namespace
developer-verification-proven-by = { $proof ->
    [well-known] Proven by a file on the website
    [dns] Proven by a DNS record
   *[namespace] Proven by a namespace
}
developer-verification-gives = What it gives
developer-verification-would-give = What it would give
developer-verification-namespaces = Namespaces
# $date is when the namespace was proven
developer-verification-proven-on = Proven { $date }
developer-verification-proven = Proven

## A release

developer-release-why-review = Why it went to review
# $check is a check's name and $summary what it found
developer-release-reason = { $check }: { $summary }
# $decision is what the reviewer decided, such as approved
developer-release-reviewed = Reviewed: { $decision }
developer-release-waiting = Waiting for a reviewer
# $channel is the channel's name
developer-release-on = On { $channel }
# $date is when it was published and $by who approved it
developer-release-published-approved = Published { $date }, approved by { $by }
developer-release-offer-other = Offer on another channel
developer-release-built = Built on GitHub Actions
developer-release-by-hand = Uploaded by hand
# $commit is the short commit hash it was built from
developer-release-commit = At { $commit }
developer-release-see-build = See the build
developer-release-inside-luft = Run inside { -luft }
developer-release-ask = Ask
# $version is the release's version
developer-release-inside-luft-approval = Run { $version } inside { -luft }
developer-release-rollout = Rollout
developer-release-notes = Release notes
developer-release-files = Files
# $platform is the system the file is for and $size its size
developer-release-file = { $platform } · { $size }
# $part is the part of the project the file belongs to
developer-release-file-part = { $part } for { $platform } · { $size }

## A release's checks

developer-checks-title = Checks
developer-checks-details = Details
# $count is how many checks passed besides the ones shown
developer-checks-more-passed = { $count ->
    [one] { $count } more passed
   *[other] { $count } more passed
}
developer-checks-all-passed = { $count ->
    [one] All { $count } passed
   *[other] All { $count } passed
}
# $version is the release's version
developer-checks-of = Checks of { $version }
developer-fix-namespace = Prove the namespace your app id is under, then publish again.
developer-fix-version = Publish a release with a version higher than your last one.
developer-fix-platforms = Name each file for its system, like …-linux-x86_64.AppImage.
developer-fix-files = Publish again from the same workflow.
developer-fix-attestation = Give the publish job attestations: write, and publish from the workflow you connected.
developer-fix-listing = Fill in what the listing is missing, then publish again.
developer-fix-permissions = If it really needs more, say why in the release notes. People are asked before they update.
developer-fix-impersonation = A person looks at this in review. If the name is yours, there is nothing to do.
developer-fix-licence = Add a LICENSE file with an open licence, or set it in the listing.

## A release's rollout

developer-rollout-resume = Resume
developer-rollout-pause = Pause
developer-rollout-resumed = Rollout resumed
developer-rollout-set = Set percentage
developer-rollout-everyone-button = Release to everyone
developer-rollout-progress = Rollout
# $version is the version a rollback goes back to
developer-rollout-roll-back-to = Roll back to { $version }
# $version is the version being rolled out
developer-rollout-stops = Stops { $version } for everyone
developer-rollout-roll-back = Roll back
# $percent is already formatted, such as 40%
developer-rollout-reaches = { $version } reaches { $percent } of people
developer-rollout-everyone-title = Release { $version } to everyone?
developer-rollout-everyone-description = Everyone gets it with their next update check.
developer-rollout-out = { $version } is out for everyone
developer-rollout-dialog-title = Set the rollout
developer-rollout-dialog-description = It keeps rising a step a day from there unless you pause it.
developer-rollout-percentage = Rollout percentage
developer-rollout-set-to = Set to { $percent }

## Offering a release on another channel

# $version is the release's version
developer-promote-title = Offer { $version } on another channel
developer-promote-channel = Channel
developer-promote-offer = Offer it
# $channel is the channel it's now offered on too
developer-promote-done = { $version } is on { $channel } too
