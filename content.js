// Késleltető függvény: csak akkor fut le, ha az események után eltelt X ezredmásodperc
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Anti-adblock és kozmetikai szűrés logika
function cleanWebpage() {
    // 1. Görgetés feloldása (Anti-adblock védelem)
    if (document.body && (document.body.style.overflow === 'hidden' || document.body.style.position === 'fixed')) {
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
    }

    // 2. Kozmetikai szűrés (üres reklámhelyek és popupok eltüntetése)
    const badClassesAndIDs = [
        'ad-banner', 'advertisement', 'promo-box', 'sponsored-post', 'cookie-consent'
    ];

    // Elemek eltüntetése CSS osztályok és azonosítók alapján
    badClassesAndIDs.forEach(selector => {
        document.querySelectorAll(`.${selector}, #${selector}`).forEach(el => {
            el.style.display = 'none';
        });
    });

    // 3. Tipikus Anti-Adblock popupok megsemmisítése
    document.querySelectorAll('div').forEach(div => {
        const style = window.getComputedStyle(div);
        const zIndex = parseInt(style.zIndex);
        
        if (style.position === 'fixed' && zIndex > 1000) {
            const text = div.innerText.toLowerCase();
            if (text.includes('adblock') || text.includes('hirdetésblokkoló')) {
                console.log("Anti-adblocker kiütve:", div);
                div.remove();
            }
        }
    });
    huntAndLearnAds();
}

// Az optimalizált figyelő, amely maximum 300 ms-enként fut le, hiába van 1000 DOM változás
const optimizedObserver = debounce(() => {
    cleanWebpage();
}, 300);

// Futtatás betöltéskor
cleanWebpage();

// Observer indítása
if (document.body) {
    const observer = new MutationObserver(optimizedObserver);
    observer.observe(document.body, { childList: true, subtree: true });
}

// =========================================================================
// AGRESSZÍV POP-UP ÉS ÁTIRÁNYÍTÁS BLOKKOLÓ
// =========================================================================

// 1. Kattintások elfogása (Pop-under és idegen új lapok elleni védelem)
// A 'true' paraméter a végén (capture phase) garantálja, hogy mi kapjuk meg a kattintást legelőször!
document.addEventListener('click', function(e) {
    // Megkeressük, hogy a kattintás egy linken (<a>) történt-e
    let target = e.target.closest('a');
    
    if (target && target.href) {
        try {
            let targetUrl = new URL(target.href);
            let currentUrl = new URL(window.location.href);
            
            // Lekapjuk a 'www.' részt, hogy az összehasonlítás pontosabb legyen
            let cleanTargetHost = targetUrl.hostname.replace('www.', '');
            let cleanCurrentHost = currentUrl.hostname.replace('www.', '');
            
            // HA a link új lapon nyílna meg (_blank) ÉS teljesen más domainre visz
            if (target.target === '_blank' && cleanTargetHost !== cleanCurrentHost) {
                // Megakadályozzuk az alapértelmezett böngészőműködést (a lap megnyitását)
                e.preventDefault(); 
                
                // Opcionális: Kérünk egy megerősítést a felhasználótól. 
                // Ha biztosan át akar menni, rákattinthat az OK-ra.
                let userConfirmed = confirm(
                    "⚠️ Az Adblocker megállított egy idegen oldalra mutató új lapot!\n\n" +
                    "Eredeti oldal: " + cleanCurrentHost + "\n" +
                    "Idegen oldal: " + cleanTargetHost + "\n\n" +
                    "Biztosan meg akarod nyitni ezt az oldalt?"
                );
                
                if (userConfirmed) {
                    // Ha a felhasználó rányomott az OK-ra, megnyitjuk az oldalt
                    window.location.href = target.href;
                } else {
                    console.log("🚫 Idegen oldalra mutató kattintás blokkolva.");
                }
            }
        } catch(err) {
            // Ha a link formátuma érvénytelen (pl. javascript:void(0)), hagyjuk békén
        }
    }
}, true);


// =========================================================================
// DINAMIKUS HEURISZTIKUS VADÁSZAT
// =========================================================================

