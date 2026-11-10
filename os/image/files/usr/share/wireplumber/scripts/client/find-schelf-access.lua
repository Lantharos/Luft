-- Luft
--
-- Keeps apps in Schelf's sandbox from recording sound or using a camera
-- until the person allowed it. Such an app only gets streams of its own:
-- it cannot make links, and the session manager does not link anything into
-- a node of its unless the permission store holds "yes" for it under
-- devices/microphone (sound) or devices/camera (video).

cutils = require ("common-utils")
log = Log.open_topic ("s-client")

INSTANCE_PREFIX = "schelf-"
TABLE = "devices"
KINDS = { Audio = "microphone", Video = "camera" }
ALLOWED = "yes"

pps_plugin = Plugin.find ("portal-permissionstore")
answers = {}

function appOf (client)
  local properties = client.properties
  if cutils.get_client_access (properties) ~= "flatpak" then
    return nil
  end
  local instance = properties ["pipewire.access.portal.instance_id"]
  if instance == nil or instance:sub (1, #INSTANCE_PREFIX) ~= INSTANCE_PREFIX then
    return nil
  end
  return properties ["pipewire.access.portal.app_id"] or ""
end

function allowed (app, kind)
  if pps_plugin == nil then
    return false
  end
  if answers [kind] == nil then
    answers [kind] = pps_plugin:call ("lookup", TABLE, kind) or {}
  end
  local answer = answers [kind] [app]
  return answer ~= nil and answer [1] == ALLOWED
end

function ownerOf (node)
  local id = node.properties ["client.id"]
  return id and cutils.get_object_manager ("client"):lookup {
    Constraint { "bound-id", "=", id, type = "gobject" },
  }
end

-- Whether nothing may be linked into the node: it belongs to a sandboxed app
-- that was not given what its kind of media needs.
function refused (node)
  local class = node.properties ["media.class"] or ""
  local kind = KINDS [class:match ("Audio") or class:match ("Video")]
  local owner = kind and ownerOf (node)
  local app = owner and appOf (owner)
  return app ~= nil and not allowed (app, kind)
end

function receives (linkable)
  return linkable.properties ["item.node.direction"] == "input"
end

schelf_pm = PermissionManager ()
schelf_pm:set_default_permissions (Perm.RX)
schelf_pm:add_interest_match_simple (Perm.NONE,
  Interest {
    type = "factory",
    Constraint { "factory.name", "!", "client-node", type = "pw-global" },
  }
)

SimpleEventHook {
  name = "client/find-schelf-access",
  before = { "client/find-flatpak-access", "client/find-default-access" },
  after = "client/find-config-access",
  interests = {
    EventInterest {
      Constraint { "event.type", "=", "select-access" },
    },
  },
  execute = function (event)
    local client = event:get_subject ()
    if event:get_data ("permission-manager") == nil and appOf (client) ~= nil then
      log:info (client, "Found Schelf sandbox PM for client")
      event:set_data ("permission-manager", schelf_pm)
    end
  end
}:register ()

SimpleEventHook {
  name = "linking/refuse-schelf-capture",
  after = { "linking/find-defined-target",
            "linking/find-audio-group-target",
            "linking/find-filter-target",
            "linking/find-media-role-target",
            "linking/find-media-role-sink-target",
            "linking/find-default-target",
            "linking/find-best-target",
            "linking/get-filter-from-target" },
  before = "linking/prepare-link",
  interests = {
    EventInterest {
      Constraint { "event.type", "=", "select-target" },
    },
  },
  execute = function (event)
    local si = event:get_subject ()
    local target = event:get_data ("target")
    local receiver = receives (si) and si or target
    if receiver == nil then
      return
    end
    local node = receiver:get_associated_proxy ("node")
    if refused (node) then
      log:info (node, "Not linking into a sandboxed app without permission")
      event:stop_processing ()
    end
  end
}:register ()

function unlinkRefused ()
  local nodes = cutils.get_object_manager ("node")
  for link in cutils.get_object_manager ("link"):iterate () do
    local node = nodes:lookup {
      Constraint { "bound-id", "=", link.properties ["link.input.node"], type = "gobject" },
    }
    if node and refused (node) then
      link:request_destroy ()
    end
  end
end

if pps_plugin ~= nil then
  pps_plugin:connect ("changed", function (_, table, id, deleted, permissions)
    if table == TABLE and answers [id] ~= nil then
      answers [id] = (not deleted and permissions) or {}
      unlinkRefused ()
      Plugin.find ("standard-event-source"):call ("schedule-rescan", "linking")
    end
  end)
end

schelf_pm:activate (Features.ALL, function (_, e)
  if e then
    log:warning ("failed to activate the Schelf sandbox permission manager: " ..
        tostring (e))
  end
end)
