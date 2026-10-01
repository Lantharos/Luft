#!/usr/bin/env bash
set -euo pipefail

directory="$1"
socket="$2"
mkdir -p "$directory"/{root,spool/tmp,cache,state,log,out}

cat > "$directory/root/cups-files.conf" <<EOF
FileDevice Yes
PassEnv DBUS_SYSTEM_BUS_ADDRESS
ServerRoot $directory/root
RequestRoot $directory/spool
TempDir $directory/spool/tmp
CacheDir $directory/cache
StateDir $directory/state
ServerBin /usr/lib/cups
DataDir /usr/share/cups
AccessLog $directory/log/access_log
ErrorLog $directory/log/error_log
PageLog $directory/log/page_log
EOF

cat > "$directory/root/cupsd.conf" <<EOF
Listen $socket
Browsing No
WebInterface No
DefaultAuthType None
<Policy default>
  <Limit All>
    Order deny,allow
  </Limit>
</Policy>
EOF

ppd() {
  local model="$1" color="$2" duplex="$3"
  cat <<EOF
*PPD-Adobe: "4.3"
*FormatVersion: "4.3"
*FileVersion: "1.0"
*LanguageVersion: English
*LanguageEncoding: ISOLatin1
*PCFileName: "KESTREL.PPD"
*Manufacturer: "Kestrel"
*Product: "($model)"
*ModelName: "$model"
*ShortNickName: "$model"
*NickName: "$model"
*PSVersion: "(3010.000) 0"
*LanguageLevel: "3"
*ColorDevice: $color
*DefaultColorSpace: $([[ $color == True ]] && echo RGB || echo Gray)
*FileSystem: False
*Throughput: "1"
*cupsFilter2: "application/vnd.cups-pdf application/pdf 0 -"
*OpenUI *PageSize/Media Size: PickOne
*OrderDependency: 10 AnySetup *PageSize
*DefaultPageSize: A4
*PageSize A4/A4: "<</PageSize[595 842]>>setpagedevice"
*PageSize A5/A5: "<</PageSize[420 595]>>setpagedevice"
*PageSize Letter/US Letter: "<</PageSize[612 792]>>setpagedevice"
*PageSize Legal/US Legal: "<</PageSize[612 1008]>>setpagedevice"
*CloseUI: *PageSize
*OpenUI *PageRegion: PickOne
*OrderDependency: 10 AnySetup *PageRegion
*DefaultPageRegion: A4
*PageRegion A4/A4: "<</PageSize[595 842]>>setpagedevice"
*PageRegion A5/A5: "<</PageSize[420 595]>>setpagedevice"
*PageRegion Letter/US Letter: "<</PageSize[612 792]>>setpagedevice"
*PageRegion Legal/US Legal: "<</PageSize[612 1008]>>setpagedevice"
*CloseUI: *PageRegion
*DefaultImageableArea: A4
*ImageableArea A4/A4: "18 18 577 824"
*ImageableArea A5/A5: "18 18 402 577"
*ImageableArea Letter/US Letter: "18 18 594 774"
*ImageableArea Legal/US Legal: "18 18 594 990"
*DefaultPaperDimension: A4
*PaperDimension A4/A4: "595 842"
*PaperDimension A5/A5: "420 595"
*PaperDimension Letter/US Letter: "612 792"
*PaperDimension Legal/US Legal: "612 1008"
EOF
  if [[ $duplex == True ]]; then
    cat <<EOF
*OpenUI *Duplex/2-Sided Printing: PickOne
*OrderDependency: 10 AnySetup *Duplex
*DefaultDuplex: None
*Duplex None/Off: "<</Duplex false>>setpagedevice"
*Duplex DuplexNoTumble/Long Edge: "<</Duplex true/Tumble false>>setpagedevice"
*Duplex DuplexTumble/Short Edge: "<</Duplex true/Tumble true>>setpagedevice"
*CloseUI: *Duplex
EOF
  fi
  if [[ $color == True ]]; then
    cat <<EOF
*OpenUI *ColorModel/Color Mode: PickOne
*OrderDependency: 10 AnySetup *ColorModel
*DefaultColorModel: RGB
*ColorModel Gray/Grayscale: "<</cupsColorSpace 0>>setpagedevice"
*ColorModel RGB/Color: "<</cupsColorSpace 1>>setpagedevice"
*CloseUI: *ColorModel
EOF
  fi
}
ppd 'Office Printer' True True > "$directory/office.ppd"
ppd 'Label Printer' False False > "$directory/label.ppd"

rm -f "$socket"
cupsd -f -c "$directory/root/cupsd.conf" -s "$directory/root/cups-files.conf" &
server=$!
trap 'kill $server' EXIT
until [[ -S "$socket" ]]; do
  kill -0 "$server"
  sleep 0.05
done

export CUPS_SERVER="$socket"
: > "$directory/out/office.pdf"
: > "$directory/out/label.pdf"
lpadmin -p Office -E -v "file://$directory/out/office.pdf" -P "$directory/office.ppd" -D 'Office Printer' -L 'Second floor' 2> /dev/null
lpadmin -p Labels -E -v "file://$directory/out/label.pdf" -P "$directory/label.ppd" -D 'Label Printer' 2> /dev/null
lpadmin -d Office
wait "$server"
