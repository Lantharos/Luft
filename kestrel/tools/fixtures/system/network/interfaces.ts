export const NETWORK_MANAGER_XML = `<node>
<interface name="org.freedesktop.NetworkManager">
  <property name="Version" type="s" access="read"/>
  <property name="State" type="u" access="read"/>
  <property name="Connectivity" type="u" access="read"/>
  <property name="ConnectivityCheckAvailable" type="b" access="read"/>
  <property name="ConnectivityCheckEnabled" type="b" access="read"/>
  <property name="ConnectivityCheckUri" type="s" access="read"/>
  <property name="NetworkingEnabled" type="b" access="read"/>
  <property name="WirelessEnabled" type="b" access="readwrite"/>
  <property name="WirelessHardwareEnabled" type="b" access="read"/>
  <property name="Devices" type="ao" access="read"/>
  <property name="AllDevices" type="ao" access="read"/>
  <property name="ActiveConnections" type="ao" access="read"/>
  <property name="PrimaryConnection" type="o" access="read"/>
  <property name="PrimaryConnectionType" type="s" access="read"/>
  <method name="CheckConnectivity"><arg type="u" direction="out"/></method>
  <method name="ActivateConnection">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="o" direction="out"/>
  </method>
  <method name="AddAndActivateConnection">
    <arg type="a{sa{sv}}" direction="in"/><arg type="o" direction="in"/><arg type="o" direction="in"/>
    <arg type="o" direction="out"/><arg type="o" direction="out"/>
  </method>
  <signal name="DeviceAdded"><arg type="o"/></signal>
  <signal name="DeviceRemoved"><arg type="o"/></signal>
</interface>
<interface name="org.freedesktop.NetworkManager.AgentManager">
  <method name="Register"><arg type="s" direction="in"/></method>
  <method name="RegisterWithCapabilities"><arg type="s" direction="in"/><arg type="u" direction="in"/></method>
  <method name="Unregister"/>
</interface>
<interface name="org.freedesktop.NetworkManager.Settings">
  <property name="Connections" type="ao" access="read"/>
  <property name="CanModify" type="b" access="read"/>
  <signal name="NewConnection"><arg type="o"/></signal>
  <signal name="ConnectionRemoved"><arg type="o"/></signal>
</interface>
<interface name="org.freedesktop.NetworkManager.Settings.Connection">
  <property name="Unsaved" type="b" access="read"/>
  <method name="GetSettings"><arg type="a{sa{sv}}" direction="out"/></method>
  <method name="Delete"/>
  <signal name="Removed"/>
</interface>
<interface name="org.freedesktop.NetworkManager.Connection.Active">
  <property name="Connection" type="o" access="read"/>
  <property name="SpecificObject" type="o" access="read"/>
  <property name="Id" type="s" access="read"/>
  <property name="Uuid" type="s" access="read"/>
  <property name="Type" type="s" access="read"/>
  <property name="Devices" type="ao" access="read"/>
  <property name="State" type="u" access="read"/>
  <property name="Default" type="b" access="read"/>
  <signal name="StateChanged"><arg type="u"/><arg type="u"/></signal>
</interface>
<interface name="org.freedesktop.NetworkManager.Device">
  <property name="Interface" type="s" access="read"/>
  <property name="DeviceType" type="u" access="read"/>
  <property name="Managed" type="b" access="read"/>
  <property name="Real" type="b" access="read"/>
  <property name="State" type="u" access="read"/>
  <property name="StateReason" type="(uu)" access="read"/>
  <property name="ActiveConnection" type="o" access="read"/>
  <property name="AvailableConnections" type="ao" access="read"/>
</interface>
<interface name="org.freedesktop.NetworkManager.Device.Wired">
  <property name="HwAddress" type="s" access="read"/>
  <property name="Speed" type="u" access="read"/>
  <property name="Carrier" type="b" access="read"/>
</interface>
<interface name="org.freedesktop.NetworkManager.Device.Wireless">
  <property name="HwAddress" type="s" access="read"/>
  <property name="PermHwAddress" type="s" access="read"/>
  <property name="Mode" type="u" access="read"/>
  <property name="Bitrate" type="u" access="read"/>
  <property name="AccessPoints" type="ao" access="read"/>
  <property name="ActiveAccessPoint" type="o" access="read"/>
  <property name="WirelessCapabilities" type="u" access="read"/>
  <property name="LastScan" type="x" access="read"/>
  <method name="GetAccessPoints"><arg type="ao" direction="out"/></method>
  <method name="GetAllAccessPoints"><arg type="ao" direction="out"/></method>
  <method name="RequestScan"><arg type="a{sv}" direction="in"/></method>
</interface>
<interface name="org.freedesktop.NetworkManager.AccessPoint">
  <property name="Flags" type="u" access="read"/>
  <property name="WpaFlags" type="u" access="read"/>
  <property name="RsnFlags" type="u" access="read"/>
  <property name="Ssid" type="ay" access="read"/>
  <property name="Frequency" type="u" access="read"/>
  <property name="HwAddress" type="s" access="read"/>
  <property name="Mode" type="u" access="read"/>
  <property name="MaxBitrate" type="u" access="read"/>
  <property name="Strength" type="y" access="read"/>
  <property name="LastSeen" type="i" access="read"/>
</interface>
</node>`;

export const CONTROL_XML = `<node><interface name="com.lantharos.KestrelChecks.NetworkManager">
  <method name="SetConnectivity"><arg type="u" direction="in"/></method>
  <method name="SetConnectivityCheckUri"><arg type="s" direction="in"/></method>
  <method name="Checks"><arg type="u" direction="out"/></method>
  <method name="AddWifi"><arg type="a(sbs)" direction="in"/></method>
  <method name="RemoveWifi"/>
  <method name="AskSecrets"><arg type="s" direction="in"/></method>
  <method name="TakeSecretRequests"><arg type="a(ua{sa{sv}}ou)" direction="out"/></method>
  <method name="AnswerSecrets"><arg type="u" direction="in"/><arg type="b" direction="in"/></method>
  <method name="Forgotten"><arg type="as" direction="out"/></method>
</interface></node>`;
