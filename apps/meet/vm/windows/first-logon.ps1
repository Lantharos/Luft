$ErrorActionPreference = 'Continue'

$drivers = Get-PSDrive -PSProvider FileSystem | Where-Object { Test-Path (Join-Path $_.Root 'virtio-win-gt-x64.msi') } | Select-Object -First 1
Start-Process msiexec -Wait -ArgumentList '/i', (Join-Path $drivers.Root 'virtio-win-gt-x64.msi'), '/qn', '/norestart'
Start-Process msiexec -Wait -ArgumentList '/i', (Join-Path $drivers.Root 'guest-agent\qemu-ga-x86_64.msi'), '/qn', '/norestart'

$updates = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU'
New-Item -Path $updates -Force | Out-Null
Set-ItemProperty -Path $updates -Name NoAutoUpdate -Value 1 -Type DWord
Set-ItemProperty -Path $updates -Name NoAutoRebootWithLoggedOnUsers -Value 1 -Type DWord

$personalization = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\Personalization'
New-Item -Path $personalization -Force | Out-Null
Set-ItemProperty -Path $personalization -Name NoLockScreen -Value 1 -Type DWord

powercfg /change standby-timeout-ac 0
powercfg /change monitor-timeout-ac 0
powercfg /hibernate on
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power' -Name HiberbootEnabled -Value 1 -Type DWord

Stop-Computer -Force
