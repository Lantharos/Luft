# Scanning

How Flatbed finds scanners, scans, cleans up pages and makes searchable PDFs. What people see is in [Flatbed](https://docs.luft.computer/apps/flatbed/); the code is in [apps/store/flatbed](../apps/store/flatbed).

Flatbed is a store app in its sandbox, so everything here happens inside it with what it declares: the network, USB devices, and reading Pictures and Downloads. Nothing runs as root and there's no helper outside the sandbox, unlike [printing](printing.md), since scanning needs nothing CUPS or the system hold.

## Finding scanners

| Kind | Found by | Spoken to |
| --- | --- | --- |
| Driverless scanners and all-in-ones (eSCL, also called AirScan) | mDNS `_uscan._tcp` and `_uscans._tcp`, browsed by Flatbed itself with `mdns-sd` | eSCL over HTTP, by Flatbed itself |
| USB scanners and all-in-ones that speak IPP over USB | `ipp-usb`, which announces their eSCL on the loopback interface | eSCL, as above |
| Canon PIXMA all-in-ones on the network | mDNS `_canon-bjnp1._tcp` | SANE's `pixma` driver over BJNP |
| Other USB scanners, and network scanners SANE finds itself | SANE | SANE's drivers |

A scanner found both ways shows once: an eSCL scanner hides a SANE device with the same address. SANE's own eSCL drivers (`airscan:e…` and `escl:`) are left out, since Flatbed speaks eSCL itself.

Canon's driver finds network printers by broadcasting, and the answers don't come back through the firewall, which only lets in what answers the computer's own connections and mDNS on home networks. So Flatbed writes the Canon printers it finds through mDNS into a `pixma.conf` of its own as `bjnp://ADDRESS` lines, in `~/.local/state/com.lantharos.Flatbed/sane`, and starts SANE with `SANE_CONFIG_DIR` naming that folder before the system's. Each line makes the driver ask that printer directly.

Scanners added by address are kept in Flatbed's settings and asked for their eSCL capabilities at each start, over HTTP and then HTTPS.

## eSCL

Flatbed reads `ScannerCapabilities` for the glass (`Platen`), the feeder (`Adf`, with `AdfDuplexInputCaps` for both sides), the colour modes, formats and resolutions, posts `ScanSettings` to `ScanJobs` for the whole area at 300 or 600 pixels per inch, as JPEG (PNG when that's all it has), and then asks for `NextDocument` until the scanner answers 404: once for the glass, as often as the feeder has paper otherwise. 503 means the scanner is still getting ready, and is asked again every second for a minute and a half. Each page streams in, and what has arrived is shown every 350 ms, so the page fills in while it scans. Cancelling deletes the job.

Scanners on a home network have certificates nobody signed, so HTTPS to a scanner (`_uscans`) is encrypted but can't be verified. Flatbed prefers plain `_uscan` when a scanner offers both.

## SANE

SANE's drivers are C code that talks to hardware, and some of them hang or crash on a scanner they don't understand, so Flatbed never loads them into its own process. It starts a second copy of itself with `--sane-helper`, in the same sandbox, which loads `libsane.so.1` with `dlopen` and answers requests on standard input:

| Request | Answer |
| --- | --- |
| `list` | Every device, with its sources, read by opening it, and the IPv4 address in its name for network ones |
| `scan` | Sets the source first, since changing it resets the rest, then the colour mode, the resolution closest to the one asked for and the largest area; then for each page the parameters, the raw lines as SANE reads them, and an end, until the feeder is empty or after one page from the glass |
| `cancel` | Calls `sane_cancel`, which SANE allows from another thread while a scan reads |

Answers are frames of a kind byte, a little endian length and the bytes: JSON for messages, raw lines for pixels. Flatbed puts the lines together into a page, 8 or 16 bits per channel, grey or colour, or one bit for line art, and shows what has arrived every 350 ms. A driver that doesn't stop within six seconds of a cancel has its helper killed; the next request starts a new one. Without SANE on the computer the helper says so and no SANE scanners show up.

Flatbed always scans in colour or grey and makes black and white itself, which keeps thin lines and handwriting that a scanner's own line art loses.

## Pages

Each page keeps its source picture as it arrived, its four corners on that picture, a number of quarter turns, where it came from (scanner, camera or picture) and, from a scanner, its resolution. The developed page is made again from those whenever the corners, the turn or the document's mode change, one page at a time on a thread of its own, so the window never waits. Everything lives in `~/.local/state/com.lantharos.Flatbed/document`: `document.json`, the sources, each page's current picture and thumbnail, and the words read on it.

### Finding the paper

On a picture shrunk to 480 pixels on its longer side, Flatbed looks for the paper two ways, with Canny edges and with the bright part of an Otsu threshold, takes the convex hull of each outline and reduces it to four corners. A candidate has to be convex, cover enough of the picture, have corners within 40° of square for photos, and cover at least 90% of its hull, so a round or ragged shape isn't taken for paper. The largest one wins, and its corners are pulled in 0.6% so no sliver of the table comes along.

On a scan, a paper smaller than the glass has to be nearly square in every corner and lie on a lid that's even all around it. When there's no paper to find, Flatbed straightens the page instead: it finds the angle, within 5°, at which the dark pixels fall into the sharpest rows, as lines of text do when they run level, and turns the page by it, losing as little as possible at the edges. Turns under 0.3° are left alone.

### Straightening

The page is cut out with the projective map from the four corners to a rectangle, sampled bilinearly. Its proportions come from the corners as a camera sees them, with the method in Zhang and He's *Whiteboard scanning and image enhancement* (2007), which works out the camera's focal length from the corners, so a page photographed at an angle comes out as long as it really is rather than as long as it looks.

### Evening out the light

In a 28 × 28 grid of cells, the brightest tenth of each cell is the paper's colour there, wherever the cell has any paper. A smooth surface is fitted through those colours, a plane for scans and a cubic for photos, three times, each time leaving out cells much darker than the fit, which hold pictures rather than paper. Cells of a photo that are darker than the fit but no more coloured are paper in a shadow and keep what they measured; the rest take the fit. Each pixel is divided by the paper's colour where it is, which turns the paper white and takes away the colour of a lamp, then the darkest half percent becomes black. A page that's mostly picture, where too few cells are paper, is left as it is.

Black and white is the grey page split at its Otsu level, kept between 150 and 215 so faint paper never turns black.

## Text

Text is read with Tesseract, run as `tesseract stdin stdout --psm 3 --dpi N -l LANGUAGES tsv` on the developed page in grey, with the scanner's resolution or, for photos, as wide as A4. Pages are read in the background as soon as they're developed, one at a time, with `OMP_THREAD_LIMIT=1` and at a lower priority, and the words are kept with the page's shape, so saving rarely waits; a page that changed is read again when it's saved.

| Package | Installed | Holds |
| --- | --- | --- |
| `tesseract`, `tesseract-libs`, `leptonica` | about 7 MB | Tesseract 5 |
| `tesseract-langpack-sqi`, `-deu`, `-hrv`, `-eng` | 11.6 MB | Albanian, German, Croatian and English, from `tessdata_fast` |
| `sane-backends`, `sane-backends-libs`, `sane-backends-drivers-scanners`, `sane-airscan` | about 16 MB | SANE and its drivers, and the udev rules that give the person at the computer their scanners |

Other languages are a system package away, such as `tesseract-langpack-fra`, and show up in Flatbed's settings once they're there. At first Flatbed reads in the languages of the session and English.

## PDFs

Flatbed writes PDFs itself with `pdf-writer`. Colour and grey pages are the JPEG files they were developed as, embedded unchanged. Black and white pages are one bit per pixel, compressed with Flate.

The text sits over each page invisibly (text render mode 3), each word stretched with horizontal scaling over the box it was read from, on its line's baseline. Its font is a Type 3 font whose one glyph draws nothing; each letter used gets a code in a font of up to 255 codes, as many fonts as the document needs, and each font's `ToUnicode` map turns codes back into letters, so any script searches and copies correctly without embedding a real font.

Pages are as large as they were scanned when the scanner said its resolution. A photo becomes A4 or Letter when its proportions are within 4% of either, in the direction it lies, and otherwise keeps its proportions at A4's width. A4 and Letter in the save dialog put every page on that paper, centred.

## Testing

`cargo clippy -p flatbed` and `bun run check` in `apps/store/flatbed`. A real scan needs a scanner on the network or plugged in. Without one, a stand-in eSCL scanner that serves `ScannerCapabilities`, accepts `ScanJobs` and streams a JPEG slowly from `NextDocument` is enough to try the whole path: add it by its address in Flatbed. SANE's `test` driver, turned on in a `dll.conf` in a folder named by `SANE_CONFIG_DIR`, gives a SANE scanner without hardware.
