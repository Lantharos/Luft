export const BUS_NAME = 'org.gnome.SessionManager';
export const MANAGER_PATH = '/org/gnome/SessionManager';
export const FAREWELL_DURATION = 250;

export const InhibitFlags = { LOGOUT: 1, SWITCH: 2, SUSPEND: 4, IDLE: 8, AUTOMOUNT: 16 };
export const ActionAvailability = { UNAVAILABLE: 0, BLOCKED: 1, CHALLENGE: 2, AVAILABLE: 3 };
export const PresenceStatus = { AVAILABLE: 0, INVISIBLE: 1, BUSY: 2, IDLE: 3 };

export const MANAGER_XML = `<node><interface name="org.gnome.SessionManager">
  <method name="Setenv"><arg type="s" direction="in"/><arg type="s" direction="in"/></method>
  <method name="GetLocale"><arg type="i" direction="in"/><arg type="s" direction="out"/></method>
  <method name="RegisterClient"><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="o" direction="out"/></method>
  <method name="UnregisterClient"><arg type="o" direction="in"/></method>
  <method name="Inhibit">
    <arg type="s" direction="in"/><arg type="u" direction="in"/><arg type="s" direction="in"/><arg type="u" direction="in"/>
    <arg type="u" direction="out"/>
  </method>
  <method name="Uninhibit"><arg type="u" direction="in"/></method>
  <method name="IsInhibited"><arg type="u" direction="in"/><arg type="b" direction="out"/></method>
  <method name="GetInhibitors"><arg type="ao" direction="out"/></method>
  <method name="IsSessionRunning"><arg type="b" direction="out"/></method>
  <method name="Logout"><arg type="u" direction="in"/></method>
  <method name="Shutdown"/>
  <method name="Reboot"/>
  <method name="Suspend"/>
  <method name="CanShutdown"><arg type="u" direction="out"/></method>
  <method name="CanReboot"><arg type="u" direction="out"/></method>
  <method name="CanSuspend"><arg type="u" direction="out"/></method>
  <property name="SessionName" type="s" access="read"/>
  <property name="SessionClass" type="s" access="read"/>
  <property name="SessionIsActive" type="b" access="read"/>
  <property name="SessionIsLocked" type="b" access="read"/>
  <property name="InhibitedActions" type="u" access="read"/>
  <property name="RestoreSupported" type="b" access="read"/>
  <signal name="ClientAdded"><arg type="o"/></signal>
  <signal name="ClientRemoved"><arg type="o"/></signal>
  <signal name="InhibitorAdded"><arg type="o"/></signal>
  <signal name="InhibitorRemoved"><arg type="o"/></signal>
  <signal name="SessionRunning"/>
  <signal name="SessionOver"/>
</interface></node>`;

export const INHIBITOR_XML = `<node><interface name="org.gnome.SessionManager.Inhibitor">
  <method name="GetAppId"><arg type="s" direction="out"/></method>
  <method name="GetClientId"><arg type="o" direction="out"/></method>
  <method name="GetReason"><arg type="s" direction="out"/></method>
  <method name="GetFlags"><arg type="u" direction="out"/></method>
</interface></node>`;

export const CLIENT_XML = `<node><interface name="org.gnome.SessionManager.ClientPrivate">
  <method name="EndSessionResponse"><arg type="b" direction="in"/><arg type="s" direction="in"/></method>
  <signal name="Stop"/>
  <signal name="QueryEndSession"><arg type="u"/></signal>
  <signal name="EndSession"><arg type="u"/></signal>
  <signal name="CancelEndSession"/>
</interface></node>`;

export const PRESENCE_XML = `<node><interface name="org.gnome.SessionManager.Presence">
  <method name="SetStatus"><arg type="u" direction="in"/></method>
  <method name="SetStatusText"><arg type="s" direction="in"/></method>
  <property name="status" type="u" access="readwrite"/>
  <property name="status-text" type="s" access="readwrite"/>
  <signal name="StatusChanged"><arg type="u"/></signal>
  <signal name="StatusTextChanged"><arg type="s"/></signal>
</interface></node>`;
