<p align="center">
  <img src="./.github/assets/banner.svg" alt="AdBlocker — Blocks ads. Collects nothing." width="100%" />
</p>

<p align="center">
  <samp>JAVASCRIPT · CHROME MANIFEST V3 · DECLARATIVENETREQUEST</samp>
</p>

### <samp>01 — WHAT IT IS</samp>

A minimal, fast ad blocker for Chrome and other Chromium browsers that collects nothing.

Most popular blockers are now owned or run by companies with something to sell. Some track
what you browse, and some let paid "acceptable ads" through. This one does neither. It has
no telemetry and no allowlist for sale, and the whole thing is a handful of files you can
read.

### <samp>02 — WHAT IT BLOCKS</samp>

It is built on Manifest V3 and Chrome's own `declarativeNetRequest` engine, with a second
line of defence that runs inside the page.

1. **Network-level blocking.** Ad servers, scripts, trackers, images and `XHR` / `fetch`
   requests are blocked from static rule lists and from domains learned at runtime.
2. **Pop-ups.** `window.open` is overridden in the page's own context, which stops the
   click-triggered windows that slip past network rules.
3. **Redirects.** `main_frame` protection stops a page from sending you to an ad platform
   or phishing site against your will.
4. **Domain learning.** When a request matches a suspicious ad-network pattern, the domain
   is learned on the fly and stays blocked.
5. **A counter that survives restarts.** Blocked items are counted in
   `chrome.storage.local`, so the number does not reset when the browser or the service
   worker restarts.

Nothing is collected, stored remotely or sent anywhere. Statistics and rules stay on your
device.

### <samp>03 — INSTALL</samp>

It is loaded as an unpacked extension:

1. Download or clone this repository.
2. Open `chrome://extensions/`.
3. Turn on **Developer mode** in the top right.
4. Click **Load unpacked** and choose the folder that contains `manifest.json`.

### <samp>04 — LAYOUT</samp>

| File | Role |
|---|---|
| `manifest.json` | Extension configuration and permissions (Manifest V3) |
| `background.js` | Service worker: manages network rules and saves statistics |
| `content.js` | Isolated-world script that bridges the page and the extension |
| `page_context.js` | Runs in the page's `MAIN` world to block pop-ups and injected scripts |
| `popup.html`, `popup.js` | The popup UI and the counter |
| `rules1.json` … `rules4.json` | Static `declarativeNetRequest` rule sets |
| `hosts.txt`, `konvertalo.py` | A hosts list and the script that converts it into rule sets |

### <samp>05 — LICENCE</samp>

Open source. Read it, change it, make it yours.

<br />

<p align="center">
  <sub><samp>MORE WORK AT <a href="https://github.com/Deatron01">GITHUB.COM/DEATRON01</a></samp></sub>
</p>