function huntAndLearnAds() {
    // 1. Keresünk olyan elemeket, amik tipikusan hirdetéseket töltenek be
    const mediaElements = document.querySelectorAll('iframe, img');

    mediaElements.forEach(el => {
        let urlStr = el.src;
        if (!urlStr) return;

        try {
            let url = new URL(urlStr);
            let currentHost = window.location.hostname.replace('www.', '');
            let targetHost = url.hostname.replace('www.', '');

            // 2. Ha az elem egy MÁSIK domainről töltődik be, megvizsgáljuk
            if (targetHost !== '' && targetHost !== currentHost) {
                
                // Kulcsszavak, amik szinte mindig trackerre vagy hirdetésre utalnak
                const suspiciousKeywords = /adsystem|banner|sponsor|tracker|click|taboola|outbrain|syndication|ads\./i;
                
                // Vagy kulcsszó egyezés van a hosztban/elérési útban, VAGY tipikus hirdetési azonosítót látunk
                if (suspiciousKeywords.test(url.href) || el.id.toLowerCase().includes('ad-')) {
                    
                    console.log("🔥 [Content] Dinamikus ad vadász fogás:", targetHost);

                    // A) Kíméletlenül eltüntetjük az oldalról
                    el.remove();

                    // B) Beküldjük a Service Workernek, hogy tegye rá a globális tiltólistára
                    chrome.runtime.sendMessage({
                        type: 'LEARN_NEW_AD_DOMAIN',
                        domain: targetHost
                    });
                }
            }
        } catch(e) {
            // Nem érvényes URL (pl. data:image/png;base64...), ezt átugorjuk
        }
    });
}

// =========================================================================
// 1. AGRESSZÍV CSS INJEKTÁLÁS (KOZMETIKAI ATOMBOMBA)
// =========================================================================
function injectAggressiveCSS() {
    if (document.getElementById('pro-adblock-css')) return;

    const style = document.createElement('style');
    style.id = 'pro-adblock-css';
    // Kíméletlenül elrejtjük a leggyakoribb hirdetési konténereket és iframe-eket
    style.textContent = `
        [id^="google_ads_"],
        [id^="div-gpt-ad-"],
        [class*="sponsor"],
        [class*="banner-ad"],
        [class*="ad-container"],
        .ad-showing,
        .video-ads,
        .ytp-ad-module,
        ytd-promoted-sparkles-web-renderer,
        ytd-in-feed-ad-layout-renderer,
        ytd-ad-slot-renderer,
        iframe[src*="ads"],
        iframe[src*="doubleclick"],
        iframe[name^="google_ads"] {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    `;
    (document.head || document.documentElement).appendChild(style);
}

// Futtatjuk a CSS befecskendezést azonnal
injectAggressiveCSS();

// =========================================================================
// 2. VIDEÓS HIRDETÉS ÁTUGRÓ (YOUTUBE ÉS MÁSOK)
// =========================================================================
function destroyVideoAds() {
    // 1. Lépés: Keresünk "Átugrás" (Skip) gombokat, és rákattintunk
    const skipButtons = document.querySelectorAll(`
        .ytp-ad-skip-button, 
        .ytp-ad-skip-button-modern, 
        .videoAdUiSkipButton, 
        [class*="skip-button"],
        [class*="ad-skip"]
    `);
    
    skipButtons.forEach(btn => {
        btn.click();
        console.log("⏭️ [Video Ad Skipper] Átugrás gomb megnyomva!");
    });

    // 2. Lépés: Ha a videó "reklám" állapotban van, de nem lehet átugrani (Unskippable)
    // Megkeressük a hirdetést jelző rétegeket
    const adIsPlaying = document.querySelector('.ad-showing, .ytp-ad-player-overlay, .video-ads, [class*="ad-interrupt"]');
    
    if (adIsPlaying) {
        // Megfogjuk a HTML5 videó elemeket az oldalon
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            // Ha érvényes a videó hossza, a legvégére pörgetjük (mintha végignézted volna)
            if (!Number.isNaN(video.duration)) {
                video.currentTime = video.duration;
                // Felgyorsítjuk 16x-os sebességre biztos, ami biztos
                video.playbackRate = 16.0; 
                console.log("⏩ [Video Ad Skipper] Kötelező hirdetés átpörgetve!");
            }
        });
    }
}

// A videós hirdetések állapota tizedmásodpercek alatt változik, 
// és gyakran nem váltanak ki DOM változást, így a MutationObserver ide nem elég gyors.
// Egy nagyon gyors (500 ms) ismétlődő ciklust (setInterval) használunk.
setInterval(destroyVideoAds, 500);