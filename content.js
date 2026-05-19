// content.js

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const adSelectors = [
    '.ad-banner', '#advertisement', '.promo-box', '.sponsored-post', 
    '[id^="google_ads_"]', '[class*="banner-ad"]', 'ytd-ad-slot-renderer'
];

function cleanWebpage() {
    // 1. Görgetés feloldása
    if (document.body && (window.getComputedStyle(document.body).overflow === 'hidden')) {
        document.body.style.setProperty('overflow', 'auto', 'important');
    }

    // 2. Kozmetikai szűrés
    adSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 3. Anti-Adblock popupok
    document.querySelectorAll('div[style*="fixed"]').forEach(div => {
        if (parseInt(window.getComputedStyle(div).zIndex) > 1000) {
            const text = div.innerText.toLowerCase();
            if (text.includes('adblock') || text.includes('hirdetésblokkoló')) {
                div.remove();
            }
        }
    });
    huntAndLearnAds();
}

// Videó hirdetés átugró - Finomított logika
function destroyVideoAds() {
    const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
    if (skipBtn) {
        skipBtn.click();
        return;
    }

    const video = document.querySelector('video');
    const adOverlay = document.querySelector('.ad-showing, .ytp-ad-player-overlay');
    
    if (adOverlay && video && !video.paused) {
        video.currentTime = video.duration - 0.1;
        video.playbackRate = 16.0;
    }
}

// Eseménykezelők
const optimizedObserver = debounce(cleanWebpage, 300);
if (document.body) {
    new MutationObserver(optimizedObserver).observe(document.body, { childList: true, subtree: true });
}

setInterval(() => {
    if (!document.hidden) {
        destroyVideoAds();
    }
}, 500);
cleanWebpage();

// Dinamikus vadászat
function huntAndLearnAds() {
    document.querySelectorAll('iframe[src], img[src]').forEach(el => {
        try {
            const url = new URL(el.src);
            const currentHost = window.location.hostname.replace('www.', '');
            const targetHost = url.hostname.replace('www.', '');

            if (targetHost && targetHost !== currentHost) {
                const suspicious = /adsystem|banner|tracker|taboola|outbrain|ads\./i;
                if (suspicious.test(url.href)) {
                    el.remove();
                    chrome.runtime.sendMessage({ type: 'LEARN_NEW_AD_DOMAIN', domain: targetHost });
                }
            }
        } catch(e) {}
    });
}